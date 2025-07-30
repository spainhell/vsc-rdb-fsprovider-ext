# fand-grpc-client

A gRPC client library for the RDB service.

## Installation

```bash
npm install fand-grpc-client
```

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/fand-grpc-client.git
cd fand-grpc-client

# Install dependencies
npm install
```

### Building

```bash
npm run build
```

### Running the Example

The repository includes an example script that demonstrates how to use the library:

```bash
# Run the example
npm run example
```

Note: You need to have a running RDB gRPC server at the address specified in the example (default: localhost:50051).

## Usage

### Basic Usage

```typescript
import { RdbClient } from 'fand-grpc-client';

// Create a client instance
const client = new RdbClient('localhost:50051');

// Example: Open an RDB file
async function openRdbFile() {
  try {
    const response = await client.openRDB({ rdbName: 'example.rdb' });
    console.log(`Opened RDB file with ${response.recordsCount} records`);
  } catch (error) {
    console.error('Error opening RDB file:', error);
  }
}

// Example: Load a record and get its chapter information
async function loadAndGetChapterInfo(recordNumber: number) {
  try {
    // Load the record
    const loadResult = await client.loadRecord({ recordNumber });
    
    if (loadResult.result === 0) {
      // Get chapter information
      const [chapterType, chapterName, chapterCode] = await Promise.all([
        client.getChapterType(),
        client.getChapterName(),
        client.getChapterCode()
      ]);
      
      console.log('Chapter Type:', chapterType.chapterType);
      console.log('Chapter Name:', chapterName.chapterName);
      console.log('Chapter Code:', chapterCode.chapterCode);
    } else {
      console.error('Failed to load record:', recordNumber);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example: Save a new chapter
async function saveNewChapter() {
  try {
    const response = await client.saveChapter({
      chapterType: 'EXAMPLE',
      chapterName: 'Example Chapter',
      chapterCode: 'console.log("Hello, World!");'
    });
    
    console.log(`Saved chapter. New records count: ${response.newRecordsCount}`);
  } catch (error) {
    console.error('Error saving chapter:', error);
  }
}

// Don't forget to close the client when done
function cleanup() {
  client.close();
}
```

### Using Secure Connections

```typescript
import { RdbClient, credentials } from 'fand-grpc-client';

// Create secure credentials
const sslCreds = credentials.createSsl(
  fs.readFileSync('path/to/ca.pem'),
  fs.readFileSync('path/to/key.pem'),
  fs.readFileSync('path/to/cert.pem')
);

// Create a client with secure credentials
const secureClient = new RdbClient('localhost:50051', sslCreds);
```

## API Reference

### RdbClient

The main client class for interacting with the RDB service.

#### Constructor

```typescript
constructor(address: string, credentials?: grpc.ChannelCredentials)
```

- `address`: The address of the gRPC server (e.g., "localhost:50051")
- `credentials`: Optional gRPC credentials (defaults to insecure credentials)

#### Methods

All methods return Promises that resolve with the response object or reject with an error.

- `openRDB(request: OpenRDBRequest): Promise<OpenRDBResponse>`
  - Opens an RDB file and returns the number of records
  
- `getRecordsCount(): Promise<RecordsCountResponse>`
  - Gets the total number of records in the opened RDB
  
- `loadRecord(request: LoadRecordRequest): Promise<LoadRecordResponse>`
  - Loads a specific record by number
  
- `getChapterType(): Promise<ChapterTypeResponse>`
  - Gets the chapter type of the currently loaded record
  
- `getChapterName(): Promise<ChapterNameResponse>`
  - Gets the chapter name of the currently loaded record
  
- `getChapterCodeLength(): Promise<ChapterCodeLengthResponse>`
  - Gets the length of the chapter code
  
- `getChapterCode(): Promise<ChapterCodeResponse>`
  - Gets the chapter code of the currently loaded record
  
- `closeRecord(request: CloseRecordRequest): Promise<CloseRecordResponse>`
  - Closes a specific record
  
- `clearRdb(): Promise<ClearRdbResponse>`
  - Clears the RDB (sets record count to 0)
  
- `saveChapter(request: SaveChapterRequest): Promise<SaveChapterResponse>`
  - Saves a new chapter with type, name, and code
  
- `closeRdb(): Promise<CloseRdbResponse>`
  - Closes the RDB and saves the file
  
- `close(): void`
  - Closes the gRPC channel

## License

ISC