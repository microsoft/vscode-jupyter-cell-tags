// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as vscode from 'vscode';

export function getCellTags(cell: vscode.NotebookCell): string[] {
    const currentTags =
        (useCustomMetadata() ? cell.metadata.custom?.metadata?.tags : cell.metadata.metadata?.tags) ?? [];
    return [...currentTags];
}

export async function updateCellTags(cell: vscode.NotebookCell, tags: string[]) {
    const metadata = JSON.parse(JSON.stringify(cell.metadata));
    if (useCustomMetadata()) {
        metadata.custom = metadata.custom || {};
        metadata.custom.tags = tags;
    } else {
        metadata.metadata = metadata.metadata || {};
        metadata.metadata.tags = tags;
    }
    const edit = new vscode.WorkspaceEdit();
    const nbEdit = vscode.NotebookEdit.updateCellMetadata(cell.index, metadata);
    edit.set(cell.notebook.uri, [nbEdit]);
    await vscode.workspace.applyEdit(edit);
}

function useCustomMetadata() {
    return !vscode.workspace.getConfiguration('jupyter').get<boolean>('experimental.dropCustomMetadata', false);
}
