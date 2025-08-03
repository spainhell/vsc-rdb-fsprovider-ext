import * as vscode from 'vscode';
import { decorX17 } from './decorDefinitions';

export function highlightControlCharacters(editor: vscode.TextEditor) {
    const ranges: vscode.Range[] = [];

    for (let line = 0; line < editor.document.lineCount; line++) {
        const text = editor.document.lineAt(line).text;

        for (let char_index = 0; char_index < text.length; char_index++) {
            if (text.charCodeAt(char_index) >= 0x20) { continue; } // Skip printable characters;
            // change character
            // text[char_index] = 'Z';
            const start = new vscode.Position(line, char_index);
            const end = new vscode.Position(line, char_index + 1);
            ranges.push(new vscode.Range(start, end));
        }
    }

    editor.setDecorations(decorX17, ranges);
}
