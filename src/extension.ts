// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as vscode from 'vscode';
import { register as registerCellTags } from './cellTags';
import { register as registerCellTagsView } from './cellTagsTreeDataProvider';

export function activate(context: vscode.ExtensionContext) {
	registerCellTags(context);
	registerCellTagsView(context);

	// Update context when the active editor or selection changes
	vscode.window.onDidChangeActiveNotebookEditor(updateContext);
	vscode.window.onDidChangeNotebookEditorSelection(updateContext);

	updateContext();
}

function updateContext() {
    const editor = vscode.window.activeNotebookEditor;
    if (!editor) {
        vscode.commands.executeCommand('setContext', 'jupyter-cell-tags.singleCellSelected', false);
        vscode.commands.executeCommand('setContext', 'jupyter-cell-tags.multipleCellsSelected', false);
        return;
    }

    const selections: readonly vscode.NotebookRange[] = editor.selections; // NotebookRange[]
    const selectedRangesCount = selections.length;
    var total_num_selected_cells = 0;
    selections.forEach(selection => {
        const range = selection as vscode.NotebookRange;
        if (!range.isEmpty) {
            const num_selected_cells = range.end - range.start
            total_num_selected_cells += num_selected_cells;
        }
    });
    // TODO 2024-09-05 17:47: - [ ] Got num selected cells nearly working, it will always be correct to tell if 1 vs. many cells.
    // Noticed error below, there were only 3 cells in the notebook but it returned 4 cells. I think the last index should be excluded but then it would give zero for single cell selections?
    // Selection num ranges count: 1
    // 	Selected cells: Start(0), End(4)
    // Selection count: 4
    const selectionCount = total_num_selected_cells;
    vscode.commands.executeCommand('setContext', 'jupyter-cell-tags.singleCellSelected', selectionCount === 1);
    vscode.commands.executeCommand('setContext', 'jupyter-cell-tags.multipleCellsSelected', selectionCount > 1);
}


export function deactivate() {}
