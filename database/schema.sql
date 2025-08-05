-- Crypto Rotation Strategy Database Schema

-- Market metrics table
CREATE TABLE IF NOT EXISTS market_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME NOT NULL,
    btc_dominance REAL NOT NULL,
    eth_btc_ratio REAL NOT NULL,
    total3_eth_ratio REAL,
    total3_btc_ratio REAL,
    btc_price REAL NOT NULL,
    eth_price REAL NOT NULL,
    total_market_cap REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(timestamp)
);

-- Phase transitions table
CREATE TABLE IF NOT EXISTS phase_transitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_phase TEXT NOT NULL,
    to_phase TEXT NOT NULL,
    transition_timestamp DATETIME NOT NULL,
    btc_dominance_at_transition REAL,
    eth_btc_ratio_at_transition REAL,
    total3_eth_ratio_at_transition REAL,
    trigger_conditions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Portfolio allocations table
CREATE TABLE IF NOT EXISTS portfolio_allocations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME NOT NULL,
    phase TEXT NOT NULL,
    btc_allocation REAL NOT NULL,
    eth_allocation REAL NOT NULL,
    alt_allocation REAL NOT NULL,
    cash_allocation REAL NOT NULL,
    total_portfolio_value REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHECK (btc_allocation + eth_allocation + alt_allocation + cash_allocation = 100)
);

-- Price history table for backtesting
CREATE TABLE IF NOT EXISTS price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    open REAL NOT NULL,
    high REAL NOT NULL,
    low REAL NOT NULL,
    close REAL NOT NULL,
    volume REAL,
    market_cap REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(symbol, timestamp)
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alert_type TEXT NOT NULL,
    phase TEXT,
    message TEXT NOT NULL,
    trigger_value REAL,
    threshold_value REAL,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME
);

-- Backtest results table
CREATE TABLE IF NOT EXISTS backtest_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    initial_capital REAL NOT NULL,
    final_capital REAL NOT NULL,
    total_return REAL NOT NULL,
    max_drawdown REAL NOT NULL,
    sharpe_ratio REAL,
    win_rate REAL,
    number_of_trades INTEGER,
    strategy_params TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    phase TEXT NOT NULL,
    daily_return REAL,
    cumulative_return REAL,
    portfolio_value REAL NOT NULL,
    benchmark_return REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_market_metrics_timestamp ON market_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_price_history_symbol_timestamp ON price_history(symbol, timestamp);
CREATE INDEX IF NOT EXISTS idx_phase_transitions_timestamp ON phase_transitions(transition_timestamp);
CREATE INDEX IF NOT EXISTS idx_portfolio_allocations_timestamp ON portfolio_allocations(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_date ON performance_metrics(date);