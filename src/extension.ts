// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as jsforce from 'jsforce';
import {buildMessageClass} from './util/buildMsgClass';
import {loadConfig, listSobjects} from './util/util';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.buildApexMsgClass', () => {
		// The code you place here will be executed every time your command is executed

		// jsforce connection object and config block are used throughout the promise chain.
		let conn = null;
		let config = null;
		
		// Loads force.json and returns the JSON config structure.
		loadConfig()
		.then(result => {
			if (result == null) {
				Promise.reject('force.json config not found.');
				return;
			}
			config = result;
			return new jsforce.Connection({
				loginUrl: config.url
			})
		})
		.then(result => {
			conn = result;
			return conn.login(config.username, config.password);
 		})				
		.then(userInfo => {
			return conn.describeGlobal();
		})
		.then(listSobjects)
		.then(selectedItem => {
			if (!selectedItem) {
				vscode.window.showInformationMessage('Apex Message class generation canceled.');
				Promise.reject('Apex Message class generation canceled.');
				return;
			}
			return conn.describe(selectedItem);
		})
		.then(sobject => {
			buildMessageClass(sobject, config);
		});
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}