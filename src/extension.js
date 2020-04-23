const vscode = require('vscode');
const importJs = require('./nlImport.js');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	//导入clientJs
	const importClientJs = vscode.commands.registerCommand(
		'aldpage.clientJs',
		() => {
		  importJs('clientjs')
		}
	)
	context.subscriptions.push(importClientJs);
	//导入鉴权对象
	const importHeader = vscode.commands.registerCommand(
		'aldpage.Header',
		() => {
		  importJs('Header')
		}
	)
	context.subscriptions.push(importHeader);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
