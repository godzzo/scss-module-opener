import * as vscode from 'vscode';
import { writeFileSync, appendFileSync } from 'node:fs';

const build = 5;
let lastFile = '';
let openFiles = false;
let canLog = false;

log('Loaded: scss-module-opener!');

export function activate(context: vscode.ExtensionContext) {
	console.log(
		'Congratulations, your extension "scss-module-opener" is now active!'
	);

	log('activate from scss-module-opener!');

	log('getWorkspacePath', getWorkspacePath());

	onEditors(context);
	onSwitch(context);

	const disposable = vscode.commands.registerCommand(
		'scss-module-opener.helloWorld',
		() => {
			vscode.window.showInformationMessage(
				'Hello World from scss-module-opener!'
			);
		}
	);

	context.subscriptions.push(disposable);
}

export function deactivate() {}

function onSwitch(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('scss-module-opener.autoOnOff', () => {
			openFiles = !openFiles;

			vscode.window.showInformationMessage(`openFiles: ${openFiles}`);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('scss-module-opener.logOnOff', () => {
			canLog = !canLog;

			vscode.window.showInformationMessage(`canLog: ${canLog}`);
		})
	);
}

function onEditors(context: vscode.ExtensionContext) {
	log('Hello World from scss-module-opener!');

	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(openStyle)
	);

	// context.subscriptions.push(
	// 	vscode.workspace.onDidOpenTextDocument((a) => {
	// 		log('onDidOpenTextDocument', a.fileName);
	// 	})
	// );
}

function openStyle(editor: vscode.TextEditor | undefined) {
	const activeEditor = editor;

	if (activeEditor) {
		openFile(activeEditor.document.fileName);
	}
}

function openFile(currentFilePath: string) {
	if (!openFiles) {
		return;
	}

	log('currentFilePath', currentFilePath);

	let openPath: null | string = null;
	let viewColumn = vscode.ViewColumn.Beside;

	if (currentFilePath.endsWith('.tsx')) {
		viewColumn = vscode.ViewColumn.Two;
		openPath = currentFilePath.replace(/\.tsx$/, '.module.scss');
	} else if (currentFilePath.endsWith('.module.scss')) {
		viewColumn = vscode.ViewColumn.One;
		openPath = currentFilePath.replace(/\.module\.scss$/, '.tsx');
	} else if (currentFilePath.endsWith('.module.css')) {
		openPath = currentFilePath.replace(/\.module\.css$/, '.tsx');
	}

	if (openPath !== null && openPath !== lastFile) {
		if (!locateFile(openPath)) {
			log('scssFilePath', { openPath, viewColumn, lastFile });

			lastFile = openPath;

			vscode.workspace.openTextDocument(openPath).then((document) => {
				log('openTextDocument', openPath);

				vscode.window.showTextDocument(document, {
					viewColumn,
					preserveFocus: true,
				});
			});
		}
	}
}

function log(msg: string, obj?: any) {
	if (!canLog) {
		return;
	}

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
				build,
				msg,
				obj,
			},
			null,
			4
		)
	);
}

function locateFile(file: string) {
	const editors = vscode.window.visibleTextEditors.map(
		(editor) => editor.document.fileName
	);

	log('opened editors', { editors, file });

	return editors.some((uri) => uri === file);
}

function getWorkspacePath() {
	const workspaceFolders = vscode.workspace.workspaceFolders;

	if (workspaceFolders && workspaceFolders.length > 0) {
		const workspaceFolder = workspaceFolders[0];

		return workspaceFolder.uri.fsPath;
	}
}
