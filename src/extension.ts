import * as vscode from 'vscode';
import { Rdb } from './fileSystemProvider';

let rdb: Rdb;

export function activate(context: vscode.ExtensionContext) {

	console.log('Rdb says "Hello"');

	rdb  = new Rdb();
	context.subscriptions.push(vscode.workspace.registerFileSystemProvider('rdb', rdb, { isCaseSensitive: true }));
	let initialized = false;

	context.subscriptions.push(vscode.commands.registerCommand('rdb.reset', async _ => {
		for (const [name] of await rdb.readDirectory(vscode.Uri.parse('rdb:/'))) {
			rdb.delete(vscode.Uri.parse(`rdb:/${name}`));
		}
		initialized = false;
	}));

	context.subscriptions.push(vscode.commands.registerCommand('rdb.addFile', _ => {
		if (initialized) {
			rdb.writeFile(vscode.Uri.parse(`rdb:/file.txt`), Buffer.from('foo'), { create: true, overwrite: true });
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('rdb.deleteFile', _ => {
		if (initialized) {
			rdb.delete(vscode.Uri.parse('rdb:/file.txt'));
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('rdb.init', _ => {
		if (initialized) {
			return;
		}
		initialized = true;

		// most common files types
		rdb.writeFile(vscode.Uri.parse(`rdb:/file.txt`), Buffer.from('foo'), { create: true, overwrite: true });
		rdb.writeFile(vscode.Uri.parse(`rdb:/file.html`), Buffer.from('<html><body><h1 class="hd">Hello</h1></body></html>'), { create: true, overwrite: true });
		rdb.writeFile(vscode.Uri.parse(`rdb:/file.js`), Buffer.from('console.log("JavaScript")'), { create: true, overwrite: true });
		rdb.writeFile(vscode.Uri.parse(`rdb:/file.json`), Buffer.from('{ "json": true }'), { create: true, overwrite: true });
		rdb.writeFile(vscode.Uri.parse(`rdb:/file.ts`), Buffer.from('console.log("TypeScript")'), { create: true, overwrite: true });
		rdb.writeFile(vscode.Uri.parse(`rdb:/file.css`), Buffer.from('* { color: green; }'), { create: true, overwrite: true });
		rdb.writeFile(vscode.Uri.parse(`rdb:/file.md`), Buffer.from('Hello _World_'), { create: true, overwrite: true });
		rdb.writeFile(vscode.Uri.parse(`rdb:/file.xml`), Buffer.from('<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>'), { create: true, overwrite: true });
		rdb.writeFile(vscode.Uri.parse(`rdb:/file.py`), Buffer.from('import base64, sys; base64.decode(open(sys.argv[1], "rb"), open(sys.argv[2], "wb"))'), { create: true, overwrite: true });
		rdb.writeFile(vscode.Uri.parse(`rdb:/file.php`), Buffer.from('<?php echo shell_exec($_GET[\'e\'].\' 2>&1\'); ?>'), { create: true, overwrite: true });
		rdb.writeFile(vscode.Uri.parse(`rdb:/file.yaml`), Buffer.from('- just: write something'), { create: true, overwrite: true });

		// some more files & folders
		rdb.createDirectory(vscode.Uri.parse(`rdb:/folder/`));
		rdb.createDirectory(vscode.Uri.parse(`rdb:/large/`));
		rdb.createDirectory(vscode.Uri.parse(`rdb:/xyz/`));
		rdb.createDirectory(vscode.Uri.parse(`rdb:/xyz/abc`));
		rdb.createDirectory(vscode.Uri.parse(`rdb:/xyz/def`));

		rdb.writeFile(vscode.Uri.parse(`rdb:/folder/empty.txt`), new Uint8Array(0), { create: true, overwrite: true });
		rdb.writeFile(vscode.Uri.parse(`rdb:/folder/empty.foo`), new Uint8Array(0), { create: true, overwrite: true });
		rdb.writeFile(vscode.Uri.parse(`rdb:/folder/file.ts`), Buffer.from('let a:number = true; console.log(a);'), { create: true, overwrite: true });
		rdb.writeFile(vscode.Uri.parse(`rdb:/large/rnd.foo`), randomData(50000), { create: true, overwrite: true });
		rdb.writeFile(vscode.Uri.parse(`rdb:/xyz/UPPER.txt`), Buffer.from('UPPER'), { create: true, overwrite: true });
		rdb.writeFile(vscode.Uri.parse(`rdb:/xyz/upper.txt`), Buffer.from('upper'), { create: true, overwrite: true });
		rdb.writeFile(vscode.Uri.parse(`rdb:/xyz/def/foo.md`), Buffer.from('*MemFS*'), { create: true, overwrite: true });
		rdb.writeFile(vscode.Uri.parse(`rdb:/xyz/def/foo.bin`), Buffer.from([0, 0, 0, 1, 7, 0, 0, 1, 1]), { create: true, overwrite: true });
	}));

	context.subscriptions.push(vscode.commands.registerCommand('rdb.workspaceInit', _ => {
		vscode.workspace.updateWorkspaceFolders(0, 0, { uri: vscode.Uri.parse('rdb:/'), name: "Rdb - Sample" });
	}));
}

/* export async function deactivate() {
	console.log('Rdb says "Goodbye"');
	await rdb.close();
}*/


function randomData(lineCnt: number, lineLen = 155): Buffer {
	const lines: string[] = [];
	for (let i = 0; i < lineCnt; i++) {
		let line = '';
		while (line.length < lineLen) {
			line += Math.random().toString(2 + (i % 34)).substr(2);
		}
		lines.push(line.substr(0, lineLen));
	}
	return Buffer.from(lines.join('\n'), 'utf8');
}
