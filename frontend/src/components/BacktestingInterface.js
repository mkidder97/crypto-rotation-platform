import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'react-query';
import {
  Play,
  Pause,
  Square,
  Settings,
  Download,
  Share,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  DollarSign,
  Percent,
  Clock,
  Target,
  AlertCircle,
  CheckCircle,
  Zap,
  Activity,
  Filter,
  RefreshCw,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPie, Cell } from 'recharts';
import { cn, glass, card, button, animations, phaseStyles, typography, metrics } from '../utils/designSystem';

const BacktestingInterface = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedStrategy, setSelectedStrategy] = useState('rotation');
  const [timeframe, setTimeframe] = useState('1y');
  const [startCapital, setStartCapital] = useState('10000');
  const [rebalanceFreq, setRebalanceFreq] = useState('weekly');
  const [showSettings, setShowSettings] = useState(false);
  const [backtestResults, setBacktestResults] = useState(null);
  const [selectedAssets, setSelectedAssets] = useState(['BTC', 'ETH', 'ADA', 'SOL', 'DOT']);

  // Mock backtest data
  const mockBacktestData = useMemo(() => ({
    summary: {
      totalReturn: 347.5,
      annualizedReturn: 42.3,
      sharpeRatio: 1.87,
      maxDrawdown: -23.4,
      winRate: 68.5,
      totalTrades: 142,
      avgHoldingPeriod: 8.2,
      profitFactor: 2.34
    },
    performance: Array.from({ length: 365 }, (_, i) => ({
      date: new Date(2023, 0, 1 + i).toISOString().split('T')[0],
      portfolio: 10000 * (1 + (Math.random() * 0.8 + 0.6) * (i / 365)),
      benchmark: 10000 * (1 + (Math.random() * 0.4 + 0.2) * (i / 365)),
      btc: 10000 * (1 + (Math.random() * 0.6 + 0.3) * (i / 365)),
      eth: 10000 * (1 + (Math.random() * 0.5 + 0.25) * (i / 365))
    })),
    phases: [
      { phase: 'BTC_HEAVY', duration: 89, return: 45.2, trades: 12 },
      { phase: 'ETH_ROTATION', duration: 134, return: 67.8, trades: 34 },
      { phase: 'ALT_SEASON', duration: 98, return: 156.3, trades: 78 },
      { phase: 'CASH_HEAVY', duration: 44, return: -12.7, trades: 18 }
    ],
    trades: Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      date: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      type: Math.random() > 0.5 ? 'BUY' : 'SELL',
      asset: ['BTC', 'ETH', 'ADA', 'SOL', 'DOT'][Math.floor(Math.random() * 5)],
      amount: Math.random() * 5000 + 1000,
      price: Math.random() * 50000 + 10000,
      pnl: (Math.random() - 0.3) * 2000,
      phase: ['BTC_HEAVY', 'ETH_ROTATION', 'ALT_SEASON', 'CASH_HEAVY'][Math.floor(Math.random() * 4)]
    }))
  }), []);

  const strategies = [
    {
      id: 'rotation',
      name: 'Crypto Rotation Strategy',
      description: 'Phase-based rotation between BTC, ETH, and altcoins',
      icon: Target,
      complexity: 'Advanced'
    },
    {
      id: 'momentum',
      name: 'Momentum Strategy',
      description: 'Trend-following approach with dynamic allocation',
      icon: TrendingUp,
      complexity: 'Intermediate'
    },
    {
      id: 'meanreversion',
      name: 'Mean Reversion',
      description: 'Contrarian strategy buying dips and selling peaks',
      icon: Activity,
      complexity: 'Advanced'
    },
    {
      id: 'hodl',
      name: 'Buy & Hold',
      description: 'Simple benchmark strategy for comparison',
      icon: Clock,
      complexity: 'Beginner'
    }
  ];

  const availableAssets = [
    { symbol: 'BTC', name: 'Bitcoin', color: '#f7931a' },
    { symbol: 'ETH', name: 'Ethereum', color: '#627eea' },
    { symbol: 'ADA', name: 'Cardano', color: '#0033ad' },
    { symbol: 'SOL', name: 'Solana', color: '#9945ff' },
    { symbol: 'DOT', name: 'Polkadot', color: '#e6007a' },
    { symbol: 'LINK', name: 'Chainlink', color: '#375bd2' },
    { symbol: 'MATIC', name: 'Polygon', color: '#8247e5' },
    { symbol: 'AVAX', name: 'Avalanche', color: '#e84142' },
    { symbol: 'UNI', name: 'Uniswap', color: '#ff007a' },
    { symbol: 'ATOM', name: 'Cosmos', color: '#2e3148' }
  ];

  const runBacktest = async () => {
    setIsRunning(true);
    setProgress(0);
    
    // Simulate backtest progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          setBacktestResults(mockBacktestData);
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 200);
  };

  const stopBacktest = () => {
    setIsRunning(false);
    setProgress(0);
  };

  const getReturnColor = (value) => {
    return value >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <motion.div {...animations.fadeIn} className="flex items-center justify-between">
        <div>
          <h1 className={typography.h1}>Strategy Backtesting</h1>
          <p className={typography.body}>
            Test and optimize your trading strategies with historical data
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(!showSettings)}
            className={cn(button.secondary, "flex items-center space-x-2")}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(button.secondary, "flex items-center space-x-2")}
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Strategy Configuration */}
        <motion.div
          {...animations.slideIn}
          className="xl:col-span-4 space-y-6"
        >
          {/* Strategy Selection */}
          <div className={card.base}>
            <div className={card.header}>
              <h3 className={typography.h3}>Strategy Selection</h3>
            </div>
            <div className={card.body}>
              <div className="space-y-3">
                {strategies.map((strategy) => {
                  const Icon = strategy.icon;
                  const isSelected = selectedStrategy === strategy.id;
                  
                  return (
                    <motion.button
                      key={strategy.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedStrategy(strategy.id)}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 transition-all duration-200 text-left",
                        isSelected
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-white/10 dark:border-gray-700/50 hover:border-blue-500/50"
                      )}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          isSelected ? "bg-blue-500 text-white" : "bg-gray-500/20 text-gray-600 dark:text-gray-400"
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {strategy.name}
                            </h4>
                            <span className={cn(
                              "px-2 py-1 text-xs rounded-full",
                              strategy.complexity === 'Beginner' && "bg-green-500/20 text-green-600 dark:text-green-400",
                              strategy.complexity === 'Intermediate' && "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
                              strategy.complexity === 'Advanced' && "bg-red-500/20 text-red-600 dark:text-red-400"
                            )}>
                              {strategy.complexity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {strategy.description}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Parameters */}
          <div className={card.base}>
            <div className={card.header}>
              <h3 className={typography.h3}>Parameters</h3>
            </div>
            <div className={card.body}>
              <div className="space-y-4">
                {/* Time Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time Range
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['3m', '6m', '1y', '2y'].map((period) => (
                      <button
                        key={period}
                        onClick={() => setTimeframe(period)}
                        className={cn(
                          "py-2 px-3 rounded-lg text-sm font-medium transition-all",
                          timeframe === period
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        )}
                      >
                        {period.replace('m', ' months').replace('y', ' year')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Starting Capital */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Starting Capital
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={startCapital}
                      onChange={(e) => setStartCapital(e.target.value)}
                      className={cn(
                        "w-full pl-10 pr-4 py-3 rounded-xl border border-white/20 dark:border-gray-700/50",
                        glass('medium'),
                        "text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500"
                      )}
                      placeholder="10000"
                    />
                  </div>
                </div>

                {/* Rebalance Frequency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rebalance Frequency
                  </label>
                  <select
                    value={rebalanceFreq}
                    onChange={(e) => setRebalanceFreq(e.target.value)}
                    className={cn(
                      "w-full py-3 px-4 rounded-xl border border-white/20 dark:border-gray-700/50",
                      glass('medium'),
                      "text-gray-900 dark:text-white",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500"
                    )}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Asset Selection */}
          <div className={card.base}>
            <div className={card.header}>
              <h3 className={typography.h3}>Assets ({selectedAssets.length})</h3>
            </div>
            <div className={card.body}>
              <div className="grid grid-cols-2 gap-2">
                {availableAssets.map((asset) => {
                  const isSelected = selectedAssets.includes(asset.symbol);
                  
                  return (
                    <motion.button
                      key={asset.symbol}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedAssets(prev => prev.filter(a => a !== asset.symbol));
                        } else {
                          setSelectedAssets(prev => [...prev, asset.symbol]);
                        }
                      }}
                      className={cn(
                        "p-3 rounded-lg border transition-all duration-200 text-left",
                        isSelected
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-white/10 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600"
                      )}
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: asset.color }}
                        />
                        <div>
                          <div className="font-semibold text-sm text-gray-900 dark:text-white">
                            {asset.symbol}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {asset.name}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Run Controls */}
          <div className={card.base}>
            <div className={card.body}>
              <div className="space-y-4">
                {/* Progress */}
                {(isRunning || progress > 0) && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <motion.div
                        className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}

                {/* Controls */}
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={isRunning ? stopBacktest : runBacktest}
                    disabled={selectedAssets.length === 0}
                    className={cn(
                      button.primary,
                      "flex-1 flex items-center justify-center space-x-2",
                      (selectedAssets.length === 0 || isRunning) && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isRunning ? (
                      <>
                        <Square className="w-4 h-4" />
                        <span>Stop Backtest</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Run Backtest</span>
                      </>
                    )}
                  </motion.button>
                </div>

                {selectedAssets.length === 0 && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Select at least one asset to run backtest</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results */}
        <div className="xl:col-span-8 space-y-6">
          {backtestResults ? (
            <>
              {/* Performance Summary */}
              <motion.div
                {...animations.fadeIn}
                className={card.base}
              >
                <div className={card.header}>
                  <div className="flex items-center justify-between">
                    <h3 className={typography.h3}>Performance Summary</h3>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-green-600 dark:text-green-400">
                        Backtest Complete
                      </span>
                    </div>
                  </div>
                </div>
                <div className={card.body}>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-500">
                        {formatPercent(backtestResults.summary.totalReturn)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Total Return
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-500">
                        {formatPercent(backtestResults.summary.annualizedReturn)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Annualized Return
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-500">
                        {backtestResults.summary.sharpeRatio.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Sharpe Ratio
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-500">
                        {formatPercent(backtestResults.summary.maxDrawdown)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Max Drawdown
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Performance Chart */}
              <motion.div
                {...animations.fadeIn}
                className={card.base}
              >
                <div className={card.header}>
                  <h3 className={typography.h3}>Portfolio Performance</h3>
                </div>
                <div className={card.body}>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={backtestResults.performance}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis 
                          dataKey="date" 
                          stroke="#6B7280"
                          fontSize={12}
                          tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis 
                          stroke="#6B7280"
                          fontSize={12}
                          tickFormatter={(value) => formatCurrency(value)}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white'
                          }}
                          formatter={(value, name) => [formatCurrency(value), name]}
                          labelFormatter={(date) => new Date(date).toLocaleDateString()}
                        />
                        <Line
                          type="monotone"
                          dataKey="portfolio"
                          stroke="#3B82F6"
                          strokeWidth={3}
                          dot={false}
                          name="Strategy"
                        />
                        <Line
                          type="monotone"
                          dataKey="benchmark"
                          stroke="#6B7280"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                          name="Benchmark"
                        />
                        <Line
                          type="monotone"
                          dataKey="btc"
                          stroke="#F7931A"
                          strokeWidth={2}
                          dot={false}
                          name="BTC Hold"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>

              {/* Phase Analysis & Trade Log */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Phase Performance */}
                <motion.div
                  {...animations.fadeIn}
                  className={card.base}
                >
                  <div className={card.header}>
                    <h3 className={typography.h3}>Phase Performance</h3>
                  </div>
                  <div className={card.body}>
                    <div className="space-y-4">
                      {backtestResults.phases.map((phase, index) => {
                        const phaseStyle = phaseStyles[phase.phase];
                        return (
                          <div
                            key={index}
                            className={cn(
                              "p-4 rounded-xl border",
                              phaseStyle?.bg,
                              phaseStyle?.border
                            )}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className={cn("font-semibold", phaseStyle?.color)}>
                                {phase.phase.replace('_', ' ')}
                              </h4>
                              <span className={cn("font-bold", getReturnColor(phase.return))}>
                                {formatPercent(phase.return)}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                                <span className="ml-2 font-medium">{phase.duration} days</span>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Trades:</span>
                                <span className="ml-2 font-medium">{phase.trades}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>

                {/* Recent Trades */}
                <motion.div
                  {...animations.fadeIn}
                  className={card.base}
                >
                  <div className={card.header}>
                    <h3 className={typography.h3}>Recent Trades</h3>
                  </div>
                  <div className={card.body}>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {backtestResults.trades.slice(0, 10).map((trade) => (
                        <div
                          key={trade.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-white/5 dark:bg-black/5"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={cn(
                              "px-2 py-1 rounded text-xs font-semibold",
                              trade.type === 'BUY' 
                                ? "bg-green-500/20 text-green-600 dark:text-green-400"
                                : "bg-red-500/20 text-red-600 dark:text-red-400"
                            )}>
                              {trade.type}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {trade.asset}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {trade.date.toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={cn("font-semibold", getReturnColor(trade.pnl))}>
                              {formatCurrency(trade.pnl)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {formatCurrency(trade.amount)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          ) : (
            /* Placeholder */
            <motion.div
              {...animations.fadeIn}
              className={cn(card.base, "h-96 flex items-center justify-center")}
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Ready to Backtest
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md">
                    Configure your strategy parameters and run a backtest to see how your approach would have performed historically.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BacktestingInterface;