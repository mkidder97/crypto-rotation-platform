import { Router } from 'express';
import marketDataService from '../services/marketDataService.js';
import rotationEngine from '../services/rotationEngine.js';
import schedulerService from '../services/schedulerService.js';
import backtestingService from '../services/backtestingService.js';
import benjaminCowenAnalyzer from '../services/benjaminCowenAnalyzer.js';
import db from '../models/database.js';
import multer from 'multer';
import path from 'path';

const router = Router();

// Get current market metrics
router.get('/metrics/current', async (req, res) => {
    try {
        const metrics = await marketDataService.fetchCurrentMetrics();
        res.json({
            success: true,
            data: metrics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get historical market metrics
router.get('/metrics/history', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: 'startDate and endDate are required'
            });
        }
        
        const metrics = db.getMarketMetricsRange(startDate, endDate);
        res.json({
            success: true,
            data: metrics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get current phase and analysis
router.get('/phase/current', async (req, res) => {
    try {
        const analysis = await rotationEngine.getPhaseAnalysis();
        res.json({
            success: true,
            data: analysis
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get phase transition history
router.get('/phase/transitions', async (req, res) => {
    try {
        const transitions = db.db.prepare(`
            SELECT * FROM phase_transitions 
            ORDER BY transition_timestamp DESC 
            LIMIT 50
        `).all();
        
        res.json({
            success: true,
            data: transitions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get recommended portfolio allocation
router.get('/allocation/recommended', async (req, res) => {
    try {
        const allocation = await rotationEngine.getRecommendedAllocation();
        res.json({
            success: true,
            data: allocation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get allocation history
router.get('/allocation/history', async (req, res) => {
    try {
        const allocations = db.db.prepare(`
            SELECT * FROM portfolio_allocations 
            ORDER BY timestamp DESC 
            LIMIT 100
        `).all();
        
        res.json({
            success: true,
            data: allocations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get altcoin metrics
router.get('/altcoins/metrics', async (req, res) => {
    try {
        const metrics = await marketDataService.getAltcoinMetrics();
        res.json({
            success: true,
            data: metrics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get candle patterns
router.get('/patterns/candles', async (req, res) => {
    try {
        const patterns = await marketDataService.checkCandlePatterns();
        res.json({
            success: true,
            data: patterns
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get performance metrics
router.get('/performance', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        let metrics;
        if (startDate && endDate) {
            metrics = db.getPerformanceMetrics(startDate, endDate);
        } else {
            // Get last 30 days by default
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 30);
            
            metrics = db.getPerformanceMetrics(
                start.toISOString().split('T')[0],
                end.toISOString().split('T')[0]
            );
        }
        
        res.json({
            success: true,
            data: metrics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get active alerts
router.get('/alerts/active', async (req, res) => {
    try {
        const alerts = db.getActiveAlerts();
        res.json({
            success: true,
            data: alerts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Resolve an alert
router.post('/alerts/:id/resolve', async (req, res) => {
    try {
        const { id } = req.params;
        db.resolveAlert(id);
        res.json({
            success: true,
            message: 'Alert resolved'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Manual trigger endpoints (for testing)
router.post('/manual/fetch-data', async (req, res) => {
    try {
        const metrics = await schedulerService.fetchMarketDataNow();
        res.json({
            success: true,
            data: metrics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/manual/check-phase', async (req, res) => {
    try {
        const result = await schedulerService.checkPhaseNow();
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get scheduler status
router.get('/scheduler/status', async (req, res) => {
    try {
        const status = schedulerService.getStatus();
        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get comprehensive market analysis
router.get('/analysis/market', async (req, res) => {
    try {
        const analysis = await marketDataService.getMarketAnalysis();
        res.json({
            success: true,
            data: analysis
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get historical price data
router.get('/price/history/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: 'startDate and endDate are required'
            });
        }
        
        const priceData = await marketDataService.fetchHistoricalData(
            symbol,
            startDate,
            endDate
        );
        
        res.json({
            success: true,
            data: priceData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get technical indicators
router.get('/indicators/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const { period = 50 } = req.query;
        
        const indicators = await marketDataService.calculateTechnicalIndicators(
            symbol,
            parseInt(period)
        );
        
        res.json({
            success: true,
            data: indicators
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Backtesting endpoints
router.post('/backtest/run', async (req, res) => {
    try {
        const { startDate, endDate, initialCapital = 100000 } = req.body;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: 'startDate and endDate are required'
            });
        }
        
        const results = await backtestingService.runBacktest(
            startDate,
            endDate,
            initialCapital
        );
        
        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/backtest/compare', async (req, res) => {
    try {
        const { startDate, endDate, initialCapital = 100000 } = req.body;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: 'startDate and endDate are required'
            });
        }
        
        const comparison = await backtestingService.compareWithBuyAndHold(
            startDate,
            endDate,
            initialCapital
        );
        
        res.json({
            success: true,
            data: comparison
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.get('/backtest/history', async (req, res) => {
    try {
        const history = backtestingService.getBacktestHistory();
        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-portfolio-' + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Benjamin Cowen Analysis Routes
router.get('/cowen/analysis', async (req, res) => {
    try {
        const marketData = await marketDataService.fetchCurrentMetrics();
        const analysis = await benjaminCowenAnalyzer.generateCowenAnalysis(marketData);
        
        res.json({
            success: true,
            data: analysis
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.get('/cowen/risk-indicator', async (req, res) => {
    try {
        const marketData = await marketDataService.fetchCurrentMetrics();
        const riskIndicator = benjaminCowenAnalyzer.calculateRiskIndicator(
            marketData.btc_price,
            { currentValue: marketData.btc_price * 0.8 }, // Simplified log regression
            []
        );
        
        res.json({
            success: true,
            data: riskIndicator
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.get('/cowen/btc-dominance', async (req, res) => {
    try {
        const marketData = await marketDataService.fetchCurrentMetrics();
        const btcdAnalysis = benjaminCowenAnalyzer.analyzeBTCDominance(
            marketData.btc_dominance,
            [],
            marketData.eth_btc_ratio
        );
        
        res.json({
            success: true,
            data: btcdAnalysis
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.get('/cowen/market-cycle', async (req, res) => {
    try {
        const marketData = await marketDataService.fetchCurrentMetrics();
        const marketCycle = benjaminCowenAnalyzer.identifyMarketCycleStep(marketData);
        
        res.json({
            success: true,
            data: marketCycle
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/cowen/portfolio-analysis', upload.single('portfolio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Portfolio image is required'
            });
        }

        const marketData = await marketDataService.fetchCurrentMetrics();
        const portfolioAnalysis = await benjaminCowenAnalyzer.analyzePortfolioImage(
            req.file.path,
            marketData
        );
        
        res.json({
            success: true,
            data: portfolioAnalysis
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/cowen/custom-analysis', async (req, res) => {
    try {
        const { portfolioData, customPrompt } = req.body;
        const marketData = await marketDataService.fetchCurrentMetrics();
        
        let analysis;
        if (customPrompt) {
            // Custom analysis with user prompt
            analysis = await benjaminCowenAnalyzer.generateCowenAnalysis(
                marketData, 
                portfolioData,
                customPrompt
            );
        } else {
            analysis = await benjaminCowenAnalyzer.generateCowenAnalysis(marketData, portfolioData);
        }
        
        res.json({
            success: true,
            data: analysis
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;