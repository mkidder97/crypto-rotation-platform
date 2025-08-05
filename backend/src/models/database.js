import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class DatabaseManager {
    constructor() {
        const dbPath = join(__dirname, '../../../database/crypto-rotation.db');
        this.db = new Database(dbPath);
        this.db.pragma('journal_mode = WAL');
        this.db.pragma('foreign_keys = ON');
        
        this.initializeDatabase();
    }

    initializeDatabase() {
        const schemaPath = join(__dirname, '../../../database/schema.sql');
        const schema = readFileSync(schemaPath, 'utf8');
        
        this.db.exec(schema);
        console.log('Database initialized successfully');
    }

    getDb() {
        return this.db;
    }

    close() {
        this.db.close();
    }

    // Market metrics methods
    insertMarketMetrics(metrics) {
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO market_metrics 
            (timestamp, btc_dominance, eth_btc_ratio, total3_eth_ratio, 
             total3_btc_ratio, btc_price, eth_price, total_market_cap)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        return stmt.run(
            metrics.timestamp,
            metrics.btc_dominance,
            metrics.eth_btc_ratio,
            metrics.total3_eth_ratio,
            metrics.total3_btc_ratio,
            metrics.btc_price,
            metrics.eth_price,
            metrics.total_market_cap
        );
    }

    getLatestMarketMetrics() {
        return this.db.prepare(`
            SELECT * FROM market_metrics 
            ORDER BY timestamp DESC 
            LIMIT 1
        `).get();
    }

    getMarketMetricsRange(startDate, endDate) {
        return this.db.prepare(`
            SELECT * FROM market_metrics 
            WHERE timestamp BETWEEN ? AND ?
            ORDER BY timestamp ASC
        `).all(startDate, endDate);
    }

    // Phase transition methods
    recordPhaseTransition(transition) {
        const stmt = this.db.prepare(`
            INSERT INTO phase_transitions 
            (from_phase, to_phase, transition_timestamp, 
             btc_dominance_at_transition, eth_btc_ratio_at_transition, 
             total3_eth_ratio_at_transition, trigger_conditions)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        return stmt.run(
            transition.from_phase,
            transition.to_phase,
            transition.transition_timestamp,
            transition.btc_dominance_at_transition,
            transition.eth_btc_ratio_at_transition,
            transition.total3_eth_ratio_at_transition,
            JSON.stringify(transition.trigger_conditions)
        );
    }

    getLatestPhase() {
        return this.db.prepare(`
            SELECT to_phase as phase FROM phase_transitions 
            ORDER BY transition_timestamp DESC 
            LIMIT 1
        `).get();
    }

    // Portfolio allocation methods
    savePortfolioAllocation(allocation) {
        const stmt = this.db.prepare(`
            INSERT INTO portfolio_allocations 
            (timestamp, phase, btc_allocation, eth_allocation, 
             alt_allocation, cash_allocation, total_portfolio_value)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        return stmt.run(
            allocation.timestamp,
            allocation.phase,
            allocation.btc_allocation,
            allocation.eth_allocation,
            allocation.alt_allocation,
            allocation.cash_allocation,
            allocation.total_portfolio_value
        );
    }

    getCurrentAllocation() {
        return this.db.prepare(`
            SELECT * FROM portfolio_allocations 
            ORDER BY timestamp DESC 
            LIMIT 1
        `).get();
    }

    // Price history methods
    insertPriceHistory(priceData) {
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO price_history 
            (symbol, timestamp, open, high, low, close, volume, market_cap)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const insertMany = this.db.transaction((prices) => {
            for (const price of prices) {
                stmt.run(
                    price.symbol,
                    price.timestamp,
                    price.open,
                    price.high,
                    price.low,
                    price.close,
                    price.volume,
                    price.market_cap
                );
            }
        });
        
        if (Array.isArray(priceData)) {
            insertMany(priceData);
        } else {
            stmt.run(
                priceData.symbol,
                priceData.timestamp,
                priceData.open,
                priceData.high,
                priceData.low,
                priceData.close,
                priceData.volume,
                priceData.market_cap
            );
        }
    }

    getPriceHistory(symbol, startDate, endDate) {
        return this.db.prepare(`
            SELECT * FROM price_history 
            WHERE symbol = ? AND timestamp BETWEEN ? AND ?
            ORDER BY timestamp ASC
        `).all(symbol, startDate, endDate);
    }

    // Alert methods
    createAlert(alert) {
        const stmt = this.db.prepare(`
            INSERT INTO alerts 
            (alert_type, phase, message, trigger_value, threshold_value)
            VALUES (?, ?, ?, ?, ?)
        `);
        
        return stmt.run(
            alert.alert_type,
            alert.phase,
            alert.message,
            alert.trigger_value,
            alert.threshold_value
        );
    }

    getActiveAlerts() {
        return this.db.prepare(`
            SELECT * FROM alerts 
            WHERE is_active = 1 
            ORDER BY created_at DESC
        `).all();
    }

    resolveAlert(alertId) {
        return this.db.prepare(`
            UPDATE alerts 
            SET is_active = 0, resolved_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `).run(alertId);
    }

    // Performance metrics methods
    savePerformanceMetrics(metrics) {
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO performance_metrics 
            (date, phase, daily_return, cumulative_return, 
             portfolio_value, benchmark_return)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        return stmt.run(
            metrics.date,
            metrics.phase,
            metrics.daily_return,
            metrics.cumulative_return,
            metrics.portfolio_value,
            metrics.benchmark_return
        );
    }

    getPerformanceMetrics(startDate, endDate) {
        return this.db.prepare(`
            SELECT * FROM performance_metrics 
            WHERE date BETWEEN ? AND ?
            ORDER BY date ASC
        `).all(startDate, endDate);
    }
}

export default new DatabaseManager();