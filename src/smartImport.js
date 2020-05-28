const vscode = require('vscode');
const importTool = require('./importTool.js')


const smartImport = () => {
    const editor = vscode.window.activeTextEditor;

    console.info(editor.selection.active);
    let position = editor.selection.active;

    console.info('adfasdfs',position);

    
    //找到script的开始标签
    const tagScriptStart = importTool.getLinePosition(editor.document, '<script>');
    //找到export default的位置
    const vuejsStartIdx = importTool.getLinePosition(editor.document,'export default');
    const curLineNo = position.line;//当前光标所在的行号
    console.info(tagScriptStart,position.line,vuejsStartIdx);
    if(tagScriptStart == -1 || vuejsStartIdx == -1 || curLineNo <= 0){
        return;
    }
    if(curLineNo > tagScriptStart && curLineNo < vuejsStartIdx){
        
        vscode.window.activeTextEditor.edit(editBuilder => {
            editBuilder.insert(position, 'adfadfadsfads');
        });
    }
}
module.exports = smartImport