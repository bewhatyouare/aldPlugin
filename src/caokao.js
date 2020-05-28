import * as path from 'path';
import { 
	workspace as Workspace, window as Window, ExtensionContext, TextDocument, OutputChannel, WorkspaceFolder, Uri, WorkspaceConfiguration
} from 'vscode'; 

import { 
	LanguageClient, LanguageClientOptions, TransportKind
} from 'vscode-languageclient';

const supportedStyleLanguages = ['css', 'scss', 'less'];

let defaultClient;//: LanguageClient;
let clients;//: Map<string, LanguageClient> = new Map();

let _sortedWorkspaceFolders;//: string[];
function sortedWorkspaceFolders(){
	if (_sortedWorkspaceFolders === void 0) {
		_sortedWorkspaceFolders = Workspace.workspaceFolders.map(folder => {
			let result = folder.uri.toString();
			if (result.charAt(result.length - 1) !== '/') {
				result = result + '/';
			}
			return result;
		}).sort(
			(a, b) => {
				return a.length - b.length;
			}
		);
	}
	return _sortedWorkspaceFolders;
}
Workspace.onDidChangeWorkspaceFolders(() => _sortedWorkspaceFolders = undefined);
//: WorkspaceFolder
function getOuterMostWorkspaceFolder(folder) {
	let sorted = sortedWorkspaceFolders();
	for (let element of sorted) {
		let uri = folder.uri.toString();
		if (uri.charAt(uri.length - 1) !== '/') {
			uri = uri + '/';
		}
		if (uri.startsWith(element)) {
			return Workspace.getWorkspaceFolder(Uri.parse(element));
		}
	}
	return folder;
}

//context : ExtensionContext
export function activate(context) {
    //: WorkspaceConfiguration
	const config = Workspace.getConfiguration('css_peek');

    //: Array<string>
	const peekFromLanguages = (config.get('peekFromLanguages'));

	const peekToInclude = supportedStyleLanguages.map((l) => `**/*.${l}`);

    //: Array<string>
	const peekToExclude = config.get('peekToExclude') 
		

	let module = context.asAbsolutePath(path.join('server', 'server.js'));
    //OutputChannel
    let outputChannel = Window.createOutputChannel('css-peek');
    
    //: TextDocument
	function didOpenTextDocument(document) {
		if (document.uri.scheme !== 'file' && document.uri.scheme !== 'untitled') {
			return;
		}

		let uri = document.uri;
		// Untitled files go to a default client.
		if (uri.scheme === 'untitled' && !defaultClient) {
			let debugOptions = { execArgv: ["--nolazy", "--inspect=6010"] };
			let serverOptions = {
				run: { module, transport: TransportKind.ipc },
				debug: { module, transport: TransportKind.ipc, options: debugOptions}
            };
            //: LanguageClientOptions
			let clientOptions = {
				documentSelector:
					peekFromLanguages
						.map(language => ({
							scheme: 'untitled',
							language
						})),
				synchronize: {
					configurationSection: 'css_peek'
				},
				initializationOptions: {
					stylesheets: [],
					peekFromLanguages: peekFromLanguages
				},
				diagnosticCollectionName: 'css-peek',
				outputChannel
			}
			defaultClient = new LanguageClient('css-peek', 'CSS Peek', serverOptions, clientOptions);
			defaultClient.registerProposedFeatures();
			defaultClient.start();
			return;
		}
		let folder = Workspace.getWorkspaceFolder(uri);
		// Files outside a folder can't be handled. This might depend on the language.
		// Single file languages like JSON might handle files outside the workspace folders.
		if (!folder) {
			return;
		}
		// If we have nested workspace folders we only start a server on the outer most workspace folder.
		folder = getOuterMostWorkspaceFolder(folder);
		
		if (!clients.has(folder.uri.toString())) {
			Workspace.findFiles(`{${(peekToInclude || []).join(',')}}`, `{${(peekToExclude || []).join(',')}}`,)
				.then(file_searches => {
                    //: Uri[]
					let potentialFiles = file_searches.filter((uri) => uri.scheme === 'file');

					let debugOptions = { execArgv: ["--nolazy", `--inspect=${6011 + clients.size}`] };
					let serverOptions = {
						run: { module, transport: TransportKind.ipc },
						debug: { module, transport: TransportKind.ipc, options: debugOptions}
                    };
                    //: LanguageClientOptions
					let clientOptions = {
						documentSelector:
							peekFromLanguages
							.map(language => ({
								scheme: 'file',
								language: language,
								pattern: `${folder.uri.fsPath}/**/*`
							})),
						diagnosticCollectionName: 'css-peek',
						synchronize: {
							configurationSection: 'css_peek'
						},
						initializationOptions: {
							stylesheets: potentialFiles.map(u => ({uri: u.toString(), fsPath: u.fsPath})),
							peekFromLanguages: peekFromLanguages
						},
						workspaceFolder: folder,
						outputChannel
					}
					let client = new LanguageClient('css-peek', 'CSS Peek', serverOptions, clientOptions);
					client.registerProposedFeatures();
					client.start();
					clients.set(folder.uri.toString(), client);
			});
		}
	}

	Workspace.onDidOpenTextDocument(didOpenTextDocument);
	Workspace.textDocuments.forEach(didOpenTextDocument);
	Workspace.onDidChangeWorkspaceFolders((event) => {
		for (let folder  of event.removed) {
			let client = clients.get(folder.uri.toString());
			if (client) {
				clients.delete(folder.uri.toString());
				client.stop();
			}
		}
	});
}

export function deactivate() {
	
}
