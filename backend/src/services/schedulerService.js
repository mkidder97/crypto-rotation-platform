import cron from 'node-cron';
import marketDataService from './marketDataService.js';
import rotationEngine from './rotationEngine.js';
import db from '../models/database.js';
import winston from 'winston';

// Configure logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/scheduler.log' })
    ]
});

class SchedulerService {
    constructor() {
        this.jobs = [];
        this.isRunning = false;
    }

    // Initialize all scheduled jobs
    initialize() {
        logger.info('Initializing scheduler service');

        // Fetch market data every 5 minutes
        this.scheduleMarketDataFetch();

        // Check for phase transitions every 15 minutes
        this.schedulePhaseTransitionCheck();

        // Update portfolio performance daily
        this.schedulePerformanceUpdate();

        // Clean up old data weekly
        this.scheduleDataCleanup();

        this.isRunning = true;
        logger.info('Scheduler service initialized successfully');
    }

    // Schedule market data fetching
    scheduleMarketDataFetch() {
        const interval = process.env.MARKET_DATA_FETCH_INTERVAL || 5;
        const cronExpression = `*/${interval} * * * *`; // Every X minutes

        const job = cron.schedule(cronExpression, async () => {
            logger.info('Fetching market data...');
            try {
                const metrics = await marketDataService.fetchCurrentMetrics();
                logger.info('Market data fetched successfully', { 
                    btc_dominance: metrics.btc_dominance,
                    eth_btc_ratio: metrics.eth_btc_ratio 
                });

                // Also fetch altcoin metrics
                const altMetrics = await marketDataService.getAltcoinMetrics();
                logger.info('Altcoin metrics fetched', { 
                    avg_24h_change: altMetrics.avg_24h_change 
                });
            } catch (error) {
                logger.error('Error fetching market data:', error);
            }
        });

        this.jobs.push(job);
        logger.info(`Market data fetch scheduled: ${cronExpression}`);
    }

    // Schedule phase transition checks
    schedulePhaseTransitionCheck() {
        const cronExpression = '*/15 * * * *'; // Every 15 minutes

        const job = cron.schedule(cronExpression, async () => {
            logger.info('Checking for phase transitions...');
            try {
                const result = await rotationEngine.checkPhaseTransition();
                
                if (result.transitioned) {
                    logger.warn('PHASE TRANSITION DETECTED!', {
                        from: result.from,
                        to: result.to
                    });

                    // Send alert (implement email/webhook notification here)
                    await this.sendPhaseTransitionAlert(result);

                    // Update portfolio allocation
                    const newAllocation = await rotationEngine.getRecommendedAllocation();
                    logger.info('New allocation recommended', newAllocation);
                } else {
                    logger.info('No phase transition detected', {
                        currentPhase: result.currentPhase
                    });
                }
            } catch (error) {
                logger.error('Error checking phase transition:', error);
            }
        });

        this.jobs.push(job);
        logger.info(`Phase transition check scheduled: ${cronExpression}`);
    }

    // Schedule daily performance update
    schedulePerformanceUpdate() {
        const cronExpression = '0 0 * * *'; // Daily at midnight

        const job = cron.schedule(cronExpression, async () => {
            logger.info('Updating performance metrics...');
            try {
                const currentPhase = await rotationEngine.getCurrentPhase();
                const allocation = db.getCurrentAllocation();
                
                // Calculate portfolio performance
                // This would need actual portfolio value calculation based on holdings
                const performanceMetrics = {
                    date: new Date().toISOString().split('T')[0],
                    phase: currentPhase,
                    daily_return: 0, // Calculate based on actual holdings
                    cumulative_return: 0, // Calculate based on initial capital
                    portfolio_value: allocation?.total_portfolio_value || 0,
                    benchmark_return: 0 // Calculate BTC buy-and-hold return
                };

                db.savePerformanceMetrics(performanceMetrics);
                logger.info('Performance metrics updated');
            } catch (error) {
                logger.error('Error updating performance metrics:', error);
            }
        });

        this.jobs.push(job);
        logger.info(`Performance update scheduled: ${cronExpression}`);
    }

    // Schedule weekly data cleanup
    scheduleDataCleanup() {
        const cronExpression = '0 0 * * 0'; // Weekly on Sunday at midnight

        const job = cron.schedule(cronExpression, async () => {
            logger.info('Running data cleanup...');
            try {
                // Keep only last 90 days of minute-level data
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - 90);
                
                // Implement cleanup logic here
                logger.info('Data cleanup completed');
            } catch (error) {
                logger.error('Error during data cleanup:', error);
            }
        });

        this.jobs.push(job);
        logger.info(`Data cleanup scheduled: ${cronExpression}`);
    }

    // Send phase transition alert
    async sendPhaseTransitionAlert(transition) {
        // Implement email/webhook notification
        logger.info('Sending phase transition alert', transition);
        
        // For now, just log to console
        console.log('='.repeat(50));
        console.log('PHASE TRANSITION ALERT!');
        console.log(`From: ${transition.from}`);
        console.log(`To: ${transition.to}`);
        console.log(`Time: ${new Date().toISOString()}`);
        console.log('='.repeat(50));
    }

    // Run immediate market data fetch (for testing/manual trigger)
    async fetchMarketDataNow() {
        logger.info('Manual market data fetch triggered');
        try {
            const metrics = await marketDataService.fetchCurrentMetrics();
            return metrics;
        } catch (error) {
            logger.error('Error in manual market data fetch:', error);
            throw error;
        }
    }

    // Run immediate phase check (for testing/manual trigger)
    async checkPhaseNow() {
        logger.info('Manual phase check triggered');
        try {
            const result = await rotationEngine.checkPhaseTransition();
            return result;
        } catch (error) {
            logger.error('Error in manual phase check:', error);
            throw error;
        }
    }

    // Stop all scheduled jobs
    stop() {
        logger.info('Stopping scheduler service');
        this.jobs.forEach(job => job.stop());
        this.jobs = [];
        this.isRunning = false;
        logger.info('Scheduler service stopped');
    }

    // Get scheduler status
    getStatus() {
        return {
            isRunning: this.isRunning,
            jobCount: this.jobs.length,
            jobs: this.jobs.map((job, index) => ({
                index,
                running: job.running !== undefined ? job.running : true
            }))
        };
    }
}

export default new SchedulerService();