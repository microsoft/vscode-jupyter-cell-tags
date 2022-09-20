// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as vscode from 'vscode';

export async function addCellTag(cell: vscode.NotebookCell, tags: string[]) {
    cell.metadata.custom.metadata.tags = cell.metadata.custom.metadata.tags ?? [];
    const newTags: string[] = [];
    for (const tag of tags) {
        if (!cell.metadata.custom.metadata.tags.includes(tag)) {
            newTags.push(tag);
        }
    }
    cell.metadata.custom.metadata.tags.push(...newTags);
    
    // create workspace edit to update tag
    const edit = new vscode.WorkspaceEdit();
    const nbEdit = vscode.NotebookEdit.updateCellMetadata(cell.index, {
        ...cell.metadata,
    });
    edit.set(cell.notebook.uri, [nbEdit]);
    await vscode.workspace.applyEdit(edit);
}

export class CellTagStatusBarProvider implements vscode.NotebookCellStatusBarItemProvider {
	provideCellStatusBarItems(cell: vscode.NotebookCell, token: vscode.CancellationToken): vscode.ProviderResult<vscode.NotebookCellStatusBarItem[]> {
		const items: vscode.NotebookCellStatusBarItem[] = [];
		cell.metadata.custom?.metadata?.tags?.forEach((tag: string) => {
			items.push({
				text: '$(close) ' + tag,
				tooltip: tag,
				command: {
					title: `Remove Tag ${tag}`,
					command: 'jupyter-cell-tags.removeTag',
					arguments: [cell, tag]
				},
				alignment: vscode.NotebookCellStatusBarAlignment.Left,
			});
		});

		if (items.length) {
			// add insert tag status bar item
			items.push({
				text: '$(plus) Tag',
				tooltip: 'Add Tag',
				command: {
					title: 'Add Tag',
					command: 'jupyter-cell-tags.addTag',
					arguments: [cell]
				},
				alignment: vscode.NotebookCellStatusBarAlignment.Left,
			});
		}

		return items;
	}
}

export function register(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.notebooks.registerNotebookCellStatusBarItemProvider('jupyter-notebook', new CellTagStatusBarProvider()));
	context.subscriptions.push(vscode.commands.registerCommand('jupyter-cell-tags.removeTag', async (cell: vscode.NotebookCell | string, tag: string) => {
		let activeCell: vscode.NotebookCell | undefined;
		if (typeof cell === 'string') {
			// find active cell
			const editor = vscode.window.activeNotebookEditor;
			if (!editor) {
				return;
			}

			activeCell = editor.notebook.cellAt(editor.selections[0].start);
			tag = cell;
		} else {
			activeCell = cell;
		}

		if (!activeCell) {
			return;
		}

        let tags = activeCell.metadata.custom.metadata.tags;
        if (tags) {
            // remove tag from tags
            const index = tags.indexOf(tag);
            if (index > -1) {
                tags.splice(index, 1);
            }
            activeCell.metadata.custom.metadata.tags = tags;

            // create workspace edit to update tag
            const edit = new vscode.WorkspaceEdit();
            const nbEdit = vscode.NotebookEdit.updateCellMetadata(activeCell.index, {
                ...activeCell.metadata,
            });
            edit.set(activeCell.notebook.uri, [nbEdit]);
            await vscode.workspace.applyEdit(edit);
        } else {
            return;
        }
	}));

	context.subscriptions.push(vscode.commands.registerCommand('jupyter-cell-tags.addTag', async (cell: vscode.NotebookCell | undefined) => {
		if (!cell) {
			// find active cell
			const editor = vscode.window.activeNotebookEditor;
			if (!editor) {
				return;
			}

			cell = editor.notebook.cellAt(editor.selections[0].start);
			if (!cell) {
				return;
			}
		}

		if (!cell) {
			return;
		}

		const tag = await vscode.window.showInputBox({
			placeHolder: 'Type to create a cell tag'
		});

		if (tag) {
			await addCellTag(cell, [tag]);
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('jupyter-cell-tags.paramaterize', async (cell: vscode.NotebookCell) => {
		await addCellTag(cell, ['parameters']);
	}));
}