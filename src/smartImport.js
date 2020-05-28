const vscode = require('vscode');
//const util = require('./util');
const importTool = require('./importTool.js')

/**
 * 根据用户的输入智能添加导入提示
 * @param {*} document 
 * @param {*} position 
 */
function provideCompletionItems(document, position) {
    const line = document.lineAt(position);
    
    let curLineNo = line._line;
    const lineText = line.text.substring(0, position.character);

    let startLineNo = importTool.getLinePosition(document, '<script>');
    //找到export default的位置
    let vuejsStartIdx = importTool.getLinePosition(document,'export default');

    console.info(startLineNo,curLineNo,vuejsStartIdx);

    // 判断当前是不是在<script>标签内，并且标签内的引入外部文件的区域
    if(curLineNo > startLineNo && curLineNo < vuejsStartIdx){//在<script> 和 export default之间
        findImportPath(lineText);
    } else {
        return;
    }
    
    console.info(json);
    // 只截取到光标位置为止
    console.info(lineText);

    // 简单匹配，只要当前光标前的字符串为`this.dependencies.`都自动带出所有的依赖
    if(/(^|=| )\w+\.dependencies\.$/g.test(lineText)) {
        const dependencies = Object.keys(json.dependencies || {}).concat(Object.keys(json.devDependencies || {}));
        return dependencies.map(dep => {
            // vscode.CompletionItemKind 表示提示的类型
            return new vscode.CompletionItem(dep, vscode.CompletionItemKind.Field);
        })
    }
}

function findImportPath(lineText){
    let curText = lineText.toLocaleLowerCase();
    console.info(curText);
    //智能引入的文件路径的配置文件
    const json = require(`../snippets/importPath.json`);
    let keys = Object.keys(json);
    for(let key in json){
        let value = json[key];
        if(~key.indexOf(curText)){
            console.info(key,value.path);
            return new vscode.CompletionItem('adfadfadfadfadf23424', vscode.CompletionItemKind.Keyword);
        }
    }
}

/**
 * 光标选中当前自动补全item时触发动作，一般情况下无需处理
 * @param {*} item 
 * @param {*} token 
 */
function resolveCompletionItem(item, token) {
    return null;
}

module.exports = function(context) {
    
    
    // 获取所有命令
    // vscode.commands.getCommands().then(allCommands => {
    //     console.log('所有命令：', allCommands);
    //     vscode.window.showInformationMessage(allCommands);
    // });
    // 注册代码建议提示，只有当按下“tab”时才触发
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider('vue', {
        provideCompletionItems,
        resolveCompletionItem
    }, ''));
};