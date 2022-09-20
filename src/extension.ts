// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as vscode from 'vscode';
import { register as registerCellTags } from './cellTags';

export function activate(context: vscode.ExtensionContext) {
	registerCellTags(context);
}

export function deactivate() {}
