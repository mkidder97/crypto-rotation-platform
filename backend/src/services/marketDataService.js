import workingAPIClient from './workingAPIClients.js';
import db from '../models/database.js';

class MarketDataService {
    constructor() {
        this.primarySource = 'unified'; // Use unified working API client
        this.fallbackEnabled = true; // Enable fallback to cached data
    }

    // Fetch and combine market metrics from working APIs
    async fetchCurrentMetrics() {
        try {
            // Get all metrics from unified working API client
            const metrics = await workingAPIClient.getRotationMetrics();
            
            // Get weekly candle patterns
            const weeklyPatterns = await workingAPIClient.getWeeklyPatterns();
            
            // Combine all data
            const combinedMetrics = {
                ...metrics,
                eth_btc_trend: weeklyPatterns.eth_btc.trend,
                eth_btc_consecutive_candles: weeklyPatterns.eth_btc.consecutive_candles
            };
            
            // Save to database
            db.insertMarketMetrics(combinedMetrics);
            
            return combinedMetrics;
        } catch (error) {
            console.error('Error fetching market metrics:', error);
            
            // Fallback to latest database entry if API fails
            const latestMetrics = db.getLatestMarketMetrics();
            if (latestMetrics) {
                console.log('Using cached metrics from database');
                return latestMetrics;
            }
            
            throw error;
        }
    }

    // Fetch historical data for backtesting
    async fetchHistoricalData(symbol, startDate, endDate) {
        try {
            // Calculate days between dates
            const start = new Date(startDate);
            const end = new Date(endDate);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            
            // Fetch from working APIs
            const historicalData = await workingAPIClient.getHistoricalData(symbol, days);
            
            // Format and save to database
            const formattedData = historicalData.map(candle => ({
                symbol: symbol.toLowerCase(),
                timestamp: candle.timestamp,
                open: candle.open || candle.close,
                high: candle.high || candle.close,
                low: candle.low || candle.close,
                close: candle.close,
                volume: candle.volume || 0,
                market_cap: null
            }));
            
            db.insertPriceHistory(formattedData);
            
            return formattedData;
        } catch (error) {
            console.error(`Error fetching historical data for ${symbol}:`, error);
            
            // Try to get from database
            const cachedData = db.getPriceHistory(symbol, startDate, endDate);
            if (cachedData.length > 0) {
                return cachedData;
            }
            
            throw error;
        }
    }

    // Get altcoin market data
    async getAltcoinMetrics() {
        try {
            return await workingAPIClient.getAltcoinMetrics();
        } catch (error) {
            console.error('Error fetching altcoin metrics:', error);
            throw error;
        }
    }

    // Check for weekly candle patterns
    async checkCandlePatterns() {
        try {
            return await workingAPIClient.getWeeklyPatterns();
        } catch (error) {
            console.error('Error checking candle patterns:', error);
            throw error;
        }
    }

    // Calculate technical indicators
    async calculateTechnicalIndicators(symbol, period = 50) {
        try {
            const historicalData = await workingAPIClient.getHistoricalData(symbol, period);
            
            // Simple technical indicators calculation
            const closePrices = historicalData.map(d => d.close);
            const sma20 = closePrices.slice(-20).reduce((a, b) => a + b, 0) / 20;
            const sma50 = closePrices.length >= 50 ? closePrices.slice(-50).reduce((a, b) => a + b, 0) / 50 : null;
            
            return {
                symbol,
                rsi: null, // Simplified - can add RSI calculation later
                sma20: sma20,
                sma50: sma50,
                price: closePrices[closePrices.length - 1],
                trend: sma50 ? (sma20 > sma50 ? 'bullish' : 'bearish') : 'neutral'
            };
        } catch (error) {
            console.error(`Error calculating indicators for ${symbol}:`, error);
            throw error;
        }
    }

    // Get comprehensive market analysis
    async getMarketAnalysis() {
        const [currentMetrics, altMetrics, patterns] = await Promise.all([
            this.fetchCurrentMetrics(),
            this.getAltcoinMetrics(),
            this.checkCandlePatterns()
        ]);
        
        return {
            current_metrics: currentMetrics,
            altcoin_metrics: altMetrics,
            candle_patterns: patterns,
            timestamp: new Date().toISOString()
        };
    }
}

export default new MarketDataService();