import * as vscode from 'vscode';
import { decorX01, decorX02, decorX04, decorX11, decorX05, decorX13, decorX14, decorX16, decorX17, decorX18 } from './decorDefinitions';
import { msgX01, msgX02, msgX04, msgX05, msgX11, msgX13, msgX14, msgX16, msgX17, msgX18 } from './decorMessages';

export function highlightControlCharacters(editor: vscode.TextEditor) {
    const ranges0x01: vscode.Range[] = [];  // 'A'
    const ranges0x02: vscode.Range[] = [];  // 'B'
    const ranges0x04: vscode.Range[] = [];  // 'D'
    const ranges0x05: vscode.Range[] = [];  // 'E'
    const ranges0x11: vscode.Range[] = [];  // 'Q'
    const ranges0x13: vscode.Range[] = [];  // 'S'
    const ranges0x17: vscode.Range[] = [];  // 'W'
    const ranges0x14: vscode.Range[] = [];  // 'T'
    const ranges0x16: vscode.Range[] = [];  // 'V'
    const ranges0x18: vscode.Range[] = [];  // 'X'

    for (let line = 0; line < editor.document.lineCount; line++) {
        const text = editor.document.lineAt(line).text;

        for (let char_index = 0; char_index < text.length; char_index++) {
            if (text.charCodeAt(char_index) >= 0x20) { 
                // Skip printable characters;
                continue; 
            } else {
                const start = new vscode.Position(line, char_index);
                const end = new vscode.Position(line, char_index + 1);
                switch (text.charCodeAt(char_index)) {
                    case 0x01: // 'A'
                        ranges0x01.push(new vscode.Range(start, end));
                        break;
                    case 0x02: // 'B'
                        ranges0x02.push(new vscode.Range(start, end));
                        break;
                    case 0x04: // 'D'
                        ranges0x04.push(new vscode.Range(start, end));
                        break;
                    case 0x05: // 'E'
                        ranges0x05.push(new vscode.Range(start, end));
                        break;
                    case 0x11: // 'Q'
                        ranges0x11.push(new vscode.Range(start, end));
                        break;
                    case 0x13: // 'S'
                        ranges0x13.push(new vscode.Range(start, end));
                        break;
                    case 0x14: // 'T'
                        ranges0x14.push(new vscode.Range(start, end));
                        break;
                    case 0x16: // 'V'
                        ranges0x16.push(new vscode.Range(start, end));
                        break;
                    case 0x17: // 'W'
                        ranges0x17.push(new vscode.Range(start, end));
                        break;
                    case 0x18: // 'X'
                        ranges0x18.push(new vscode.Range(start, end));
                        break;
                }
            }
        }
    }

    editor.setDecorations(decorX01, ranges0x01.map(range => ({ range, hoverMessage: msgX01 })));
    editor.setDecorations(decorX02, ranges0x02.map(range => ({ range, hoverMessage: msgX02 })));
    editor.setDecorations(decorX04, ranges0x04.map(range => ({ range, hoverMessage: msgX04 })));
    editor.setDecorations(decorX05, ranges0x05.map(range => ({ range, hoverMessage: msgX05 })));
    editor.setDecorations(decorX11, ranges0x11.map(range => ({ range, hoverMessage: msgX11 })));
    editor.setDecorations(decorX13, ranges0x13.map(range => ({ range, hoverMessage: msgX13 })));
    editor.setDecorations(decorX14, ranges0x14.map(range => ({ range, hoverMessage: msgX14 })));
    editor.setDecorations(decorX16, ranges0x16.map(range => ({ range, hoverMessage: msgX16 })));
    editor.setDecorations(decorX17, ranges0x17.map(range => ({ range, hoverMessage: msgX17 })));
    editor.setDecorations(decorX18, ranges0x18.map(range => ({ range, hoverMessage: msgX18 })));
}
