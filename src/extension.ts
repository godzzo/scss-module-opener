import * as vscode from 'vscode';
import { writeFileSync, appendFileSync } from 'node:fs';

log('Loaded: scss-module-opener!');

export function activate(context: vscode.ExtensionContext) {
	console.log(
		'Congratulations, your extension "scss-module-opener" is now active!'
	);

	log('activate from scss-module-opener!');

	log('getWorkspacePath', getWorkspacePath());

	onActivate(context);

	const disposable = vscode.commands.registerCommand(
		'scss-module-opener.helloWorld',
		() => {
			// The code you place here will be executed every time your command is executed
			// Display a message box to the user
			vscode.window.showInformationMessage(
				'Hello World from scss-module-opener!'
			);
		}
	);

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

function onActivate(context: vscode.ExtensionContext) {
	let activeEditor = vscode.window.activeTextEditor;

	log('Hello World from scss-module-opener!');

	vscode.window.onDidChangeActiveTextEditor((editor) => {
		activeEditor = editor;

		if (activeEditor) {
			const currentFilePath = activeEditor.document.fileName;

			log('currentFilePath', currentFilePath);

			if (currentFilePath.endsWith('.tsx')) {
				const scssFilePath = currentFilePath.replace(
					/\.tsx$/,
					'.module.scss'
				);

				log('scssFilePath', scssFilePath);

				vscode.workspace
					.openTextDocument(scssFilePath)
					.then((document) => {
						log('openTextDocument', scssFilePath);

						vscode.window.showTextDocument(document, {
							viewColumn: vscode.ViewColumn.Beside,
						});
					});
			}
		}
	});
}

function log(msg: string, obj?: any) {
	// writeFileSync('/home/godzzo/base.txt', process.cwd());

	const json = obj ? JSON.stringify(obj, null, 4) : '';

	vscode.window.showInformationMessage(msg + ': ' + json);

	console.log(msg, obj);

	const path = getWorkspacePath() ?? '.';

	appendFileSync(
		`${path}/scss-module-opener.log`,
		JSON.stringify(
			{
				date: new Date().toISOString(),
				msg,
				obj,
			},
			null,
			4
		)
	);
}

function getWorkspacePath() {
	const workspaceFolders = vscode.workspace.workspaceFolders;

	if (workspaceFolders && workspaceFolders.length > 0) {
		const workspaceFolder = workspaceFolders[0];

		return workspaceFolder.uri.fsPath;
	}
}
