import axios from 'axios';

class CoinGeckoClient {
    constructor() {
        this.baseURL = 'https://api.coingecko.com/api/v3';
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 10000,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        // Rate limiting: CoinGecko free tier allows 10-30 calls/minute
        this.lastCallTime = 0;
        this.minTimeBetweenCalls = 2000; // 2 seconds between calls to be safe
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

    // Get global market data including total market cap and dominance
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

    // Get current prices for multiple coins
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

    // Get historical market data for a coin
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

    // Get OHLC data for a coin
    async getOHLCData(coinId, days = 30) {
        const data = await this._rateLimitedCall(`/coins/${coinId}/ohlc`, {
            vs_currency: 'usd',
            days: days
        });
        
        // Format: [timestamp, open, high, low, close]
        return data.map(candle => ({
            timestamp: candle[0],
            open: candle[1],
            high: candle[2],
            low: candle[3],
            close: candle[4]
        }));
    }

    // Get list of top coins by market cap
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
            price_change_7d: coin.price_change_percentage_7d,
            price_change_30d: coin.price_change_percentage_30d
        }));
    }

    // Calculate market metrics needed for rotation strategy
    async getRotationMetrics() {
        try {
            // Get global data for BTC dominance
            const globalData = await this.getGlobalData();
            
            // Get BTC and ETH prices
            const prices = await this.getCurrentPrices(['bitcoin', 'ethereum']);
            
            // Get top 100 coins for TOTAL3 calculation
            const topCoins = await this.getTopCoins(100);
            
            // Calculate TOTAL3 market cap (excluding BTC and ETH)
            const total3MarketCap = topCoins
                .filter(coin => coin.id !== 'bitcoin' && coin.id !== 'ethereum')
                .reduce((sum, coin) => sum + coin.market_cap, 0);
            
            // Calculate ratios
            const btcPrice = prices.bitcoin.usd;
            const ethPrice = prices.ethereum.usd;
            const ethBtcRatio = ethPrice / btcPrice;
            
            // Estimate TOTAL3/ETH ratio
            const ethMarketCap = prices.ethereum.usd_market_cap;
            const total3EthRatio = total3MarketCap / ethMarketCap;
            
            // Estimate TOTAL3/BTC ratio
            const btcMarketCap = prices.bitcoin.usd_market_cap;
            const total3BtcRatio = total3MarketCap / btcMarketCap;
            
            return {
                timestamp: new Date().toISOString(),
                btc_dominance: globalData.btc_dominance,
                eth_btc_ratio: ethBtcRatio,
                total3_eth_ratio: total3EthRatio,
                total3_btc_ratio: total3BtcRatio,
                btc_price: btcPrice,
                eth_price: ethPrice,
                total_market_cap: globalData.total_market_cap,
                total3_market_cap: total3MarketCap
            };
        } catch (error) {
            console.error('Error calculating rotation metrics:', error);
            throw error;
        }
    }
}

export default new CoinGeckoClient();