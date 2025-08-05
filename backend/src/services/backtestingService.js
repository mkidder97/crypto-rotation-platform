import db from '../models/database.js';
import marketDataService from './marketDataService.js';
import rotationEngine from './rotationEngine.js';

class BacktestingService {
    constructor() {
        this.initialCapital = 100000; // Default $100k starting capital
    }

    // Run a complete backtest for a date range
    async runBacktest(startDate, endDate, initialCapital = this.initialCapital) {
        try {
            console.log(`Starting backtest from ${startDate} to ${endDate}`);
            
            // Fetch historical data for required assets
            const [btcHistory, ethHistory] = await Promise.all([
                marketDataService.fetchHistoricalData('bitcoin', startDate, endDate),
                marketDataService.fetchHistoricalData('ethereum', startDate, endDate)
            ]);

            if (btcHistory.length === 0 || ethHistory.length === 0) {
                throw new Error('Insufficient historical data for backtesting');
            }

            // Calculate daily market metrics
            const dailyMetrics = this.calculateDailyMetrics(btcHistory, ethHistory);
            
            // Simulate portfolio performance
            const portfolioHistory = this.simulatePortfolioPerformance(
                dailyMetrics,
                initialCapital
            );

            // Calculate performance statistics
            const stats = this.calculatePerformanceStats(portfolioHistory, initialCapital);

            // Save backtest results
            const backtestResult = {
                start_date: startDate,
                end_date: endDate,
                initial_capital: initialCapital,
                final_capital: stats.finalValue,
                total_return: stats.totalReturn,
                max_drawdown: stats.maxDrawdown,
                sharpe_ratio: stats.sharpe,
                win_rate: stats.winRate,
                number_of_trades: stats.numberOfTrades,
                strategy_params: JSON.stringify({
                    btc_dominance_high: 68,
                    eth_btc_bounce_zone: [0.05, 0.053],
                    consecutive_candles_required: 2
                })
            };

            db.db.prepare(`
                INSERT INTO backtest_results 
                (start_date, end_date, initial_capital, final_capital, total_return, 
                 max_drawdown, sharpe_ratio, win_rate, number_of_trades, strategy_params)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                backtestResult.start_date,
                backtestResult.end_date,
                backtestResult.initial_capital,
                backtestResult.final_capital,
                backtestResult.total_return,
                backtestResult.max_drawdown,
                backtestResult.sharpe_ratio,
                backtestResult.win_rate,
                backtestResult.number_of_trades,
                backtestResult.strategy_params
            );

            return {
                results: backtestResult,
                portfolio_history: portfolioHistory,
                phase_transitions: stats.phaseTransitions
            };

        } catch (error) {
            console.error('Backtest error:', error);
            throw error;
        }
    }

    // Calculate daily market metrics from price history
    calculateDailyMetrics(btcHistory, ethHistory) {
        const metrics = [];
        
        for (let i = 0; i < Math.min(btcHistory.length, ethHistory.length); i++) {
            const btcData = btcHistory[i];
            const ethData = ethHistory[i];
            
            // Skip if dates don't match
            if (btcData.timestamp !== ethData.timestamp) continue;

            // Calculate basic metrics
            const btcPrice = btcData.close;
            const ethPrice = ethData.close;
            const ethBtcRatio = ethPrice / btcPrice;
            
            // Simplified dominance calculation (would need more coins for accuracy)
            const btcMarketCap = btcPrice * 21000000; // Approximate BTC supply
            const ethMarketCap = ethPrice * 120000000; // Approximate ETH supply
            const totalMarketCap = btcMarketCap + ethMarketCap + (ethMarketCap * 3); // Rough approximation
            const btcDominance = (btcMarketCap / totalMarketCap) * 100;
            
            // Simplified TOTAL3/ETH ratio
            const total3MarketCap = ethMarketCap * 2; // Very rough approximation
            const total3EthRatio = total3MarketCap / ethMarketCap;

            metrics.push({
                timestamp: btcData.timestamp,
                btc_price: btcPrice,
                eth_price: ethPrice,
                btc_dominance: btcDominance,
                eth_btc_ratio: ethBtcRatio,
                total3_eth_ratio: total3EthRatio,
                btc_volume: btcData.volume,
                eth_volume: ethData.volume
            });
        }
        
        return metrics;
    }

    // Simulate portfolio performance based on rotation strategy
    simulatePortfolioPerformance(dailyMetrics, initialCapital) {
        let currentCapital = initialCapital;
        let currentPhase = 'BTC_HEAVY';
        let portfolioHistory = [];
        let phaseTransitions = [];
        let lastTransitionIndex = 0;

        // Current allocation
        let allocation = {
            btc: 80,
            eth: 15,
            alt: 5,
            cash: 0
        };

        for (let i = 0; i < dailyMetrics.length; i++) {
            const metrics = dailyMetrics[i];
            
            // Determine phase based on metrics
            const newPhase = this.determinePhaseFromMetrics(metrics);
            
            if (newPhase !== currentPhase && i > lastTransitionIndex + 7) { // Min 7 days between transitions
                phaseTransitions.push({
                    date: metrics.timestamp,
                    from: currentPhase,
                    to: newPhase,
                    btc_dominance: metrics.btc_dominance,
                    eth_btc_ratio: metrics.eth_btc_ratio
                });
                
                currentPhase = newPhase;
                allocation = this.getPhaseAllocation(newPhase);
                lastTransitionIndex = i;
            }

            // Calculate daily returns based on allocation
            const prevMetrics = i > 0 ? dailyMetrics[i - 1] : metrics;
            const btcReturn = (metrics.btc_price - prevMetrics.btc_price) / prevMetrics.btc_price;
            const ethReturn = (metrics.eth_price - prevMetrics.eth_price) / prevMetrics.eth_price;
            const altReturn = ethReturn * 1.5; // Assume alts are 1.5x more volatile than ETH
            const cashReturn = 0.0001; // 0.01% daily for cash (roughly 4% APY)

            const portfolioReturn = 
                (allocation.btc / 100) * btcReturn +
                (allocation.eth / 100) * ethReturn +
                (allocation.alt / 100) * altReturn +
                (allocation.cash / 100) * cashReturn;

            currentCapital *= (1 + portfolioReturn);

            portfolioHistory.push({
                date: metrics.timestamp,
                value: currentCapital,
                phase: currentPhase,
                daily_return: portfolioReturn,
                btc_price: metrics.btc_price,
                eth_price: metrics.eth_price,
                allocation: { ...allocation }
            });
        }

        return { history: portfolioHistory, transitions: phaseTransitions };
    }

    // Determine phase from metrics (simplified version of rotation engine logic)
    determinePhaseFromMetrics(metrics) {
        const { btc_dominance, eth_btc_ratio, total3_eth_ratio } = metrics;

        // Alt season conditions
        if (btc_dominance < 65 && eth_btc_ratio > 0.055 && total3_eth_ratio > 2.2) {
            return 'ALT_SEASON';
        }

        // ETH rotation conditions
        if (btc_dominance > 65 && eth_btc_ratio >= 0.048 && eth_btc_ratio <= 0.055) {
            return 'ETH_ROTATION';
        }

        // Cash heavy conditions (bear market)
        if (btc_dominance < 45 || eth_btc_ratio < 0.045) {
            return 'CASH_HEAVY';
        }

        // Default to BTC heavy
        return 'BTC_HEAVY';
    }

    // Get allocation for a specific phase
    getPhaseAllocation(phase) {
        const allocations = {
            'BTC_HEAVY': { btc: 80, eth: 15, alt: 5, cash: 0 },
            'ETH_ROTATION': { btc: 25, eth: 65, alt: 10, cash: 0 },
            'ALT_SEASON': { btc: 15, eth: 25, alt: 60, cash: 0 },
            'CASH_HEAVY': { btc: 30, eth: 20, alt: 0, cash: 50 }
        };
        return allocations[phase] || allocations['BTC_HEAVY'];
    }

    // Calculate performance statistics
    calculatePerformanceStats(portfolioData, initialCapital) {
        const history = portfolioData.history;
        const transitions = portfolioData.transitions;
        
        if (history.length === 0) {
            throw new Error('No portfolio history data');
        }

        const finalValue = history[history.length - 1].value;
        const totalReturn = (finalValue - initialCapital) / initialCapital;

        // Calculate maximum drawdown
        let maxDrawdown = 0;
        let peak = initialCapital;
        
        for (const day of history) {
            if (day.value > peak) {
                peak = day.value;
            }
            const drawdown = (peak - day.value) / peak;
            if (drawdown > maxDrawdown) {
                maxDrawdown = drawdown;
            }
        }

        // Calculate Sharpe ratio (simplified)
        const dailyReturns = history.map(day => day.daily_return);
        const avgDailyReturn = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length;
        const volatility = Math.sqrt(
            dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - avgDailyReturn, 2), 0) / dailyReturns.length
        );
        const sharpe = volatility > 0 ? (avgDailyReturn * Math.sqrt(252)) / (volatility * Math.sqrt(252)) : 0;

        // Calculate win rate
        const positiveReturns = dailyReturns.filter(ret => ret > 0).length;
        const winRate = positiveReturns / dailyReturns.length;

        return {
            finalValue,
            totalReturn,
            maxDrawdown,
            sharpe,
            winRate,
            numberOfTrades: transitions.length,
            phaseTransitions: transitions,
            avgDailyReturn: avgDailyReturn * 100,
            volatility: volatility * 100,
            totalDays: history.length
        };
    }

    // Compare with buy-and-hold strategy
    async compareWithBuyAndHold(startDate, endDate, initialCapital = this.initialCapital) {
        const strategyResult = await this.runBacktest(startDate, endDate, initialCapital);
        
        // Calculate BTC buy-and-hold
        const btcHistory = await marketDataService.fetchHistoricalData('bitcoin', startDate, endDate);
        const btcStartPrice = btcHistory[0].close;
        const btcEndPrice = btcHistory[btcHistory.length - 1].close;
        const btcReturn = (btcEndPrice - btcStartPrice) / btcStartPrice;
        const btcFinalValue = initialCapital * (1 + btcReturn);

        // Calculate ETH buy-and-hold
        const ethHistory = await marketDataService.fetchHistoricalData('ethereum', startDate, endDate);
        const ethStartPrice = ethHistory[0].close;
        const ethEndPrice = ethHistory[ethHistory.length - 1].close;
        const ethReturn = (ethEndPrice - ethStartPrice) / ethStartPrice;
        const ethFinalValue = initialCapital * (1 + ethReturn);

        return {
            strategy: {
                final_value: strategyResult.results.final_capital,
                total_return: strategyResult.results.total_return,
                max_drawdown: strategyResult.results.max_drawdown,
                sharpe_ratio: strategyResult.results.sharpe_ratio
            },
            btc_hold: {
                final_value: btcFinalValue,
                total_return: btcReturn,
                outperformance: (strategyResult.results.final_capital - btcFinalValue) / btcFinalValue
            },
            eth_hold: {
                final_value: ethFinalValue,
                total_return: ethReturn,
                outperformance: (strategyResult.results.final_capital - ethFinalValue) / ethFinalValue
            }
        };
    }

    // Get historical backtest results
    getBacktestHistory() {
        return db.db.prepare(`
            SELECT * FROM backtest_results 
            ORDER BY created_at DESC 
            LIMIT 20
        `).all();
    }
}

export default new BacktestingService();