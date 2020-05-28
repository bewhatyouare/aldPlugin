const vscode = require('vscode');
const importTool = require('./importTool.js')


const smartImport = (doc) => {
    console.info(doc);
    const editor = vscode.window.activeTextEditor;
    if (editor.document.languageId !== 'vue') {
        return;
      }
    //找到script的开始标签
    const tagScriptStart = importTool.getLinePosition(editor.document, '<script>');
    //找到export default的位置
    const vuejsStartIdx = importTool.getLinePosition(editor.document,'export default');
    if(tagScriptStart == -1 || vuejsStartIdx == -1){
        return;
    }

    console.info('adfadf');
}
module.exports = smartImport