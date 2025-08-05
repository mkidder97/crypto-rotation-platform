import axios from 'axios';
import { promises as fs } from 'fs';

class APITester {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            tests: [],
            summary: {},
            recommendations: []
        };
    }

    // Test a single API endpoint
    async testEndpoint(apiName, endpointName, url, params = {}, headers = {}) {
        const startTime = Date.now();
        const test = {
            api: apiName,
            endpoint: endpointName,
            url: url,
            status: 'pending',
            responseTime: null,
            statusCode: null,
            error: null,
            data: null,
            dataQuality: {}
        };

        try {
            const response = await axios.get(url, {
                params,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                    ...headers
                },
                timeout: 10000
            });

            test.responseTime = Date.now() - startTime;
            test.statusCode = response.status;
            test.status = 'success';
            test.data = this.truncateData(response.data);
            test.dataQuality = this.analyzeDataQuality(response.data, apiName, endpointName);

        } catch (error) {
            test.responseTime = Date.now() - startTime;
            test.statusCode = error.response?.status || null;
            test.status = 'failed';
            test.error = {
                message: error.message,
                code: error.code,
                response: error.response?.data ? this.truncateData(error.response.data) : null
            };
        }

        this.results.tests.push(test);
        console.log(`✓ Tested ${apiName} - ${endpointName}: ${test.status} (${test.responseTime}ms)`);
        return test;
    }

    // Truncate large response data for logging
    truncateData(data) {
        const str = JSON.stringify(data);
        return str.length > 1000 ? str.substring(0, 1000) + '...' : str;
    }

    // Analyze data quality for our specific needs
    analyzeDataQuality(data, apiName, endpointName) {
        const quality = {
            hasRequiredFields: false,
            dataCompleteness: 0,
            fieldCount: 0,
            issues: []
        };

        try {
            if (apiName === 'CoinGecko') {
                if (endpointName === 'global') {
                    quality.hasRequiredFields = !!(data?.data?.market_cap_percentage?.btc && data?.data?.total_market_cap?.usd);
                    quality.fieldCount = Object.keys(data?.data || {}).length;
                }
                if (endpointName === 'prices') {
                    quality.hasRequiredFields = !!(data?.bitcoin?.usd && data?.ethereum?.usd);
                    quality.fieldCount = Object.keys(data || {}).length;
                }
            }
            
            if (apiName === 'Binance') {
                if (endpointName === 'ticker') {
                    quality.hasRequiredFields = !!(data?.symbol && data?.price);
                    quality.fieldCount = Object.keys(data || {}).length;
                }
            }

            quality.dataCompleteness = quality.fieldCount > 0 ? (quality.hasRequiredFields ? 100 : 50) : 0;

        } catch (error) {
            quality.issues.push(`Data analysis error: ${error.message}`);
        }

        return quality;
    }

    // Test CoinGecko API
    async testCoinGecko() {
        console.log('\n🦎 Testing CoinGecko API...');
        
        await this.testEndpoint(
            'CoinGecko',
            'global',
            'https://api.coingecko.com/api/v3/global'
        );

        await this.testEndpoint(
            'CoinGecko',
            'prices',
            'https://api.coingecko.com/api/v3/simple/price',
            {
                ids: 'bitcoin,ethereum',
                vs_currencies: 'usd',
                include_market_cap: true,
                include_24hr_change: true
            }
        );

        await this.testEndpoint(
            'CoinGecko',
            'markets',
            'https://api.coingecko.com/api/v3/coins/markets',
            {
                vs_currency: 'usd',
                order: 'market_cap_desc',
                per_page: 10,
                page: 1
            }
        );

        await this.testEndpoint(
            'CoinGecko',
            'bitcoin_history',
            'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart',
            {
                vs_currency: 'usd',
                days: 7
            }
        );
    }

    // Test Binance API
    async testBinance() {
        console.log('\n🔶 Testing Binance API...');
        
        await this.testEndpoint(
            'Binance',
            'ticker',
            'https://api.binance.com/api/v3/ticker/price',
            { symbol: 'BTCUSDT' }
        );

        await this.testEndpoint(
            'Binance',
            'klines',
            'https://api.binance.com/api/v3/klines',
            {
                symbol: 'ETHBTC',
                interval: '1d',
                limit: 7
            }
        );

        await this.testEndpoint(
            'Binance',
            '24hr_ticker',
            'https://api.binance.com/api/v3/ticker/24hr',
            { symbol: 'BTCUSDT' }
        );
    }

    // Test CryptoCompare API
    async testCryptoCompare() {
        console.log('\n📊 Testing CryptoCompare API...');
        
        await this.testEndpoint(
            'CryptoCompare',
            'price',
            'https://min-api.cryptocompare.com/data/price',
            {
                fsym: 'BTC',
                tsyms: 'USD,ETH'
            }
        );

        await this.testEndpoint(
            'CryptoCompare',
            'daily_history',
            'https://min-api.cryptocompare.com/data/v2/histoday',
            {
                fsym: 'BTC',
                tsym: 'USD',
                limit: 7
            }
        );

        await this.testEndpoint(
            'CryptoCompare',
            'top_coins',
            'https://min-api.cryptocompare.com/data/top/mktcapfull',
            {
                limit: 10,
                tsym: 'USD'
            }
        );
    }

    // Test CoinCap API
    async testCoinCap() {
        console.log('\n🧢 Testing CoinCap API...');
        
        await this.testEndpoint(
            'CoinCap',
            'assets',
            'https://api.coincap.io/v2/assets',
            { limit: 10 }
        );

        await this.testEndpoint(
            'CoinCap',
            'bitcoin',
            'https://api.coincap.io/v2/assets/bitcoin'
        );

        await this.testEndpoint(
            'CoinCap',
            'bitcoin_history',
            'https://api.coincap.io/v2/assets/bitcoin/history',
            {
                interval: 'd1',
                start: Date.now() - (7 * 24 * 60 * 60 * 1000),
                end: Date.now()
            }
        );
    }

    // Test Yahoo Finance API
    async testYahooFinance() {
        console.log('\n🏦 Testing Yahoo Finance API...');
        
        // Note: Yahoo Finance doesn't have an official API, but we can test some endpoints
        await this.testEndpoint(
            'YahooFinance',
            'quote',
            'https://query1.finance.yahoo.com/v8/finance/chart/BTC-USD',
            {
                interval: '1d',
                range: '7d'
            }
        );
    }

    // Test Alpha Vantage API (requires API key, but we'll test without)
    async testAlphaVantage() {
        console.log('\n📈 Testing Alpha Vantage API...');
        
        // Test without API key to see error response
        await this.testEndpoint(
            'AlphaVantage',
            'crypto_daily',
            'https://www.alphavantage.co/query',
            {
                function: 'DIGITAL_CURRENCY_DAILY',
                symbol: 'BTC',
                market: 'USD'
            }
        );
    }

    // Test CoinMarketCap API (free tier)
    async testCoinMarketCap() {
        console.log('\n💰 Testing CoinMarketCap API...');
        
        // Test without API key first
        await this.testEndpoint(
            'CoinMarketCap',
            'listings',
            'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
            { limit: 10 }
        );

        // Test the public web scraping endpoints
        await this.testEndpoint(
            'CoinMarketCap',
            'global_metrics',
            'https://api.coinmarketcap.com/data-api/v3/global-metrics/quotes/latest'
        );
    }

    // Generate summary and recommendations
    generateSummary() {
        const apiSummary = {};
        const workingAPIs = [];
        const failedAPIs = [];

        // Group tests by API
        this.results.tests.forEach(test => {
            if (!apiSummary[test.api]) {
                apiSummary[test.api] = {
                    total: 0,
                    successful: 0,
                    failed: 0,
                    avgResponseTime: 0,
                    endpoints: []
                };
            }

            apiSummary[test.api].total++;
            apiSummary[test.api].endpoints.push({
                name: test.endpoint,
                status: test.status,
                responseTime: test.responseTime,
                dataQuality: test.dataQuality.dataCompleteness
            });

            if (test.status === 'success') {
                apiSummary[test.api].successful++;
            } else {
                apiSummary[test.api].failed++;
            }
        });

        // Calculate averages and determine working APIs
        Object.keys(apiSummary).forEach(apiName => {
            const api = apiSummary[apiName];
            const successfulTests = this.results.tests.filter(t => t.api === apiName && t.status === 'success');
            
            if (successfulTests.length > 0) {
                api.avgResponseTime = successfulTests.reduce((sum, t) => sum + t.responseTime, 0) / successfulTests.length;
                api.successRate = (api.successful / api.total) * 100;
                
                if (api.successRate >= 50) {
                    workingAPIs.push({
                        name: apiName,
                        successRate: api.successRate,
                        avgResponseTime: api.avgResponseTime,
                        workingEndpoints: api.successful
                    });
                } else {
                    failedAPIs.push(apiName);
                }
            } else {
                failedAPIs.push(apiName);
            }
        });

        // Sort working APIs by success rate and response time
        workingAPIs.sort((a, b) => {
            if (a.successRate !== b.successRate) {
                return b.successRate - a.successRate; // Higher success rate first
            }
            return a.avgResponseTime - b.avgResponseTime; // Faster response time first
        });

        this.results.summary = {
            totalAPIs: Object.keys(apiSummary).length,
            workingAPIs: workingAPIs.length,
            failedAPIs: failedAPIs.length,
            apiDetails: apiSummary
        };

        // Generate recommendations
        this.generateRecommendations(workingAPIs, failedAPIs);
    }

    generateRecommendations(workingAPIs, failedAPIs) {
        const recommendations = [];

        if (workingAPIs.length === 0) {
            recommendations.push({
                type: 'critical',
                message: 'No APIs are working reliably. Consider using VPN or different network.',
                action: 'Check network restrictions and try alternative endpoints'
            });
        } else {
            recommendations.push({
                type: 'success',
                message: `Found ${workingAPIs.length} working API(s)`,
                action: `Use these APIs as primary data sources: ${workingAPIs.map(api => api.name).join(', ')}`
            });

            // Recommend primary API
            if (workingAPIs.length > 0) {
                const primaryAPI = workingAPIs[0];
                recommendations.push({
                    type: 'primary',
                    message: `Use ${primaryAPI.name} as primary API`,
                    action: `${primaryAPI.name} has ${primaryAPI.successRate.toFixed(1)}% success rate with ${primaryAPI.avgResponseTime.toFixed(0)}ms average response time`
                });
            }

            // Recommend backup APIs
            if (workingAPIs.length > 1) {
                recommendations.push({
                    type: 'backup',
                    message: 'Implement fallback chain',
                    action: `Use ${workingAPIs.slice(1).map(api => api.name).join(', ')} as backup sources`
                });
            }
        }

        // Rate limiting recommendations
        const coinGecko = workingAPIs.find(api => api.name === 'CoinGecko');
        if (coinGecko) {
            recommendations.push({
                type: 'rate_limit',
                message: 'CoinGecko rate limiting',
                action: 'Use 3-5 second delays between requests to avoid 429 errors'
            });
        }

        // Geographic restriction warnings
        if (failedAPIs.includes('Binance')) {
            recommendations.push({
                type: 'warning',
                message: 'Binance API blocked',
                action: 'Geographic restrictions detected. Avoid Binance API or use VPN'
            });
        }

        this.results.recommendations = recommendations;
    }

    // Run all tests
    async runAllTests() {
        console.log('🚀 Starting comprehensive API testing...\n');
        
        await this.testCoinGecko();
        await this.testBinance();
        await this.testCryptoCompare();
        await this.testCoinCap();
        await this.testYahooFinance();
        await this.testAlphaVantage();
        await this.testCoinMarketCap();
        
        this.generateSummary();
        
        console.log('\n✅ Testing complete!');
        return this.results;
    }

    // Save results to file
    async saveResults(filename = 'api-test-results.json') {
        try {
            await fs.writeFile(filename, JSON.stringify(this.results, null, 2));
            console.log(`📄 Results saved to ${filename}`);
        } catch (error) {
            console.error('Error saving results:', error.message);
        }
    }

    // Print formatted report
    printReport() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 API TEST RESULTS SUMMARY');
        console.log('='.repeat(80));
        
        console.log(`\n📈 Overall Statistics:`);
        console.log(`   Total APIs tested: ${this.results.summary.totalAPIs}`);
        console.log(`   Working APIs: ${this.results.summary.workingAPIs}`);
        console.log(`   Failed APIs: ${this.results.summary.failedAPIs}`);
        
        console.log(`\n🔍 API Details:`);
        Object.entries(this.results.summary.apiDetails).forEach(([apiName, details]) => {
            console.log(`\n   ${apiName}:`);
            console.log(`     Success Rate: ${((details.successful / details.total) * 100).toFixed(1)}%`);
            console.log(`     Avg Response Time: ${details.avgResponseTime.toFixed(0)}ms`);
            console.log(`     Working Endpoints: ${details.successful}/${details.total}`);
        });
        
        console.log(`\n💡 Recommendations:`);
        this.results.recommendations.forEach(rec => {
            const icon = rec.type === 'critical' ? '🚨' : 
                        rec.type === 'success' ? '✅' : 
                        rec.type === 'primary' ? '🏆' : 
                        rec.type === 'backup' ? '🔄' : 
                        rec.type === 'warning' ? '⚠️' : '💡';
            console.log(`   ${icon} ${rec.message}`);
            console.log(`      → ${rec.action}`);
        });
        
        console.log('\n' + '='.repeat(80));
    }
}

export default APITester;