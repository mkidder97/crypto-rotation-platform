# Crypto Rotation Strategy System

A sophisticated cryptocurrency portfolio rotation system that automatically shifts between BTC, ETH, altcoins, and cash based on market dominance ratios and technical indicators. Built to maximize risk-adjusted returns through different market cycles.

## 🎯 Features

### Core Strategy Engine
- **Phase Detection**: Automatically identifies 4 market phases:
  - **BTC Heavy** (70-90% BTC allocation)
  - **ETH Rotation** (60-70% ETH allocation) 
  - **Alt Season** (60-80% altcoin allocation)
  - **Cash Heavy** (50% cash/stables allocation)

### Real-Time Data Integration
- **CoinGecko API**: Market dominance & historical data
- **Binance API**: Real-time prices & technical patterns
- **Automated Data Fetching**: Scheduled updates every 5 minutes
- **Weekly Candle Analysis**: 2+ consecutive candle confirmation

### Interactive Dashboard
- **Live Phase Indicator**: Current phase with confidence level
- **Market Metrics Panel**: BTC dominance, ETH/BTC ratio, TOTAL3/ETH
- **Portfolio Allocation**: Recommended allocations with visual charts
- **Performance Tracking**: Historical returns vs benchmarks
- **Alert System**: Phase transition notifications

### Backtesting & Analysis
- **Historical Backtesting**: Test strategy against past data
- **Performance Comparison**: Strategy vs BTC/ETH buy-and-hold
- **Risk Metrics**: Sharpe ratio, max drawdown, win rate
- **Phase Transition History**: Track rotation patterns

## 🏗️ Architecture

```
crypto-rotation/
├── backend/              # Node.js/Express API server
│   ├── src/
│   │   ├── api/         # REST API routes
│   │   ├── services/    # Business logic & external APIs
│   │   ├── models/      # Database layer
│   │   └── utils/       # Helper functions
│   └── logs/            # Application logs
├── frontend/            # React dashboard
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── services/    # API client
│   │   └── hooks/       # Custom React hooks
│   └── public/          # Static assets
└── database/            # SQLite database & schema
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd crypto-rotation
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
```

4. **Start the Application**

Backend (Terminal 1):
```bash
cd backend
npm run dev
```

Frontend (Terminal 2):
```bash
cd frontend
npm start
```

5. **Access the Dashboard**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## 📊 Strategy Logic

### Phase Transition Rules

#### BTC Heavy → ETH Rotation
- BTC Dominance > 68% AND
- ETH/BTC ratio bouncing from 0.05-0.053 zone

#### ETH Rotation → Alt Season  
- BTC Dominance < 68% (breaking down) AND
- ETH/BTC > 0.053 AND
- TOTAL3/ETH showing strength (multiple green candles)

#### Alt Season → Cash Heavy
- ETH/BTC drops below 0.053 OR
- TOTAL3/ETH rolling over OR  
- BTC Dominance reversing > 58% OR
- 2+ consecutive red weekly candles

### Risk Management
- **Weekly Candle Confirmation**: Minimum 2 consecutive candles required
- **Position Sizing**: Dynamic allocation based on market volatility
- **Drawdown Protection**: Automatic cash allocation increase during high volatility
- **Gray Zones**: No-trade buffers during indecisive markets

## 🔧 API Endpoints

### Market Data
- `GET /api/metrics/current` - Latest market metrics
- `GET /api/metrics/history` - Historical metrics range
- `GET /api/analysis/market` - Comprehensive market analysis

### Phase Management
- `GET /api/phase/current` - Current phase analysis
- `GET /api/phase/transitions` - Phase transition history

### Portfolio
- `GET /api/allocation/recommended` - Suggested allocation
- `GET /api/allocation/history` - Allocation history

### Backtesting
- `POST /api/backtest/run` - Run strategy backtest
- `POST /api/backtest/compare` - Compare vs buy-and-hold
- `GET /api/backtest/history` - Previous backtest results

### Alerts
- `GET /api/alerts/active` - Active system alerts
- `POST /api/alerts/:id/resolve` - Resolve alert

## 🧪 Free APIs Used

### CoinGecko (Primary)
- **Rate Limit**: 10-30 calls/minute
- **Usage**: Market dominance, historical data, altcoin metrics
- **Cost**: Free (no API key required)

### Binance Public API  
- **Rate Limit**: Very high
- **Usage**: Real-time prices, candlestick data, technical indicators
- **Cost**: Free (no authentication required)

### Alternative Options
- **CryptoCompare**: 100k calls/month free
- **CoinMarketCap**: 333 calls/day free

## 📈 Performance Metrics

The system tracks:
- **Total Return**: Portfolio performance vs initial capital  
- **Sharpe Ratio**: Risk-adjusted returns
- **Maximum Drawdown**: Worst peak-to-trough decline
- **Win Rate**: Percentage of profitable periods
- **Phase Accuracy**: Correct phase identification rate

## ⚠️ Risk Disclaimers

- **Not Financial Advice**: This is an educational/research tool
- **Backtesting Limitations**: Past performance doesn't guarantee future results  
- **Market Risk**: Cryptocurrency markets are highly volatile
- **API Dependencies**: System relies on external data providers
- **Strategy Risk**: No strategy works in all market conditions

## 🔧 Configuration

### Environment Variables (.env)
```bash
# Server
PORT=3001
NODE_ENV=development

# Data Fetching
MARKET_DATA_FETCH_INTERVAL=5
PRICE_HISTORY_FETCH_INTERVAL=60

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log
```

### Strategy Parameters
Adjust thresholds in `rotationEngine.js`:
```javascript
this.thresholds = {
    btc_dominance_high: 68,
    btc_dominance_climbing: 52,
    btc_dominance_low: 50,
    eth_btc_bounce_zone: [0.05, 0.053],
    min_consecutive_candles: 2
};
```

## 🛠️ Development

### Available Scripts

Backend:
- `npm start` - Production server
- `npm run dev` - Development with nodemon  
- `npm test` - Run tests

Frontend:
- `npm start` - Development server
- `npm run build` - Production build
- `npm test` - Run tests

### Database Schema

The system uses SQLite with tables for:
- `market_metrics` - Historical market data
- `phase_transitions` - Strategy phase changes  
- `portfolio_allocations` - Recommended allocations
- `performance_metrics` - Portfolio performance
- `backtest_results` - Backtesting results

## 📝 Roadmap

- [ ] Email/Slack alert notifications
- [ ] Advanced technical indicators (RSI, MACD)
- [ ] Multi-exchange price aggregation  
- [ ] Portfolio rebalancing automation
- [ ] Machine learning phase prediction
- [ ] DeFi yield farming integration
- [ ] Mobile app companion

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes  
4. Add tests
5. Submit a pull request

## 📄 License

This project is for educational purposes. See LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the GitHub Issues
2. Review the API documentation
3. Check logs in `backend/logs/`
4. Verify environment configuration

---

**⚡ Built with Node.js, React, SQLite, Chart.js, and lots of ☕**