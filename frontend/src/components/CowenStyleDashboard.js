import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'react-query';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  AlertTriangle,
  Info,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Eye,
  RefreshCw,
  ChevronRight,
  PlayCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  Area,
  AreaChart,
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip,
  RadialBarChart,
  RadialBar,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { colors, animations, typography, glass } from '../utils/designSystem';
import MacroIndicators from './MacroIndicators';
import Tooltip from './Tooltip';

const CowenStyleDashboard = () => {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('TOTAL');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1Y');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch real market data
  const { data: marketData, isLoading } = useQuery(
    'marketData',
    () => fetch('/api/metrics/current').then(res => res.json()),
    { refetchInterval: 15000 }
  );

  const { data: riskData } = useQuery(
    'riskIndicator',
    () => fetch('/api/cowen/risk-indicator').then(res => res.json()),
    { refetchInterval: 20000 }
  );

  const { data: btcDominance } = useQuery(
    'btcDominance',
    () => fetch('/api/cowen/btc-dominance').then(res => res.json()),
    { refetchInterval: 25000 }
  );

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center animate-spin">
            <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent" />
          </div>
          <h2 className="text-white text-xl font-semibold">Loading Advanced Analytics...</h2>
          <p className="text-gray-400">Preparing Benjamin Cowen style dashboard</p>
        </div>
      </div>
    );
  }

  const tabs = ['TOTAL', 'BTC', 'ETH', 'ALTCOINS'];
  const timeframes = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

  // Enhanced mock data for charts with trend lines and support/resistance
  const chartData = [
    { date: '2021', btc: 15000, eth: 800, total: 0.6, upperTrend: 18000, lowerTrend: 12000, support: 14000, resistance: 20000 },
    { date: '2022', btc: 20000, eth: 1200, total: 0.8, upperTrend: 25000, lowerTrend: 15000, support: 18000, resistance: 28000 },
    { date: '2023', btc: 30000, eth: 1800, total: 1.2, upperTrend: 35000, lowerTrend: 22000, support: 28000, resistance: 38000 },
    { date: '2024', btc: 45000, eth: 2500, total: 1.8, upperTrend: 50000, lowerTrend: 35000, support: 42000, resistance: 52000 },
    { date: '2025', btc: 42000, eth: 2200, total: 1.6, upperTrend: 48000, lowerTrend: 32000, support: 40000, resistance: 50000 },
  ];

  const favoriteCharts = [
    { name: 'Supply In Profit Or Loss', icon: TrendingUp },
    { name: 'Price Color Coded By Risk', icon: Target },
    { name: 'Fear & Greed Index', icon: Activity },
    { name: 'Crypto Heatmap', icon: BarChart3 },
    { name: 'Historical Risk Levels', icon: AlertTriangle },
    { name: 'Logarithmic Regression', icon: TrendingUp },
    { name: 'Logarithmic Regression Rainbow', icon: Eye },
    { name: 'ROI After Cycle Bottom', icon: Zap },
    { name: 'ROI After Halving', icon: PlayCircle },
    { name: 'Bull Market Support Band (BMSB)', icon: BarChart3 }
  ];

  // Helper functions for tab-specific data
  const getTabPrice = (tab, data) => {
    switch (tab) {
      case 'BTC':
        return `$${data?.btc_price?.toFixed(0) || '45,234'}`;
      case 'ETH':
        return `$${data?.eth_price?.toFixed(0) || '2,876'}`;
      case 'ALTCOINS':
        return `$${data?.total3_market_cap?.toFixed(0) || '850B'}`;
      default:
        return `$${((data?.btc_price || 45234) + (data?.eth_price || 2876)).toFixed(0)}`;
    }
  };

  const getTabTrend = (tab) => {
    switch (tab) {
      case 'BTC':
        return '4.16T';
      case 'ETH':
        return '2.85T';
      case 'ALTCOINS':
        return '1.24T';
      default:
        return '4.16T';
    }
  };

  const getTabUndervaluation = (tab) => {
    switch (tab) {
      case 'BTC':
        return '-9.57%';
      case 'ETH':
        return '-12.34%';
      case 'ALTCOINS':
        return '-15.67%';
      default:
        return '-9.57%';
    }
  };

  const RiskGauge = ({ title, value, trend, undervaluation, subtitle }) => {
    const getGaugeColor = (val) => {
      if (val <= 0.3) return '#10B981'; // Green
      if (val <= 0.6) return '#F59E0B'; // Yellow
      return '#EF4444'; // Red
    };

    return (
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white font-semibold text-lg">{title}</h2>
            {subtitle && (
              <p className="text-gray-400 text-sm">{subtitle}</p>
            )}
          </div>
          <Tooltip content="Benjamin Cowen's risk indicator uses logarithmic regression, market volatility, and cycle analysis to determine optimal risk levels for crypto investments.">
            <button className="text-blue-400 hover:text-blue-300 transition-colors">
              <Info size={16} />
            </button>
          </Tooltip>
        </div>

        <div className="relative mb-6">
          <ResponsiveContainer width="100%" height={160}>
            <RadialBarChart
              cx="50%"
              cy="85%"
              innerRadius="60%"
              outerRadius="90%"
              startAngle={180}
              endAngle={0}
              data={[{ value: value * 100 }]}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={10}
                fill={getGaugeColor(value)}
                stroke="none"
              />
            </RadialBarChart>
          </ResponsiveContainer>
          
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {value?.toFixed(2) || '0.00'}
            </div>
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-gray-400">Trend:</span>
              <span className={`flex items-center gap-1 ${
                trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-400'
              }`}>
                {trend > 0 ? <TrendingUp size={14} /> : trend < 0 ? <TrendingDown size={14} /> : <Activity size={14} />}
                {Math.abs(trend || 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {undervaluation !== undefined && (
          <div className="text-center p-3 bg-gray-800/50 rounded-xl">
            <span className="text-gray-400 text-sm">Undervaluation: </span>
            <span className="text-white font-semibold">{undervaluation}%</span>
          </div>
        )}
      </div>
    );
  };

  const MetricsTable = ({ data, activeTab }) => {
    const allCryptos = {
      TOTAL: [
        { symbol: 'BTC', name: 'Bitcoin', price: data?.btc_price || 45234, change: 2.1, color: '#F7931A', marketCap: '850B', dominance: '59.5%' },
        { symbol: 'ETH', name: 'Ethereum', price: data?.eth_price || 2876, change: -1.2, color: '#627EEA', marketCap: '350B', dominance: '18.2%' },
        { symbol: 'ADA', name: 'Cardano', price: 0.58, change: 4.7, color: '#0033AD', marketCap: '20B', dominance: '1.2%' },
        { symbol: 'DOT', name: 'Polkadot', price: 7.23, change: -0.8, color: '#E6007A', marketCap: '8B', dominance: '0.5%' },
        { symbol: 'AVAX', name: 'Avalanche', price: 28.45, change: 6.2, color: '#E84142', marketCap: '12B', dominance: '0.8%' },
        { symbol: 'LINK', name: 'Chainlink', price: 14.89, change: 3.4, color: '#375BD2', marketCap: '9B', dominance: '0.6%' },
        { symbol: 'SOL', name: 'Solana', price: 102.34, change: 8.9, color: '#9945FF', marketCap: '45B', dominance: '2.8%' },
        { symbol: 'MATIC', name: 'Polygon', price: 0.89, change: -2.1, color: '#8247E5', marketCap: '8B', dominance: '0.5%' }
      ],
      BTC: [
        { symbol: 'BTC', name: 'Bitcoin', price: data?.btc_price || 45234, change: 2.1, color: '#F7931A', volume: '28.5B', high24h: '46,200', low24h: '44,100' },
      ],
      ETH: [
        { symbol: 'ETH', name: 'Ethereum', price: data?.eth_price || 2876, change: -1.2, color: '#627EEA', volume: '15.2B', high24h: '2,920', low24h: '2,840' },
      ],
      ALTCOINS: [
        { symbol: 'ADA', name: 'Cardano', price: 0.58, change: 4.7, color: '#0033AD', volume: '450M', rank: 8 },
        { symbol: 'DOT', name: 'Polkadot', price: 7.23, change: -0.8, color: '#E6007A', volume: '280M', rank: 12 },
        { symbol: 'AVAX', name: 'Avalanche', price: 28.45, change: 6.2, color: '#E84142', volume: '650M', rank: 10 },
        { symbol: 'LINK', name: 'Chainlink', price: 14.89, change: 3.4, color: '#375BD2', volume: '420M', rank: 14 },
        { symbol: 'SOL', name: 'Solana', price: 102.34, change: 8.9, color: '#9945FF', volume: '2.1B', rank: 5 },
        { symbol: 'MATIC', name: 'Polygon', price: 0.89, change: -2.1, color: '#8247E5', volume: '380M', rank: 16 }
      ]
    };

    const cryptos = allCryptos[activeTab] || allCryptos.TOTAL;

    return (
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
        <div className="space-y-3">
          {cryptos.map((crypto, index) => (
            <motion.div
              key={crypto.symbol}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: crypto.color }}
                >
                  {crypto.symbol.slice(0, 2)}
                </div>
                <div>
                  <div className="text-white font-medium">{crypto.symbol}</div>
                  <div className="text-gray-400 text-sm">{crypto.name}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-white font-semibold">
                  ${crypto.price.toLocaleString()}
                </div>
                <div className={`text-sm ${
                  crypto.change > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {crypto.change > 0 ? '+' : ''}{crypto.change}%
                </div>
                {crypto.marketCap && (
                  <div className="text-xs text-gray-400">
                    {crypto.marketCap} • {crypto.dominance}
                  </div>
                )}
                {crypto.volume && (
                  <div className="text-xs text-gray-400">
                    Vol: {crypto.volume}
                  </div>
                )}
                {crypto.rank && (
                  <div className="text-xs text-gray-400">
                    Rank #{crypto.rank}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        
        {/* Header with Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  selectedTimeframe === tf
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Column - Risk Indicators */}
          <div className="lg:col-span-2 space-y-6" data-testid="risk-indicators-column">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RiskGauge
                title="Crypto Risk Indicators"
                value={riskData?.data?.riskScore || 0.64}
                trend={4.16}
                undervaluation={-9.57}
                subtitle="Market risk assessment"
              />
              
              <RiskGauge
                title="Macro Recession Risk Indicators"
                value={0.015}
                trend={0}
                subtitle="Economic indicators"
              />
            </div>

            {/* Main Chart */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {activeTab}: {getTabPrice(activeTab, marketData?.data)} - Trend: {getTabTrend(activeTab)} - Undervaluation: {getTabUndervaluation(activeTab)}
                  </h3>
                </div>
                <Tooltip content={`${activeTab} price analysis with support/resistance levels and trend channels. Green lines show trend bounds, yellow/red show key levels.`}>
                  <button className="text-blue-400 hover:text-blue-300 transition-colors">
                    <Info size={16} />
                  </button>
                </Tooltip>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '12px',
                      color: '#F9FAFB'
                    }} 
                  />
                  
                  {/* Upper Trend Line */}
                  <Line
                    type="monotone"
                    dataKey="upperTrend"
                    stroke="#10B981"
                    strokeWidth={1.5}
                    strokeDasharray="8 4"
                    dot={false}
                    name="Upper Trend"
                  />
                  
                  {/* Lower Trend Line */}
                  <Line
                    type="monotone"
                    dataKey="lowerTrend"
                    stroke="#10B981"
                    strokeWidth={1.5}
                    strokeDasharray="8 4"
                    dot={false}
                    name="Lower Trend"
                  />
                  
                  {/* Support Level */}
                  <Line
                    type="monotone"
                    dataKey="support"
                    stroke="#F59E0B"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    dot={false}
                    name="Support"
                  />
                  
                  {/* Resistance Level */}
                  <Line
                    type="monotone"
                    dataKey="resistance"
                    stroke="#EF4444"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    dot={false}
                    name="Resistance"
                  />
                  
                  {/* Main Price Line - Dynamic based on selected tab */}
                  <Line
                    type="monotone"
                    dataKey={activeTab === 'ETH' ? 'eth' : activeTab === 'ALTCOINS' ? 'total' : 'btc'}
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    name={`${activeTab} Price`}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* BTC Dominance Chart */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    BTC.D: {btcDominance?.data?.currentDominance?.toFixed(1) || '59.5'}%
                  </h3>
                  <p className="text-gray-400 text-sm">
                    With Stables: 61.41%, Without Stables: 65.97%
                  </p>
                </div>
                <Tooltip content="BTC Dominance tracks Bitcoin's market share relative to all cryptocurrencies. Cowen's analysis shows when altseason may begin based on dominance cycles.">
                  <button className="text-blue-400 hover:text-blue-300 transition-colors">
                    <Info size={16} />
                  </button>
                </Tooltip>
              </div>
              
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '12px',
                      color: '#F9FAFB'
                    }} 
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Column - Metrics & Favorites */}
          <div className="lg:col-span-2 space-y-6" data-testid="metrics-favorites-column">
            
            {/* Crypto Prices Table */}
            <MetricsTable data={marketData?.data} activeTab={activeTab} />

            {/* Favorite Charts */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
              <h3 className="text-white font-semibold text-lg mb-4">Favorite Charts</h3>
              
              <div className="space-y-2">
                {favoriteCharts.map((chart, index) => {
                  const Icon = chart.icon;
                  return (
                    <motion.button
                      key={chart.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} className="text-blue-400" />
                        <span className="text-gray-300 group-hover:text-white transition-colors">
                          {chart.name}
                        </span>
                      </div>
                      <ChevronRight size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Market Status */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
              <h3 className="text-white font-semibold text-lg mb-4">Market Status</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                  <span className="text-green-400 font-medium">Market Trend</span>
                  <span className="text-white">Bullish</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                  <span className="text-yellow-400 font-medium">Risk Level</span>
                  <span className="text-white">Moderate</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <span className="text-blue-400 font-medium">Phase</span>
                  <span className="text-white">{btcDominance?.data?.cyclePhase || 'Accumulation'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Macro Indicators Section */}
        <div className="mt-8">
          <MacroIndicators />
        </div>
      </div>
    </div>
  );
};

export default CowenStyleDashboard;