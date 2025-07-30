import * as grpc from '@grpc/grpc-js';
import { loadRdbProto } from './proto-loader';
import {
  RdbServiceClient,
  OpenRDBRequest,
  OpenRDBResponse,
  ChaptersCountResponse,
  ChaptersListResponse,
  LoadChapterRequest,
  LoadChapterResponse,
  ClearRdbResponse,
  SaveChapterRequest,
  SaveChapterResponse,
  CloseRdbResponse,
  Empty
} from './types';

/**
 * GrpcRdbClient class that implements the RdbServiceClient interface
 */
export class GrpcRdbClient implements RdbServiceClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private client: any;

  /**
   * Creates a new GrpcRdbClient instance
   * @param address The address of the gRPC server (e.g., "localhost:50051")
   * @param credentials Optional gRPC credentials (defaults to insecure credentials)
   */
  constructor(
    address: string,
    credentials: grpc.ChannelCredentials = grpc.credentials.createInsecure()
  ) {
    const { RdbService } = loadRdbProto();
    this.client = new RdbService(address, credentials);
  }

  /**
   * Promisify a gRPC call
   * @param method The gRPC method to call
   * @param request The request object
   * @returns A promise that resolves with the response
   */
  private promisify<TRequest, TResponse>(
    method: (request: TRequest, callback: (error: Error | null, response: TResponse) => void) => void,
    request: TRequest
  ): Promise<TResponse> {
    return new Promise((resolve, reject) => {
      method.call(this.client, request, (error: Error | null, response: TResponse) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Opens an RDB file and returns the number of records
   * @param request The OpenRDBRequest object
   * @returns A promise that resolves with the OpenRDBResponse
   */
  public openRDB(request: OpenRDBRequest): Promise<OpenRDBResponse> {
    return this.promisify<OpenRDBRequest, OpenRDBResponse>(
      this.client.openRdb, // Note: camelCase method name
      request
    );
  }

  /**
   * Gets the total number of chapters in the opened RDB
   * @returns A promise that resolves with the ChaptersCountResponse
   */
  public getChaptersCount(): Promise<ChaptersCountResponse> {
    return this.promisify<Empty, ChaptersCountResponse>(
      this.client.getChaptersCount, // Already camelCase
      {}
    );
  }

  /**
   * Gets the list of all chapters in the opened RDB
   * @returns A promise that resolves with the ChaptersListResponse
   */
  public getChaptersList(): Promise<ChaptersListResponse> {
    return this.promisify<Empty, ChaptersListResponse>(
      this.client.getChaptersList, // Already camelCase
      {}
    );
  }

  /**
   * Loads a specific chapter by number
   * @param request The LoadChapterRequest object
   * @returns A promise that resolves with the LoadChapterResponse
   */
  public loadChapter(request: LoadChapterRequest): Promise<LoadChapterResponse> {
    return this.promisify<LoadChapterRequest, LoadChapterResponse>(
      this.client.loadChapter, // Already camelCase
      request
    );
  }

  /**
   * Clears the RDB (sets record count to 0)
   * @returns A promise that resolves with the ClearRdbResponse
   */
  public clearRdb(): Promise<ClearRdbResponse> {
    return this.promisify<Empty, ClearRdbResponse>(
      this.client.clearRdb, // Already camelCase
      {}
    );
  }

  /**
   * Saves a new chapter with number, type, name, and text
   * @param request The SaveChapterRequest object
   * @returns A promise that resolves with the SaveChapterResponse
   */
  public saveChapter(request: SaveChapterRequest): Promise<SaveChapterResponse> {
    return this.promisify<SaveChapterRequest, SaveChapterResponse>(
      this.client.saveChapter, // Already camelCase
      request
    );
  }

  /**
   * Closes the RDB and saves the file
   * @returns A promise that resolves with the CloseRdbResponse
   */
  public closeRdb(): Promise<CloseRdbResponse> {
    return this.promisify<Empty, CloseRdbResponse>(
      this.client.closeRdb, // Already camelCase
      {}
    );
  }

  /**
   * Closes the gRPC channel
   */
  public close(): void {
    this.client.close();
  }
}