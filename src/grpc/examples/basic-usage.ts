/**
 * Example demonstrating basic usage of the fand-grpc-client library
 * 
 * To run this example:
 * 1. Make sure you have a running RDB gRPC server
 * 2. Install ts-node: npm install -g ts-node
 * 3. Run: ts-node examples/basic-usage.ts
 */

import { GrpcRdbClient } from '../grpcRdbClient';

// Server address - replace with your actual server address
const SERVER_ADDRESS = 'localhost:7787';

// Create a client instance
const client = new GrpcRdbClient(SERVER_ADDRESS);

// Main function to demonstrate the client usage
async function main() {
  try {
    console.log('Connecting to RDB service at', SERVER_ADDRESS);
    
    // Open an RDB file
    console.log('\n1. Opening RDB file...');
    const openResponse = await client.openRDB({ rdbName: 'example.rdb' });
    console.log(`   Success! RDB file opened with ${openResponse.recordsCount} records`);
    
    // Get chapters count
    console.log('\n2. Getting chapters count...');
    const countResponse = await client.getChaptersCount();
    console.log(`   Total chapters: ${countResponse.count}`);
    
    // Get chapters list
    console.log('\n3. Getting chapters list...');
    const listResponse = await client.getChaptersList();
    console.log(`   Retrieved ${listResponse.chaptersList.length} chapters`);
    if (listResponse.chaptersList.length > 0) {
      console.log('   First chapter:', listResponse.chaptersList[0]);
    }
    
    // Save a new chapter
    console.log('\n4. Saving a new chapter...');
    const saveResponse = await client.saveChapter({
      chapterNumber: countResponse.count + 1,
      chapterType: 'EXAMPLE',
      chapterName: 'Example Chapter',
      chapterText: 'console.log("Hello from RDB!");'
    });
    console.log(`   Chapter saved. Total records count: ${saveResponse.totalRecordsCount}`);
    
    // Load the newly created chapter
    const chapterNumber = saveResponse.totalRecordsCount;
    console.log(`\n5. Loading chapter #${chapterNumber}...`);
    const loadResponse = await client.loadChapter({ chapterNumber });
    
    console.log('   Chapter loaded successfully:');
    console.log('   Chapter Number:', loadResponse.chapterNumber);
    console.log('   Chapter Type:', loadResponse.chapterType);
    console.log('   Chapter Name:', loadResponse.chapterName);
    console.log('   Chapter Text:', loadResponse.chapterText);
    
    // Close the RDB
    console.log('\n6. Closing RDB...');
    const closeResponse = await client.closeRdb();
    console.log(`   RDB closed. Final records count: ${closeResponse.finalRecordsCount}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Always close the client when done
    console.log('\nClosing gRPC client connection');
    client.close();
  }
}

// Run the example
main().catch(console.error);