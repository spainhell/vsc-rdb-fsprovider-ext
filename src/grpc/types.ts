/**
 * TypeScript interfaces for the RDB gRPC service
 */

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Empty {}

export interface OpenRDBRequest {
  rdbName: string;
}

export interface OpenRDBResponse {
  recordsCount: number;
}

export interface ChaptersCountResponse {
  count: number;
}

export interface ChaptersListResponse {
  chaptersList: LoadChapterResponse[];
}

export interface LoadChapterRequest {
  chapterNumber: number;
}

export interface LoadChapterResponse {
  chapterNumber: number;
  chapterType: string;
  chapterName: string;
  chapterText: string;
}

export interface ClearRdbResponse {
  result: number;
}

export interface SaveChapterRequest {
  chapterNumber: number;
  chapterType: string;
  chapterName: string;
  chapterText: string;
}

export interface SaveChapterResponse {
  totalRecordsCount: number;
}

export interface CloseRdbResponse {
  finalRecordsCount: number;
}

/**
 * RdbService client interface based on the proto definition
 */
export interface RdbServiceClient {
  openRDB(request: OpenRDBRequest): Promise<OpenRDBResponse>;
  getChaptersCount(): Promise<ChaptersCountResponse>;
  getChaptersList(): Promise<ChaptersListResponse>;
  loadChapter(request: LoadChapterRequest): Promise<LoadChapterResponse>;
  saveChapter(request: SaveChapterRequest): Promise<SaveChapterResponse>;
  clearRdb(): Promise<ClearRdbResponse>;
  closeRdb(): Promise<CloseRdbResponse>;
}