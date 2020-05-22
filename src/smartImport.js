const vscode = require('vscode')

const smartImport = () => {
    alert('adfdf');
    let watcher = vscode.workspace.createFileSystemWatcher(glob);
    let workspace = undefined;
    watcher.onDidChange((file) => {
        vscode.commands.executeCommand('aldpage.smartImport', { workspace, file, edit: true });
    });
    
}
module.exports = smartImport