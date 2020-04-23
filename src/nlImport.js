const vscode = require('vscode')

const impMap = {
    'clientjs':'import ClientJs from \'@/base/clientjs\'\n',
    'storage':'import Storage from \'@/base/storage\'\n',
    'Authenct':'import Authenct from \'components/common/Authenticate/Authenticate\'\n',
    'Header':{
      url:'import Header from \'components/common/Header.vue\'\n',
      isComponent:true
    }
}
//查找标签在整个文档中的行数
const getLinePosition = (doc, tag,startLine=0,endLine) => {
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

const addComponent = (importKey,importUrl) =>{
  const editor = vscode.window.activeTextEditor;
  //找到script的开始标签
  const tagScriptStart = getLinePosition(editor.document, '<script>');
  //找到script结束标签
  const tagScriptEnd = getLinePosition(editor.document, '</script>')
  //找到export default的位置
  const vuejsStartIdx = getLinePosition(editor.document,'export default')
  
  //找到component对象的位置
  let compOldIdx = getLinePosition(editor.document, 'components',vuejsStartIdx+1,tagScriptEnd);
  let addOne = `  components:{${importKey}}, \n`;
  //找到要引入对象的位置，script标签下的第一行
  let position = new vscode.Position(tagScriptStart + 1,0);

  if(compOldIdx == -1){//原来没有添加子组件的component节点
    //直接添加component节点
    let positionCom = new vscode.Position(vuejsStartIdx + 1,0);//左边加两个空格
    editor.edit(editBuilder => {
      editBuilder.insert(position, importUrl);//在script标签下添加引入对象的import路径
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
      editBuilder.insert(position, importUrl);//在script标签下添加引入对象的import路径
      editBuilder.replace(range, addOne);
    });
  }
}

const importJs = importKey => {
    const editor = vscode.window.activeTextEditor

    if (editor.document.languageId !== 'vue') {
      return;
    }
    //找到script的开始标签
    const tagScriptStart = getLinePosition(editor.document, '<script>');
    
    if(tagScriptStart > 0){
      let impVal = impMap[importKey]
      let newImport = impVal;//取key对应的值
      let isComponent = false;//导入的是否为组件
      if(impVal instanceof Object){//如果key对应的是对象，则取对象里的URL
        newImport = impVal.url
        isComponent = impVal.isComponent;//是否为组件
      }
      
      if(isComponent){//如果是组件，需要注册
        addComponent(importKey,impVal.url);
      } else {
        //找到要引入对象的位置，script标签下的第一行
        let position = new vscode.Position(tagScriptStart + 1,0);
        vscode.window.activeTextEditor.edit(editBuilder => {
          editBuilder.insert(position, newImport);
        });
      }
    }
    
  }
  
  module.exports = importJs
