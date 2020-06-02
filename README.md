#smartimport

## Features

smartImport Vue code in Visual Studio Code:

<p align="center">
  <img alt="nl import" src="https://github.com/bewhatyouare/aldPlugin/blob/master/working.gif">
</p>
## Usage

Open context menu in vue, choose 导入客户端交互clientJs ;
在vue文件中输入要导入包的名字后，按tab键。
  例如要导入下拉框，输入nldrop+（ctrl + tab）键，即能添加如下代码：
    import NlDropdown from 'components/common/NlDropdown/dropdown.js

## Keyboard Shortcut
Use the following to embed a beautify shortcut in keybindings.json. Replace with your preferred key bindings.

    {
        "command": "aldpage.smartImport",
        "key": "ctrl+tab",
        "mac": "cmd+tab",
        "when": "editorTextFocus && resourceLangId == vue"
    }



## Github
https://github.com/bewhatyouare/aldPlugin
