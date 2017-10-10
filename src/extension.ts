// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as jsforce from 'jsforce';
import {buildMessageClass} from './util/buildMsgClassFromSobject';

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
		let conn = null;
		
		// Look for force.json config file.
		vscode.workspace.findFiles('**/force.json')
		.then(result => {
			if (result.length == 0) {
				vscode.window.showInformationMessage('Can\'t find a "force.json" file for your org credentials.');
				return;
			}
			// Load relevant config bits from file.
			vscode.workspace.openTextDocument(result[0]).then(textDocument => {
				let jsonText = JSON.parse(textDocument.getText());
				let userName = jsonText.username;
				let password = jsonText.password;
				let url = jsonText.url;
				let apiVersion = jsonText.apiVersion;
				
				if (!userName) { 
					vscode.window.showErrorMessage('No value for "username" is set in "force.json".');
				}
				if (!password) {
					vscode.window.showErrorMessage('No value for "password" is set in "force.json".');
				}
				if (!url) {
					vscode.window.showErrorMessage('No value for "url" is set in "force.json".');
				}
				if (!apiVersion) {
					vscode.window.showErrorMessage('No value for "apiVersion" is set in "force.json".');
				}
				
				conn = new jsforce.Connection({
					loginUrl: url
				});
				
				// Login in to org, then get a list of all sObjects.
				conn.login(userName, password)
				.then(userInfo => conn.describeGlobal((err, res) => {
					if (err) {
						vscode.window.showErrorMessage('Error during login: ' + err);
						return;
					}
					
					let sobjArray = new Array();
					let sobj = null;
					
					// Build an array of Sobjects,  skipping any object that can't be modified in any way.
					for (var i = 0; i < res.sobjects.length; i++) {
						sobj = res.sobjects[i];
						// skip non updateable objects
						if (!(sobj.createable || sobj.deletable || sobj.updateable)) {
							continue;
						}
						sobjArray.push(sobj.name);
					}
					// Present user with QuickPick/type-ahead list of alpha-sorted sObjects.
					vscode.window.showQuickPick(sobjArray.sort())
					.then(selectedItem => {
						// Build the Apex Message class from the target sObject.
						if (selectedItem) {
							buildMessageClass(conn, apiVersion, selectedItem);
						}
						else {
							vscode.window.showErrorMessage('Apex Message class generation canceled.');
							return;
						}
					});
				}));
			});
		})
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}