import axios from 'axios';

class BinanceClient {
    constructor() {
        this.baseURL = 'https://api.binance.com/api/v3';
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 10000,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
    }

    async _makeRequest(endpoint, params = {}) {
        try {
            const response = await this.client.get(endpoint, { params });
            return response.data;
        } catch (error) {
            console.error(`Binance API error for ${endpoint}:`, error.message);
            throw error;
        }
    }

    // Get current price for a symbol
    async getCurrentPrice(symbol) {
        const data = await this._makeRequest('/ticker/price', { symbol });
        return parseFloat(data.price);
    }

    // Get 24hr ticker statistics
    async get24hrTicker(symbol) {
        const data = await this._makeRequest('/ticker/24hr', { symbol });
        return {
            symbol: data.symbol,
            priceChange: parseFloat(data.priceChange),
            priceChangePercent: parseFloat(data.priceChangePercent),
            weightedAvgPrice: parseFloat(data.weightedAvgPrice),
            prevClosePrice: parseFloat(data.prevClosePrice),
            lastPrice: parseFloat(data.lastPrice),
            bidPrice: parseFloat(data.bidPrice),
            askPrice: parseFloat(data.askPrice),
            openPrice: parseFloat(data.openPrice),
            highPrice: parseFloat(data.highPrice),
            lowPrice: parseFloat(data.lowPrice),
            volume: parseFloat(data.volume),
            quoteVolume: parseFloat(data.quoteVolume),
            openTime: data.openTime,
            closeTime: data.closeTime,
            count: data.count
        };
    }

    // Get kline/candlestick data
    async getKlines(symbol, interval = '1d', limit = 100) {
        const data = await this._makeRequest('/klines', {
            symbol,
            interval,
            limit
        });
        
        return data.map(kline => ({
            openTime: kline[0],
            open: parseFloat(kline[1]),
            high: parseFloat(kline[2]),
            low: parseFloat(kline[3]),
            close: parseFloat(kline[4]),
            volume: parseFloat(kline[5]),
            closeTime: kline[6],
            quoteAssetVolume: parseFloat(kline[7]),
            numberOfTrades: kline[8],
            takerBuyBaseAssetVolume: parseFloat(kline[9]),
            takerBuyQuoteAssetVolume: parseFloat(kline[10])
        }));
    }

    // Get historical klines for backtesting
    async getHistoricalKlines(symbol, interval, startTime, endTime = null) {
        const params = {
            symbol,
            interval,
            startTime,
            limit: 1000 // Max limit per request
        };
        
        if (endTime) {
            params.endTime = endTime;
        }
        
        const data = await this._makeRequest('/klines', params);
        
        return data.map(kline => ({
            timestamp: new Date(kline[0]).toISOString(),
            open: parseFloat(kline[1]),
            high: parseFloat(kline[2]),
            low: parseFloat(kline[3]),
            close: parseFloat(kline[4]),
            volume: parseFloat(kline[5])
        }));
    }

    // Get order book depth
    async getOrderBook(symbol, limit = 100) {
        const data = await this._makeRequest('/depth', {
            symbol,
            limit
        });
        
        return {
            lastUpdateId: data.lastUpdateId,
            bids: data.bids.map(bid => ({
                price: parseFloat(bid[0]),
                quantity: parseFloat(bid[1])
            })),
            asks: data.asks.map(ask => ({
                price: parseFloat(ask[0]),
                quantity: parseFloat(ask[1])
            }))
        };
    }

    // Get exchange info
    async getExchangeInfo() {
        const data = await this._makeRequest('/exchangeInfo');
        return data;
    }

    // Get specific trading pairs we need for rotation strategy
    async getRotationPairs() {
        const pairs = ['BTCUSDT', 'ETHUSDT', 'ETHBTC'];
        const promises = pairs.map(symbol => this.get24hrTicker(symbol));
        const results = await Promise.all(promises);
        
        const pairData = {};
        results.forEach(result => {
            pairData[result.symbol] = result;
        });
        
        return {
            btc_price: pairData.BTCUSDT.lastPrice,
            eth_price: pairData.ETHUSDT.lastPrice,
            eth_btc_ratio: pairData.ETHBTC.lastPrice,
            btc_24h_change: pairData.BTCUSDT.priceChangePercent,
            eth_24h_change: pairData.ETHUSDT.priceChangePercent,
            eth_btc_24h_change: pairData.ETHBTC.priceChangePercent
        };
    }

    // Get weekly candles for trend confirmation
    async getWeeklyCandles(symbol, weeks = 4) {
        const klines = await this.getKlines(symbol, '1w', weeks);
        
        // Check for consecutive red/green candles
        const candleColors = klines.map(k => k.close > k.open ? 'green' : 'red');
        
        // Count consecutive candles of the same color from most recent
        let consecutiveCount = 1;
        let currentColor = candleColors[candleColors.length - 1];
        
        for (let i = candleColors.length - 2; i >= 0; i--) {
            if (candleColors[i] === currentColor) {
                consecutiveCount++;
            } else {
                break;
            }
        }
        
        return {
            candles: klines,
            colors: candleColors,
            latestColor: currentColor,
            consecutiveCount: consecutiveCount,
            trend: consecutiveCount >= 2 ? (currentColor === 'green' ? 'bullish' : 'bearish') : 'neutral'
        };
    }

    // Calculate technical indicators from price data
    calculateIndicators(priceData) {
        // Simple RSI calculation
        const calculateRSI = (prices, period = 14) => {
            if (prices.length < period + 1) return null;
            
            let gains = 0;
            let losses = 0;
            
            // First average gain/loss
            for (let i = 1; i <= period; i++) {
                const change = prices[i] - prices[i - 1];
                if (change > 0) gains += change;
                else losses -= change;
            }
            
            let avgGain = gains / period;
            let avgLoss = losses / period;
            
            // Calculate RS and RSI
            const rs = avgGain / avgLoss;
            const rsi = 100 - (100 / (1 + rs));
            
            return rsi;
        };
        
        // Extract closing prices
        const closePrices = priceData.map(d => d.close);
        
        return {
            rsi: calculateRSI(closePrices),
            sma20: closePrices.slice(-20).reduce((a, b) => a + b, 0) / 20,
            sma50: closePrices.length >= 50 ? closePrices.slice(-50).reduce((a, b) => a + b, 0) / 50 : null
        };
    }
}

export default new BinanceClient();