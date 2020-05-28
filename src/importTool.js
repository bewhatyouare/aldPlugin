const vscode = require('vscode');
const importTool = {
    //查找标签在整个文档中的行数
    getLinePosition: function (doc, tag,startLine=0,endLine) {
        const lineCount = doc.lineCount
        let lineNumberTagMatch = -1
        if(!endLine){//参数没有传结尾行
        endLine = lineCount;
        }
        for (let lineNumber = startLine; lineNumber < endLine; lineNumber++) {
        const lineText = doc.lineAt(lineNumber)
        let lineOfTag = lineText.text.startsWith(tag)
    
        if (lineOfTag) {
            lineNumberTagMatch = lineNumber
            break
        } else {
            if(!tag.startsWith('<') && ~lineText.text.indexOf(tag)){
            lineNumberTagMatch = lineNumber;
            break;
            }
        }
        }
    
        return lineNumberTagMatch
    }

}
module.exports = importTool;