import * as path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

/**
 * Options for loading the proto file
 */
const PROTO_OPTIONS: protoLoader.Options = {
  keepCase: false,
  longs: Number,
  enums: String,
  defaults: true,
  oneofs: true,
};

/**
 * Loads the RDB proto file and returns the package definition
 */
export function loadRdbProto() {
  const protoPath = path.resolve(__dirname, 'rdb.proto');
  
  // Load the proto file
  const packageDefinition = protoLoader.loadSync(protoPath, PROTO_OPTIONS);
  
  // Load the package definition
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rdbPackage = grpc.loadPackageDefinition(packageDefinition).rdb as any;
  
  return {
    rdbPackage,
    RdbService: rdbPackage.RdbService,
  };
}