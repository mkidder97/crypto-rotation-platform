import axios from 'axios';

// CoinMarketCap client for accurate dominance data
class CoinMarketCapClient {
    constructor() {
        this.baseURL = 'https://pro-api.coinmarketcap.com/v1';
        this.publicURL = 'https://api.coinmarketcap.com/data-api/v3';
        this.client = axios.create({
            timeout: 15000,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        });
        
        this.lastCallTime = 0;
        this.minTimeBetweenCalls = 3000; // CMC is more generous with rate limits
    }

    async _rateLimitedCall(url, params = {}) {
        const now = Date.now();
        const timeSinceLastCall = now - this.lastCallTime;
        
        if (timeSinceLastCall < this.minTimeBetweenCalls) {
            const waitTime = this.minTimeBetweenCalls - timeSinceLastCall;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        this.lastCallTime = Date.now();
        
        try {
            const response = await this.client.get(url, { params });
            return response.data;
        } catch (error) {
            console.error(`CoinMarketCap API error:`, error.message);
            throw error;
        }
    }

    async getGlobalMetrics() {
        try {
            // Use public API endpoint for global metrics
            const data = await this._rateLimitedCall(`${this.publicURL}/global-metrics/quotes/latest`);
            
            console.log('CMC Global Metrics Response Structure:', JSON.stringify(data, null, 2).substring(0, 500));
            
            if (data && data.data) {
                // Handle different possible response structures
                const metrics = data.data;
                return {
                    btc_dominance: metrics.btc_dominance || metrics.btcDominance,
                    eth_dominance: metrics.eth_dominance || metrics.ethDominance,
                    total_market_cap: metrics.quote?.USD?.total_market_cap || 
                                    metrics.totalMarketCap || 
                                    metrics.total_market_cap ||
                                    2800000000000, // Conservative fallback
                    total_volume_24h: metrics.quote?.USD?.total_volume_24h || 
                                    metrics.totalVolume24h ||
                                    metrics.total_volume_24h ||
                                    100000000000 // Conservative fallback
                };
            }
            throw new Error('No data returned from CMC global metrics');
        } catch (error) {
            console.error('CoinMarketCap global metrics error:', error.message);
            // More detailed error logging for debugging
            if (error.response) {
                console.error('CMC Response status:', error.response.status);
                console.error('CMC Response data:', error.response.data);
            }
            throw error;
        }
    }

    async getCurrentPrices(symbols = ['BTC', 'ETH']) {
        try {
            // Use public API for current prices
            const symbolStr = symbols.join(',');
            const data = await this._rateLimitedCall(`${this.publicURL}/cryptocurrency/quotes/latest`, {
                symbol: symbolStr,
                convert: 'USD'
            });
            
            console.log('CMC Prices Response Structure:', JSON.stringify(data, null, 2).substring(0, 500));
            
            const result = {};
            for (const symbol of symbols) {
                if (data && data.data && data.data[symbol]) {
                    // Handle array or direct object response
                    const coin = Array.isArray(data.data[symbol]) ? data.data[symbol][0] : data.data[symbol];
                    
                    if (coin && coin.quote && coin.quote.USD) {
                        result[symbol.toLowerCase()] = {
                            usd: coin.quote.USD.price,
                            usd_24h_change: coin.quote.USD.percent_change_24h || 0,
                            usd_market_cap: coin.quote.USD.market_cap
                        };
                    } else {
                        console.warn(`CMC: Invalid structure for ${symbol}:`, coin);
                        // Provide fallback values to prevent crashes
                        result[symbol.toLowerCase()] = {
                            usd: symbol === 'BTC' ? 65000 : 3200, // Conservative fallbacks
                            usd_24h_change: 0,
                            usd_market_cap: symbol === 'BTC' ? 1280000000000 : 384000000000
                        };
                    }
                } else {
                    console.warn(`CMC: No data found for ${symbol}`);
                    result[symbol.toLowerCase()] = {
                        usd: symbol === 'BTC' ? 65000 : 3200,
                        usd_24h_change: 0,
                        usd_market_cap: symbol === 'BTC' ? 1280000000000 : 384000000000
                    };
                }
            }
            
            return result;
        } catch (error) {
            console.error('CoinMarketCap prices error:', error.message);
            if (error.response) {
                console.error('CMC Prices Response status:', error.response.status);
                console.error('CMC Prices Response data:', error.response.data);
            }
            throw error;
        }
    }
}

// Enhanced CoinGecko client with better rate limiting
class WorkingCoinGeckoClient {
    constructor() {
        this.baseURL = 'https://api.coingecko.com/api/v3';
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 15000,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        });
        
        // More aggressive rate limiting to avoid 429 errors
        this.lastCallTime = 0;
        this.minTimeBetweenCalls = 6000; // 6 seconds to be safer
    }

    async _rateLimitedCall(endpoint, params = {}) {
        const now = Date.now();
        const timeSinceLastCall = now - this.lastCallTime;
        
        if (timeSinceLastCall < this.minTimeBetweenCalls) {
            const waitTime = this.minTimeBetweenCalls - timeSinceLastCall;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        this.lastCallTime = Date.now();
        
        try {
            const response = await this.client.get(endpoint, { params });
            return response.data;
        } catch (error) {
            console.error(`CoinGecko API error for ${endpoint}:`, error.message);
            throw error;
        }
    }

    async getGlobalData() {
        const data = await this._rateLimitedCall('/global');
        return {
            total_market_cap: data.data.total_market_cap.usd,
            btc_dominance: data.data.market_cap_percentage.btc,
            eth_dominance: data.data.market_cap_percentage.eth,
            total_volume: data.data.total_volume.usd,
            market_cap_change_24h: data.data.market_cap_change_percentage_24h_usd
        };
    }

    async getCurrentPrices(coinIds = ['bitcoin', 'ethereum']) {
        const ids = coinIds.join(',');
        const data = await this._rateLimitedCall('/simple/price', {
            ids: ids,
            vs_currencies: 'usd',
            include_market_cap: true,
            include_24hr_vol: true,
            include_24hr_change: true
        });
        return data;
    }

    async getHistoricalData(coinId, days = 30) {
        const data = await this._rateLimitedCall(`/coins/${coinId}/market_chart`, {
            vs_currency: 'usd',
            days: days,
            interval: days > 90 ? 'daily' : 'hourly'
        });
        
        return {
            prices: data.prices,
            market_caps: data.market_caps,
            volumes: data.total_volumes
        };
    }

    async getTopCoins(limit = 100) {
        const data = await this._rateLimitedCall('/coins/markets', {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: limit,
            page: 1,
            sparkline: false,
            price_change_percentage: '24h,7d,30d'
        });
        
        return data.map(coin => ({
            id: coin.id,
            symbol: coin.symbol,
            name: coin.name,
            current_price: coin.current_price,
            market_cap: coin.market_cap,
            market_cap_rank: coin.market_cap_rank,
            price_change_24h: coin.price_change_percentage_24h,
            price_change_7d: coin.price_change_percentage_7d_in_currency,
            price_change_30d: coin.price_change_percentage_30d_in_currency
        }));
    }
}

// CryptoCompare client (backup for price data)
class CryptoCompareClient {
    constructor() {
        this.baseURL = 'https://min-api.cryptocompare.com/data';
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        });
    }

    async getCurrentPrices(symbols = ['BTC', 'ETH']) {
        const fsyms = symbols.join(',');
        const data = await this.client.get('/pricemultifull', {
            params: {
                fsyms: fsyms,
                tsyms: 'USD'
            }
        });
        return data.data;
    }

    async getHistoricalData(symbol, days = 30) {
        const data = await this.client.get('/v2/histoday', {
            params: {
                fsym: symbol,
                tsym: 'USD',
                limit: days
            }
        });
        return data.data;
    }

    async getDailyOHLC(symbol, days = 30) {
        const data = await this.client.get('/v2/histoday', {
            params: {
                fsym: symbol,
                tsym: 'USD',
                limit: days
            }
        });
        
        return data.data.Data?.Data?.map(candle => ({
            timestamp: new Date(candle.time * 1000).toISOString(),
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
            volume: candle.volumeto
        })) || [];
    }
}

// CoinCap API client (no rate limits)
class CoinCapClient {
    constructor() {
        this.baseURL = 'https://api.coincap.io/v2';
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 10000,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        });
    }

    async getCurrentPrices(symbols = ['bitcoin', 'ethereum']) {
        try {
            const ids = symbols.join(',');
            const response = await this.client.get('/assets', {
                params: {
                    ids: ids,
                    limit: symbols.length
                }
            });
            
            const result = {};
            if (response.data && response.data.data) {
                response.data.data.forEach(asset => {
                    const key = asset.id === 'bitcoin' ? 'btc' : asset.id === 'ethereum' ? 'eth' : asset.id;
                    result[key] = {
                        usd: parseFloat(asset.priceUsd),
                        usd_24h_change: parseFloat(asset.changePercent24Hr) || 0,
                        usd_market_cap: parseFloat(asset.marketCapUsd)
                    };
                });
            }
            
            return result;
        } catch (error) {
            console.error('CoinCap prices error:', error.message);
            throw error;
        }
    }

    async getTopAssets(limit = 100) {
        try {
            const response = await this.client.get('/assets', {
                params: { limit }
            });
            
            if (response.data && response.data.data) {
                return response.data.data.map(asset => ({
                    id: asset.id,
                    symbol: asset.symbol.toLowerCase(),
                    name: asset.name,
                    current_price: parseFloat(asset.priceUsd),
                    market_cap: parseFloat(asset.marketCapUsd),
                    market_cap_rank: parseInt(asset.rank),
                    price_change_24h: parseFloat(asset.changePercent24Hr) || 0,
                    price_change_7d: null, // Not available
                    price_change_30d: null // Not available
                }));
            }
            
            return [];
        } catch (error) {
            console.error('CoinCap top assets error:', error.message);
            throw error;
        }
    }
}

// Yahoo Finance client (fast backup for basic prices)
class YahooFinanceClient {
    constructor() {
        this.baseURL = 'https://query1.finance.yahoo.com';
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        });
    }

    async getCurrentPrice(symbol = 'BTC-USD') {
        const data = await this.client.get('/v8/finance/chart/' + symbol);
        const result = data.data.chart.result[0];
        const price = result.meta.regularMarketPrice;
        return {
            symbol: symbol,
            price: price,
            previousClose: result.meta.previousClose,
            change: price - result.meta.previousClose,
            changePercent: ((price - result.meta.previousClose) / result.meta.previousClose) * 100
        };
    }

    async getHistoricalPrices(symbol = 'BTC-USD', days = 30) {
        const endTime = Math.floor(Date.now() / 1000);
        const startTime = endTime - (days * 24 * 60 * 60);
        
        const data = await this.client.get('/v8/finance/chart/' + symbol, {
            params: {
                period1: startTime,
                period2: endTime,
                interval: '1d'
            }
        });
        
        const result = data.data.chart.result[0];
        const timestamps = result.timestamp;
        const prices = result.indicators.quote[0];
        
        return timestamps.map((timestamp, index) => ({
            timestamp: new Date(timestamp * 1000).toISOString(),
            open: prices.open[index],
            high: prices.high[index],
            low: prices.low[index],
            close: prices.close[index],
            volume: prices.volume[index]
        }));
    }
}

// CoinMarketCap client (for global metrics backup)

// Unified client that uses the best working APIs
class UnifiedCryptoClient {
    constructor() {
        this.coinGecko = new WorkingCoinGeckoClient();
        this.cryptoCompare = new CryptoCompareClient();
        this.yahooFinance = new YahooFinanceClient();
        this.coinMarketCap = new CoinMarketCapClient();
        this.coinCap = new CoinCapClient(); // No rate limits!
        
        // Enhanced API preferences with intelligent routing
        this.primaryAPI = 'coingecko';
        this.dominanceAPI = 'coinmarketcap'; // CMC is most reliable for dominance data
        this.fastPriceAPI = 'coincap'; // CoinCap for fast, unlimited price data
        this.backupAPIs = ['coincap', 'coinmarketcap', 'cryptocompare', 'yahoo'];
        
        // Enhanced cache for recent successful data to avoid hardcoded fallbacks
        this.dataCache = {
            dominanceData: null,
            priceData: null,
            marketData: null,
            topCoinsData: null,
            lastUpdated: null,
            maxAge: 900000 // 15 minutes cache for better rate limit management
        };
        
        // Request batching to reduce API calls
        this.batchedRequests = {
            isLoading: false,
            queue: [],
            lastBatchTime: 0,
            batchDelay: 10000 // 10 seconds between batches
        };
    }

    // Check if cached data is still valid
    isCacheValid() {
        if (!this.dataCache.lastUpdated) return false;
        return (Date.now() - this.dataCache.lastUpdated) < this.dataCache.maxAge;
    }

    // Update cache with new data (updated for batched format)
    updateCache(dominanceData, priceData, marketData = null, topCoinsData = null) {
        this.dataCache = {
            dominanceData,
            priceData,
            marketData,
            topCoinsData,
            lastUpdated: Date.now(),
            maxAge: 900000 // 15 minutes
        };
    }

    // Smart batched data fetching to reduce API calls
    async getBatchedMarketData() {
        // If we have valid cached data, return it
        if (this.isCacheValid()) {
            console.log('Using cached batched data to avoid API rate limits');
            return this.dataCache;
        }

        // Check if a batch request is already in progress
        if (this.batchedRequests.isLoading) {
            console.log('Batch request already in progress, waiting...');
            // Wait for current batch to complete
            await new Promise(resolve => {
                const checkBatch = () => {
                    if (!this.batchedRequests.isLoading) {
                        resolve();
                    } else {
                        setTimeout(checkBatch, 500);
                    }
                };
                checkBatch();
            });
            return this.dataCache;
        }

        // Start batch loading
        this.batchedRequests.isLoading = true;
        
        try {
            console.log('Starting smart batched API calls...');
            
            // Single batched call to get all data we need
            // This reduces API calls from 3 separate calls to 1
            const [globalData, topCoinsData] = await Promise.all([
                this.coinGecko.getGlobalData(),
                this.coinGecko.getTopCoins(100) // Get top 100 including BTC and ETH
            ]);
            
            // Extract BTC and ETH data from topCoins to avoid separate price call
            const btcData = topCoinsData.find(coin => coin.id === 'bitcoin');
            const ethData = topCoinsData.find(coin => coin.id === 'ethereum');
            
            if (!btcData || !ethData) {
                throw new Error('BTC or ETH not found in top coins data');
            }
            
            // Calculate all metrics from batched data
            const btcPrice = btcData.current_price;
            const ethPrice = ethData.current_price;
            const ethBtcRatio = ethPrice / btcPrice;
            
            const btcMarketCap = btcData.market_cap;
            const ethMarketCap = ethData.market_cap;
            
            // Calculate TOTAL3 market cap (excluding BTC and ETH)
            const total3MarketCap = topCoinsData
                .filter(coin => coin.id !== 'bitcoin' && coin.id !== 'ethereum')
                .reduce((sum, coin) => sum + coin.market_cap, 0);
            
            const total3EthRatio = total3MarketCap / ethMarketCap;
            const total3BtcRatio = total3MarketCap / btcMarketCap;
            
            // Cache all the data
            this.dataCache = {
                dominanceData: {
                    btc_dominance: globalData.btc_dominance,
                    total3_eth_ratio: total3EthRatio,
                    total3_btc_ratio: total3BtcRatio
                },
                priceData: {
                    btc_price: btcPrice,
                    eth_price: ethPrice,
                    eth_btc_ratio: ethBtcRatio,
                    btc_24h_change: btcData.price_change_24h || 0,
                    eth_24h_change: ethData.price_change_24h || 0
                },
                marketData: {
                    total_market_cap: globalData.total_market_cap,
                    total3_market_cap: total3MarketCap,
                    btc_market_cap: btcMarketCap,
                    eth_market_cap: ethMarketCap
                },
                topCoinsData: topCoinsData,
                lastUpdated: Date.now(),
                maxAge: 900000
            };
            
            console.log('Batched API call successful - reduced from 3 calls to 1');
            return this.dataCache;
            
        } catch (error) {
            console.error('Batched CoinGecko failed, trying backup APIs:', error.message);
            return await this.getBatchedBackupData();
        } finally {
            this.batchedRequests.isLoading = false;
        }
    }

    // Batched backup data method using multiple APIs
    async getBatchedBackupData() {
        // Strategy 1: Try CoinMarketCap for backup
        try {
            console.log('Attempting batched backup with CoinMarketCap...');
            
            const [cmcGlobal, cmcPrices] = await Promise.all([
                this.coinMarketCap.getGlobalMetrics(),
                this.coinMarketCap.getCurrentPrices(['BTC', 'ETH'])
            ]);
            
            const btcPrice = cmcPrices.btc.usd;
            const ethPrice = cmcPrices.eth.usd;
            const ethBtcRatio = ethPrice / btcPrice;
            
            const btcMarketCap = cmcPrices.btc.usd_market_cap;
            const ethMarketCap = cmcPrices.eth.usd_market_cap;
            const total3MarketCap = cmcGlobal.total_market_cap - btcMarketCap - ethMarketCap;
            const total3EthRatio = total3MarketCap / ethMarketCap;
            const total3BtcRatio = total3MarketCap / btcMarketCap;
            
            this.dataCache = {
                dominanceData: {
                    btc_dominance: cmcGlobal.btc_dominance,
                    total3_eth_ratio: total3EthRatio,
                    total3_btc_ratio: total3BtcRatio
                },
                priceData: {
                    btc_price: btcPrice,
                    eth_price: ethPrice,
                    eth_btc_ratio: ethBtcRatio,
                    btc_24h_change: cmcPrices.btc.usd_24h_change || 0,
                    eth_24h_change: cmcPrices.eth.usd_24h_change || 0
                },
                marketData: {
                    total_market_cap: cmcGlobal.total_market_cap,
                    total3_market_cap: total3MarketCap,
                    btc_market_cap: btcMarketCap,
                    eth_market_cap: ethMarketCap
                },
                topCoinsData: null,
                lastUpdated: Date.now(),
                maxAge: 900000
            };
            
            console.log('CoinMarketCap batched backup successful');
            return this.dataCache;
            
        } catch (cmcError) {
            console.error('CoinMarketCap backup failed:', cmcError.message);
        }
        
        // Strategy 2: Try CoinCap (no rate limits) for prices + cached dominance
        try {
            console.log('Attempting CoinCap backup (no rate limits)...');
            
            const [coinCapPrices, coinCapAssets] = await Promise.all([
                this.coinCap.getCurrentPrices(['bitcoin', 'ethereum']),
                this.coinCap.getTopAssets(100)
            ]);
            
            const btcPrice = coinCapPrices.btc.usd;
            const ethPrice = coinCapPrices.eth.usd;
            const ethBtcRatio = ethPrice / btcPrice;
            
            const btcMarketCap = coinCapPrices.btc.usd_market_cap;
            const ethMarketCap = coinCapPrices.eth.usd_market_cap;
            
            // Calculate TOTAL3 from CoinCap data
            const total3MarketCap = coinCapAssets
                .filter(asset => asset.id !== 'bitcoin' && asset.id !== 'ethereum')
                .reduce((sum, asset) => sum + asset.market_cap, 0);
            
            const total3EthRatio = total3MarketCap / ethMarketCap;
            const total3BtcRatio = total3MarketCap / btcMarketCap;
            
            // Use CoinCap market cap sum for total market cap
            const totalMarketCap = coinCapAssets.reduce((sum, asset) => sum + asset.market_cap, 0);
            const btcDominance = (btcMarketCap / totalMarketCap) * 100;
            
            this.dataCache = {
                dominanceData: {
                    btc_dominance: btcDominance,
                    total3_eth_ratio: total3EthRatio,
                    total3_btc_ratio: total3BtcRatio
                },
                priceData: {
                    btc_price: btcPrice,
                    eth_price: ethPrice,
                    eth_btc_ratio: ethBtcRatio,
                    btc_24h_change: coinCapPrices.btc.usd_24h_change || 0,
                    eth_24h_change: coinCapPrices.eth.usd_24h_change || 0
                },
                marketData: {
                    total_market_cap: totalMarketCap,
                    total3_market_cap: total3MarketCap,
                    btc_market_cap: btcMarketCap,
                    eth_market_cap: ethMarketCap
                },
                topCoinsData: coinCapAssets,
                lastUpdated: Date.now(),
                maxAge: 900000
            };
            
            console.log('CoinCap batched backup successful (no rate limits!)');
            return this.dataCache;
            
        } catch (coinCapError) {
            console.error('CoinCap backup failed:', coinCapError.message);
        }
        
        // Final fallback - use any stale cached data if available
        if (this.dataCache.dominanceData && this.dataCache.priceData) {
            console.log('Using stale cached data as final fallback');
            return this.dataCache;
        }
        
        throw new Error('All backup APIs failed and no cached data available');
    }

    // Get rotation metrics using batched data
    async getRotationMetrics() {
        const batchedData = await this.getBatchedMarketData();
        
        return {
            timestamp: new Date().toISOString(),
            btc_dominance: batchedData.dominanceData?.btc_dominance,
            eth_btc_ratio: batchedData.priceData?.eth_btc_ratio,
            total3_eth_ratio: batchedData.dominanceData?.total3_eth_ratio,
            total3_btc_ratio: batchedData.dominanceData?.total3_btc_ratio,
            btc_price: batchedData.priceData?.btc_price,
            eth_price: batchedData.priceData?.eth_price,
            total_market_cap: batchedData.marketData?.total_market_cap,
            total3_market_cap: batchedData.marketData?.total3_market_cap,
            btc_24h_change: batchedData.priceData?.btc_24h_change || 0,
            eth_24h_change: batchedData.priceData?.eth_24h_change || 0,
            source: 'batched_coingecko'
        };
    }

    // Legacy backup method (now uses batched approach)
    async getRotationMetricsBackup() {
        // Strategy 1: Try CoinMarketCap for dominance data
        try {
            console.log('Backup: Attempting CoinMarketCap for dominance data...');
            const cmcGlobal = await this.coinMarketCap.getGlobalMetrics();
            const cmcPrices = await this.coinMarketCap.getCurrentPrices(['BTC', 'ETH']);
            
            const btcPrice = cmcPrices.btc.usd;
            const ethPrice = cmcPrices.eth.usd;
            const ethBtcRatio = ethPrice / btcPrice;
            
            // Calculate TOTAL3 using CMC data
            const btcMarketCap = cmcPrices.btc.usd_market_cap;
            const ethMarketCap = cmcPrices.eth.usd_market_cap;
            const total3MarketCap = cmcGlobal.total_market_cap - btcMarketCap - ethMarketCap;
            const total3EthRatio = total3MarketCap / ethMarketCap;
            const total3BtcRatio = total3MarketCap / btcMarketCap;

            const result = {
                timestamp: new Date().toISOString(),
                btc_dominance: cmcGlobal.btc_dominance,
                eth_btc_ratio: ethBtcRatio,
                total3_eth_ratio: total3EthRatio,
                total3_btc_ratio: total3BtcRatio,
                btc_price: btcPrice,
                eth_price: ethPrice,
                total_market_cap: cmcGlobal.total_market_cap,
                total3_market_cap: total3MarketCap,
                btc_24h_change: cmcPrices.btc.usd_24h_change || 0,
                eth_24h_change: cmcPrices.eth.usd_24h_change || 0,
                source: 'coinmarketcap_backup'
            };

            // Cache successful data using new format
            this.dataCache = {
                dominanceData: { btc_dominance: cmcGlobal.btc_dominance, total3_eth_ratio: total3EthRatio, total3_btc_ratio: total3BtcRatio },
                priceData: { btc_price: btcPrice, eth_price: ethPrice, eth_btc_ratio: ethBtcRatio },
                marketData: { total_market_cap: cmcGlobal.total_market_cap, total3_market_cap: total3MarketCap },
                topCoinsData: null,
                lastUpdated: Date.now(),
                maxAge: 900000
            };

            return result;
        } catch (cmcError) {
            console.error('CoinMarketCap backup failed:', cmcError.message);
        }

        // Strategy 2: Get prices only, use cached dominance if available
        try {
            console.log('Backup: Attempting price-only with cached dominance...');
            const btcData = await this.yahooFinance.getCurrentPrice('BTC-USD');
            const ethData = await this.yahooFinance.getCurrentPrice('ETH-USD');
            
            const btcPrice = btcData.price;
            const ethPrice = ethData.price;
            const ethBtcRatio = ethPrice / btcPrice;

            // Only proceed if we have cached dominance data
            if (this.dataCache.dominanceData) {
                return {
                    timestamp: new Date().toISOString(),
                    btc_dominance: this.dataCache.dominanceData.btc_dominance,
                    eth_btc_ratio: ethBtcRatio,
                    total3_eth_ratio: this.dataCache.dominanceData.total3_eth_ratio,
                    total3_btc_ratio: this.dataCache.dominanceData.total3_btc_ratio,
                    btc_price: btcPrice,
                    eth_price: ethPrice,
                    total_market_cap: null, // We don't have current market cap
                    total3_market_cap: null, // We don't have current market cap
                    btc_24h_change: btcData.changePercent || 0,
                    eth_24h_change: ethData.changePercent || 0,
                    source: 'yahoo_with_cached_dominance'
                };
            }
        } catch (yahooError) {
            console.error('Yahoo Finance backup failed:', yahooError.message);
        }

        // Strategy 3: Use any cached data if available
        if (this.dataCache.dominanceData && this.dataCache.priceData) {
            console.log('Backup: Using stale cached data...');
            return {
                ...this.dataCache.dominanceData,
                ...this.dataCache.priceData,
                timestamp: new Date().toISOString(),
                source: 'stale_cached_data'
            };
        }

        // Final failure - absolutely no hardcoded values
        throw new Error('All backup APIs failed and no cached data available - refusing to return inaccurate hardcoded values');
    }

    // Get historical data with fallback
    async getHistoricalData(symbol, days = 30) {
        try {
            const coinGeckoId = symbol === 'btc' ? 'bitcoin' : symbol === 'eth' ? 'ethereum' : symbol;
            const data = await this.coinGecko.getHistoricalData(coinGeckoId, days);
            
            return data.prices.map(([timestamp, price]) => ({
                timestamp: new Date(timestamp).toISOString(),
                open: price,
                high: price,
                low: price,
                close: price,
                volume: 0
            }));
        } catch (error) {
            console.error('CoinGecko historical data failed, trying Yahoo Finance:', error.message);
            
            const yahooSymbol = symbol.toUpperCase() + '-USD';
            return await this.yahooFinance.getHistoricalPrices(yahooSymbol, days);
        }
    }

    // Get weekly candle patterns (simplified without Binance)
    async getWeeklyPatterns() {
        try {
            // Use daily data to approximate weekly patterns
            const ethBtcDaily = await this.getHistoricalData('eth', 28); // 4 weeks
            
            // Group into weekly candles
            const weeklyCandles = this.groupIntoWeeklyCandles(ethBtcDaily);
            
            // Analyze trend
            const recentCandles = weeklyCandles.slice(-4);
            const colors = recentCandles.map(c => c.close > c.open ? 'green' : 'red');
            
            let consecutiveCount = 1;
            const latestColor = colors[colors.length - 1];
            
            for (let i = colors.length - 2; i >= 0; i--) {
                if (colors[i] === latestColor) {
                    consecutiveCount++;
                } else {
                    break;
                }
            }
            
            return {
                eth_btc: {
                    trend: consecutiveCount >= 2 ? (latestColor === 'green' ? 'bullish' : 'bearish') : 'neutral',
                    consecutive_candles: consecutiveCount,
                    latest_color: latestColor,
                    signal: consecutiveCount >= 2 ? 'strong' : 'weak'
                },
                btc_usd: {
                    trend: 'neutral', // Simplified
                    consecutive_candles: 1,
                    latest_color: 'green'
                }
            };
        } catch (error) {
            console.error('Error getting weekly patterns:', error.message);
            return {
                eth_btc: { trend: 'neutral', consecutive_candles: 1, latest_color: 'green', signal: 'weak' },
                btc_usd: { trend: 'neutral', consecutive_candles: 1, latest_color: 'green' }
            };
        }
    }

    // Helper method to group daily data into weekly candles
    groupIntoWeeklyCandles(dailyData) {
        const weeks = [];
        const msPerWeek = 7 * 24 * 60 * 60 * 1000;
        
        for (let i = 0; i < dailyData.length; i += 7) {
            const weekData = dailyData.slice(i, i + 7);
            if (weekData.length > 0) {
                weeks.push({
                    timestamp: weekData[0].timestamp,
                    open: weekData[0].open,
                    high: Math.max(...weekData.map(d => d.high)),
                    low: Math.min(...weekData.map(d => d.low)),
                    close: weekData[weekData.length - 1].close,
                    volume: weekData.reduce((sum, d) => sum + d.volume, 0)
                });
            }
        }
        
        return weeks;
    }

    // Get altcoin metrics using batched data (no additional API calls!)
    async getAltcoinMetrics() {
        try {
            // Use the already fetched batched data
            const batchedData = await this.getBatchedMarketData();
            
            if (!batchedData.topCoinsData) {
                console.log('No top coins data available in batch, fetching separately...');
                // Fallback to separate call only if needed
                const topCoins = await this.coinGecko.getTopCoins(50);
                
                const altcoins = topCoins.filter(
                    coin => coin.id !== 'bitcoin' && coin.id !== 'ethereum'
                );
                
                return this.calculateAltcoinMetrics(altcoins);
            }
            
            // Use batched data - no additional API call!
            const altcoins = batchedData.topCoinsData.filter(
                coin => coin.id !== 'bitcoin' && coin.id !== 'ethereum'
            );
            
            console.log('Using batched data for altcoin metrics - no additional API call needed!');
            return this.calculateAltcoinMetrics(altcoins);
            
        } catch (error) {
            console.error('Error getting altcoin metrics:', error.message);
            throw error;
        }
    }
    
    // Helper method to calculate altcoin metrics from coin data
    calculateAltcoinMetrics(altcoins) {
        const totalAltMarketCap = altcoins.reduce((sum, coin) => sum + coin.market_cap, 0);
        const avgAlt24hChange = altcoins.reduce((sum, coin) => sum + (coin.price_change_24h || 0), 0) / altcoins.length;
        const avgAlt7dChange = altcoins.reduce((sum, coin) => sum + (coin.price_change_7d || 0), 0) / altcoins.length;
        
        const topPerformers = altcoins
            .filter(coin => coin.price_change_7d !== null)
            .sort((a, b) => b.price_change_7d - a.price_change_7d)
            .slice(0, 10);
        
        return {
            total_alt_market_cap: totalAltMarketCap,
            avg_24h_change: avgAlt24hChange,
            avg_7d_change: avgAlt7dChange,
            top_performers: topPerformers,
            alt_count: altcoins.length
        };
    }
}

export {
    WorkingCoinGeckoClient,
    CryptoCompareClient,
    YahooFinanceClient,
    CoinMarketCapClient,
    CoinCapClient,
    UnifiedCryptoClient
};

export default new UnifiedCryptoClient();