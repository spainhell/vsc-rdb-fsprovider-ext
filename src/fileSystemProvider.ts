import * as path from 'path';
import * as vscode from 'vscode';

import { GrpcRdbClient, LoadChapterResponse } from './grpc/index';
const SERVER_ADDRESS = 'localhost:7877';

export class File implements vscode.FileStat {

	type: vscode.FileType;
	chOrder: number;
	chType: string;
	chName: string;
	ctime: number;
	mtime: number;
	size: number;

	name: string;
	data?: Uint8Array;

	constructor(chOrder: number, chType: string, chName: string) {
		this.type = vscode.FileType.File;
		this.chOrder = chOrder;
		this.chType = chType;
		this.chName = chName;
		this.ctime = Date.now();
		this.mtime = Date.now();
		this.size = 0;
		this.name = `${chType}_${chName}`;
	}
}

export class Directory implements vscode.FileStat {

	type: vscode.FileType;
	ctime: number;
	mtime: number;
	size: number;

	name: string;
	entries: Map<string, File | Directory>;

	constructor(name: string) {
		this.type = vscode.FileType.Directory;
		this.ctime = Date.now();
		this.mtime = Date.now();
		this.size = 0;
		this.name = name;
		this.entries = new Map();
	}
}

export type Entry = File | Directory;

export class Rdb implements vscode.FileSystemProvider {

	private client: GrpcRdbClient | undefined;
	
	constructor() {
		try {
			this.client = new GrpcRdbClient(SERVER_ADDRESS);
			console.log('gRPC client initialized successfully');
			this.client.openRDB({ rdbName: 'CESTAK.RDB' }).then(response => {
				console.log('RDB opened successfully:', response);
			});
		} catch (error) {
			console.error('Error initializing gRPC client:', error);
		}
	}
	
	root = new Directory('');

	// --- manage file metadata

	stat(uri: vscode.Uri): vscode.FileStat {
		console.log('stat called for', uri.toString());

		const fileId = this.getIdFromUri(uri);
		if (!fileId) {
			// throw vscode.FileSystemError.FileNotFound(uri);
			return new Directory(path.posix.basename(uri.path));
		}

		return new File(fileId, 'dummy', 'dummy');

		/*console.log('stat called for', uri.toString());
		return this._lookup(uri, false);*/
	}

	async readDirectory(uri: vscode.Uri): Promise<[string, vscode.FileType][]> {
		console.log('readDirectory called for', uri.toString());
		if (!this.client) {
			throw new Error('gRPC client is not initialized');
		}
		if (uri.scheme !== 'rdb') {
			throw vscode.FileSystemError.NoPermissions(uri);
		}
		const response = await this.client.getChaptersList();
		return response.chaptersList.map(chapter => {
			const name = this.getFileLabel(chapter);
			return [`${name}`, vscode.FileType.File] as [string, vscode.FileType];
		});
	}
	

	// --- manage file contents

	async readFile(uri: vscode.Uri): Promise<Uint8Array> {
		if (!this.client) {
			throw new Error('gRPC client is not initialized');
		}

		const fileId = this.getIdFromUri(uri);
		if (!fileId) {
			throw vscode.FileSystemError.FileNotFound(uri);
		}

		console.log('readFile called for', uri.toString());
		const response = await this.client.loadChapter({ chapterNumber: fileId });
		if (!response) {
			throw vscode.FileSystemError.FileNotFound(uri);
		}

		return response.chapterText ? Buffer.from(response.chapterText, 'utf8') : new Uint8Array(0);
	}

	writeFile(uri: vscode.Uri, content: Uint8Array, options: { create: boolean, overwrite: boolean }): void {
		console.log('writeFile called for', uri.toString());
		const basename = path.posix.basename(uri.path);
		const parent = this._lookupParentDirectory(uri);
		let entry = parent.entries.get(basename);
		if (entry instanceof Directory) {
			throw vscode.FileSystemError.FileIsADirectory(uri);
		}
		if (!entry && !options.create) {
			throw vscode.FileSystemError.FileNotFound(uri);
		}
		if (entry && options.create && !options.overwrite) {
			throw vscode.FileSystemError.FileExists(uri);
		}
		if (!entry) {
			entry = new File(0,basename, basename); // 0 = new RDB record
			parent.entries.set(basename, entry);
			this._fireSoon({ type: vscode.FileChangeType.Created, uri });
		}
		entry.mtime = Date.now();
		entry.size = content.byteLength;
		entry.data = content;

		this._fireSoon({ type: vscode.FileChangeType.Changed, uri });
	}

	// --- manage files/folders

	rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { overwrite: boolean }): void {
		console.log('rename called for', oldUri.toString(), 'to', newUri.toString());

		if (!options.overwrite && this._lookup(newUri, true)) {
			throw vscode.FileSystemError.FileExists(newUri);
		}

		const entry = this._lookup(oldUri, false);
		const oldParent = this._lookupParentDirectory(oldUri);

		const newParent = this._lookupParentDirectory(newUri);
		const newName = path.posix.basename(newUri.path);

		oldParent.entries.delete(entry.name);
		entry.name = newName;
		newParent.entries.set(newName, entry);

		this._fireSoon(
			{ type: vscode.FileChangeType.Deleted, uri: oldUri },
			{ type: vscode.FileChangeType.Created, uri: newUri }
		);
	}

	delete(uri: vscode.Uri): void {
		console.log('delete called for', uri.toString());

		const dirname = uri.with({ path: path.posix.dirname(uri.path) });
		const basename = path.posix.basename(uri.path);
		const parent = this._lookupAsDirectory(dirname, false);
		if (!parent.entries.has(basename)) {
			throw vscode.FileSystemError.FileNotFound(uri);
		}
		parent.entries.delete(basename);
		parent.mtime = Date.now();
		parent.size -= 1;
		this._fireSoon({ type: vscode.FileChangeType.Changed, uri: dirname }, { uri, type: vscode.FileChangeType.Deleted });
	}

	createDirectory(uri: vscode.Uri): void {
		console.log('createDirectory called for', uri.toString());

		const basename = path.posix.basename(uri.path);
		const dirname = uri.with({ path: path.posix.dirname(uri.path) });
		const parent = this._lookupAsDirectory(dirname, false);

		const entry = new Directory(basename);
		parent.entries.set(entry.name, entry);
		parent.mtime = Date.now();
		parent.size += 1;
		this._fireSoon({ type: vscode.FileChangeType.Changed, uri: dirname }, { type: vscode.FileChangeType.Created, uri });
	}

	// --- lookup

	private _lookup(uri: vscode.Uri, silent: false): Entry;
	private _lookup(uri: vscode.Uri, silent: boolean): Entry | undefined;
	private _lookup(uri: vscode.Uri, silent: boolean): Entry | undefined {
		console.log('lookup called for', uri.toString());
		const parts = uri.path.split('/');
		let entry: Entry = this.root;
		for (const part of parts) {
			if (!part) {
				continue;
			}
			let child: Entry | undefined;
			if (entry instanceof Directory) {
				child = entry.entries.get(part);
			}
			if (!child) {
				if (!silent) {
					throw vscode.FileSystemError.FileNotFound(uri);
				} else {
					return undefined;
				}
			}
			entry = child;
		}
		return entry;
	}

	private _lookupAsDirectory(uri: vscode.Uri, silent: boolean): Directory {
		console.log('lookupAsDirectory called for', uri.toString());
		const entry = this._lookup(uri, silent);
		if (entry instanceof Directory) {
			return entry;
		}
		throw vscode.FileSystemError.FileNotADirectory(uri);
	}

	private _lookupAsFile(uri: vscode.Uri, silent: boolean): File {
		console.log('lookupAsFile called for', uri.toString());
		const entry = this._lookup(uri, silent);
		if (entry instanceof File) {
			return entry;
		}
		throw vscode.FileSystemError.FileIsADirectory(uri);
	}

	private _lookupParentDirectory(uri: vscode.Uri): Directory {
		console.log('lookupParentDirectory called for', uri.toString());
		const dirname = uri.with({ path: path.posix.dirname(uri.path) });
		return this._lookupAsDirectory(dirname, false);
	}

	// --- manage file events

	private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
	private _bufferedEvents: vscode.FileChangeEvent[] = [];
	private _fireSoonHandle?: NodeJS.Timeout;

	readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._emitter.event;

	watch(_resource: vscode.Uri): vscode.Disposable {
		// ignore, fires for all changes...
		return new vscode.Disposable(() => { });
	}

	private _fireSoon(...events: vscode.FileChangeEvent[]): void {
		console.log('Firing events:', events);
		this._bufferedEvents.push(...events);

		if (this._fireSoonHandle) {
			clearTimeout(this._fireSoonHandle);
		}

		this._fireSoonHandle = setTimeout(() => {
			this._emitter.fire(this._bufferedEvents);
			this._bufferedEvents.length = 0;
		}, 5);
	}

	public async close(): Promise<void> {
		if (this.client) {
			await this.client.closeRdb();
			this.client.close();
			this.client = undefined;
			console.log('gRPC client closed');
		}
	}

	private getIdFromUri(uri: vscode.Uri): number | undefined {
		const parts = uri.path.split('/');
		const lastPart = parts[parts.length - 1];
		const match = lastPart.match(/^(\d+)\s?/);
		if (match) {
			return parseInt(match[1], 10);
		}
		return undefined;
	}
	
	private getFileLabel(chapter: LoadChapterResponse) {
		switch (chapter.chapterType) {
			case ' ':
				return `${chapter.chapterNumber.toString().padStart(4, '0')} _ ${chapter.chapterName.trim()}`;
			default:
				return `${chapter.chapterNumber.toString().padStart(4, '0')} ${chapter.chapterType.trim()} ${chapter.chapterName.trim()}.pas`;
		}
	}
}
