// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as jsforce from 'jsforce';
import {buildMessageClass} from './util/buildMsgClassFromSobject';
import {loadConfig} from './util/util';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	//console.log('Congratulations, your extension "buildapexmsgclass" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.buildApexMsgClass', () => {
		// The code you place here will be executed every time your command is executed
		
		// jsforce connection object and config block are used throughout the promise chain.
		let conn = null;
		let config = null;
		
		loadConfig()
		.then(result => {
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
		.then(result => {
			let sobjArray = new Array();
			let sobj = null;
		
			// Build an array of Sobjects,  skipping any object that can't be modified in any way.
			for (var i = 0; i < result.sobjects.length; i++) {
				sobj = result.sobjects[i];
				// skip non updateable objects
				if (!(sobj.createable || sobj.deletable || sobj.updateable)) {
					continue;
				}
				sobjArray.push(sobj.name);
			}
			
			return vscode.window.showQuickPick(sobjArray.sort());
		})
		.then(selectedItem => {
			// Build the Apex Message class from the target sObject.
			if (selectedItem) {
				buildMessageClass(conn, config.apiVersion, selectedItem);
			}
			else {
				vscode.window.showErrorMessage('Apex Message class generation canceled.');
				return;
			}
		});
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}