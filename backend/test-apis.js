#!/usr/bin/env node

import APITester from './src/utils/apiTester.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
    console.log('🧪 Crypto API Testing Suite');
    console.log('Testing which APIs work reliably from your location...\n');
    
    const tester = new APITester();
    
    try {
        // Run all API tests
        const results = await tester.runAllTests();
        
        // Print detailed report
        tester.printReport();
        
        // Save results to file
        const resultsFile = join(__dirname, 'api-test-results.json');
        await tester.saveResults(resultsFile);
        
        // Print next steps
        console.log('\n🎯 Next Steps:');
        console.log('1. Review the detailed results in api-test-results.json');
        console.log('2. Check which APIs have the highest success rates');
        console.log('3. We\'ll rebuild the system using only the working APIs');
        
        // Exit with appropriate code
        const workingAPIs = results.summary.workingAPIs;
        if (workingAPIs === 0) {
            console.log('\n❌ No APIs are working. Check your network connection.');
            process.exit(1);
        } else {
            console.log(`\n✅ Found ${workingAPIs} working API(s). Ready to proceed!`);
            process.exit(0);
        }
        
    } catch (error) {
        console.error('\n🚨 Test suite failed:', error.message);
        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Run the tests
main();