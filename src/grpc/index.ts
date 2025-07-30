/**
 * fand-grpc-client
 * A gRPC client library for the RDB service
 */

// Export the RdbClient class
export { GrpcRdbClient } from './grpcRdbClient';

// Export all types
export {
  Empty,
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
  RdbServiceClient
} from './types';

// Re-export gRPC credentials for convenience
export { credentials } from '@grpc/grpc-js';