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
        let lineText = editor.document.lineAt(position).text;//当前用户的输入
        findImportPath(lineText,position)
    }
}
const findImportPath = (lineText,position) => {
    let rowNo = position.line;
    
    let curText = lineText.toLocaleLowerCase();
    console.info(curText);
    //智能引入的文件路径的配置文件
    const json = require(`../snippets/importPath.json`);
    for(let key in json){
        let value = json[key];
        if(~key.indexOf(curText)){
            let range = new vscode.Range(rowNo, 0, rowNo,lineText.length)
            vscode.window.activeTextEditor.edit(editBuilder => {
                // editBuilder.insert(position,value.path);
                editBuilder.replace(range, value.path);
            });
            break;
        }
    }
}
module.exports = smartImport