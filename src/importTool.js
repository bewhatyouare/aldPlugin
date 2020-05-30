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
    },
    addComponent:function (importKey,importUrl,rowNo){
        const editor = vscode.window.activeTextEditor;
        //找到script的开始标签
        const tagScriptStart = this.getLinePosition(editor.document, '<script>');
        //找到script结束标签
        const tagScriptEnd = this.getLinePosition(editor.document, '</script>')
        //找到export default的位置
        const vuejsStartIdx = this.getLinePosition(editor.document,'export default')
        
        //找到component对象的位置
        let compOldIdx = this.getLinePosition(editor.document, 'components',vuejsStartIdx+1,tagScriptEnd);
        let addOne = `  components:{${importKey}}, \n`;
        //找到要引入对象的位置，script标签下的第一行
        //let position = new vscode.Position(tagScriptStart + 1,0);
        if(!rowNo){
            rowNo = tagScriptStart + 1;
        }
        let importRange = new vscode.Range(rowNo, 0, rowNo,importKey.length)
        if(compOldIdx == -1){//原来没有添加子组件的component节点
          //直接添加component节点
          let positionCom = new vscode.Position(vuejsStartIdx + 1,0);//左边加两个空格
          editor.edit(editBuilder => {
            editBuilder.replace(importRange, importUrl);//在script标签下添加引入对象的import路径
            editBuilder.insert(positionCom, addOne);
          });
        } else {
          const doc = editor.document
          let lineText = doc.lineAt(compOldIdx).text;
          let range = new vscode.Range(compOldIdx,0,compOldIdx,lineText.length);
          //如果components对象在一行
          if(lineText.indexOf('{') > -1 && lineText.indexOf('}') > -1){
            addOne = lineText.replace('{',`{${importKey},`);//加在原有组件中的第一个
          } else {
            let compEndIdx = -1;
            addOne = '';
            let spaceLeft = '';
            //循环script内部  找出component对象所占的行
            for (let lineNumber = compOldIdx; lineNumber < tagScriptEnd; lineNumber++) {
                lineText = doc.lineAt(lineNumber).text;
                if(lineNumber > compOldIdx){
                    addOne += '\n';
                }
                addOne += lineText;
                if(~lineText.indexOf('{')){//添加新组件到第一个节点
                    spaceLeft = lineText.substring(0,lineText.indexOf('{'));
                    if(~lineText.indexOf('components')){//类似于这样 components:{
                    spaceLeft = lineText.substring(0,lineText.indexOf('components'));//获取当前行的左缩进空格
                    }
                    addOne += `\n${spaceLeft}  ${importKey},`;//在当前行的左缩进空格基础上加两个空格
                }
                if(~lineText.indexOf('}')){
                    compEndIdx = lineNumber;
                    break;
                }
            }
            range = new vscode.Range(compOldIdx,0,compEndIdx,lineText.length);
          }
          editor.edit(editBuilder => {
            editBuilder.replace(importRange, importUrl);//在script标签下添加引入对象的import路径
            editBuilder.replace(range, addOne);
          });
        }
      }      
}
module.exports = importTool;