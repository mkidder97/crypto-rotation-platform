import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'react-query';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Eye,
  Signal,
  Gauge,
  Layers,
  Maximize2,
  Settings,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RefreshCw,
  Filter,
  Search,
  Star,
  Bookmark,
  Share,
  Download,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Info,
  Lightbulb,
  Shield,
  Wifi,
  WifiOff
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  ComposedChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  ReferenceLine
} from 'recharts';
import { phaseAPI, marketAPI } from '../services/api';
import { colors, animations, typography, glass } from '../utils/designSystem';
import AIPredictiveAnalytics from './AIPredictiveAnalytics';

const AdvancedTradingDashboard = () => {
  const [mounted, setMounted] = useState(false);
  const [liveMode, setLiveMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1H');
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [selectedFilters, setSelectedFilters] = useState(['all']);

  const { data: metricsData, isLoading, error } = useQuery(
    'currentMetrics', 
    marketAPI.getCurrentMetrics,
    { 
      refetchInterval: liveMode ? 3000 : false,
      onError: () => setConnectionStatus('disconnected'),
      onSuccess: () => setConnectionStatus('connected')
    }
  );
  
  const { data: phaseData } = useQuery(
    'currentPhase', 
    phaseAPI.getCurrentPhase,
    { refetchInterval: liveMode ? 5000 : false }
  );

  useEffect(() => {
    setMounted(true);
    
    // Simulate connection status changes
    const statusInterval = setInterval(() => {
      if (Math.random() < 0.05) { // 5% chance to simulate brief disconnection
        setConnectionStatus('reconnecting');
        setTimeout(() => setConnectionStatus('connected'), 2000);
      }
    }, 30000);

    return () => clearInterval(statusInterval);
  }, []);

  const metrics = metricsData?.data;
  const currentPhase = phaseData?.data?.phase || 'BTC_HEAVY';

  // Advanced market analysis with ML-like predictions
  const marketAnalysis = useMemo(() => {
    if (!metrics) return null;

    const { btc_dominance, eth_btc_ratio, total3_eth_ratio } = metrics;
    
    // Simulate advanced analytics
    const volatilityIndex = Math.random() * 100;
    const liquidityScore = Math.random() * 100;
    const momentumScore = (btc_dominance - 50) * 2;
    const fearGreedIndex = Math.random() * 100;
    
    return {
      volatilityIndex,
      liquidityScore,
      momentumScore,
      fearGreedIndex,
      marketStrength: (volatilityIndex + liquidityScore + Math.abs(momentumScore)) / 3,
      signals: [
        {
          type: 'bullish',
          strength: Math.random() * 100,
          message: 'Strong accumulation pattern detected',
          timeframe: '4H'
        },
        {
          type: 'bearish',
          strength: Math.random() * 100,
          message: 'Resistance level approaching',
          timeframe: '1D'
        },
        {
          type: 'neutral',
          strength: Math.random() * 100,
          message: 'Range-bound consolidation',
          timeframe: '15M'
        }
      ]
    };
  }, [metrics]);

  // Generate advanced time series data with multiple indicators
  const generateAdvancedTimeSeriesData = (baseValue, hours = 24) => {
    const data = [];
    let price = baseValue;
    let volume = 1000000;
    
    for (let i = 0; i < hours; i++) {
      const time = new Date();
      time.setHours(time.getHours() - (hours - i));
      
      // Simulate realistic price movement
      const randomWalk = (Math.random() - 0.5) * 0.02;
      const trend = Math.sin((i / hours) * Math.PI * 2) * 0.01;
      const volatility = Math.random() * 0.01;
      
      price *= (1 + randomWalk + trend + volatility);
      volume *= (1 + (Math.random() - 0.5) * 0.3);
      
      // Technical indicators
      const rsi = 30 + Math.random() * 40; // RSI between 30-70
      const macd = (Math.random() - 0.5) * 2;
      const bb_upper = price * 1.02;
      const bb_lower = price * 0.98;
      
      data.push({
        time: time.toISOString(),
        price,
        volume,
        rsi,
        macd,
        bb_upper,
        bb_lower,
        hour: time.getHours(),
        timestamp: time.getTime()
      });
    }
    
    return data;
  };

  const toggleCard = (cardId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };

  const advancedChartData = generateAdvancedTimeSeriesData(metrics?.btc_price || 65000);

  if (!mounted) return null;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20" />
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 40% 40%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
          className="absolute inset-0"
        />
      </div>

      {/* Header Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 p-6 border-b"
        style={{
          background: glass('heavy'),
          borderColor: colors.border.primary,
          backdropFilter: 'blur(20px)'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                CryptoRotate Pro
              </h1>
              <p className={typography.caption} style={{ color: colors.text.tertiary }}>
                Advanced Trading Intelligence
              </p>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: connectionStatus === 'connected' ? 1 : [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: connectionStatus !== 'connected' ? Infinity : 0 }}
              >
                {connectionStatus === 'connected' ? (
                  <Wifi size={16} style={{ color: colors.status.success }} />
                ) : connectionStatus === 'reconnecting' ? (
                  <RefreshCw size={16} className="animate-spin" style={{ color: colors.status.warning }} />
                ) : (
                  <WifiOff size={16} style={{ color: colors.status.danger }} />
                )}
              </motion.div>
              <span 
                className={typography.caption}
                style={{ 
                  color: connectionStatus === 'connected' ? colors.status.success :
                         connectionStatus === 'reconnecting' ? colors.status.warning :
                         colors.status.danger
                }}
              >
                {connectionStatus.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Control Panel */}
          <div className="flex items-center gap-4">
            {/* Timeframe Selector */}
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: colors.background.secondary }}>
              {['5M', '15M', '1H', '4H', '1D'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedTimeframe === tf ? 'text-white' : ''
                  }`}
                  style={{
                    background: selectedTimeframe === tf ? colors.accent.primary : 'transparent',
                    color: selectedTimeframe === tf ? 'white' : colors.text.secondary
                  }}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Live Mode Toggle */}
            <button
              onClick={() => setLiveMode(!liveMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                liveMode ? 'animate-pulse' : ''
              }`}
              style={{
                background: liveMode ? `${colors.status.success}20` : colors.background.secondary,
                color: liveMode ? colors.status.success : colors.text.secondary,
                border: `1px solid ${liveMode ? colors.status.success : colors.border.primary}`
              }}
            >
              {liveMode ? <Play size={16} /> : <Pause size={16} />}
              {liveMode ? 'LIVE' : 'PAUSED'}
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl transition-all"
              style={{
                background: colors.background.secondary,
                color: soundEnabled ? colors.accent.primary : colors.text.tertiary
              }}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            {/* Settings */}
            <button
              className="p-2 rounded-xl transition-all"
              style={{
                background: colors.background.secondary,
                color: colors.text.tertiary
              }}
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Dashboard Content */}
      <div className="relative z-10 p-6 space-y-6">
        <div className="max-w-[1800px] mx-auto">
          
          {/* Top Row - Key Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            {[
              {
                id: 'btc_price',
                label: 'Bitcoin',
                value: `$${metrics?.btc_price?.toLocaleString() || '65,000'}`,
                change: metrics?.btc_24h_change || 2.34,
                chart: advancedChartData.slice(-12).map(d => d.price),
                color: colors.accent.primary
              },
              {
                id: 'eth_price',
                label: 'Ethereum',
                value: `$${metrics?.eth_price?.toLocaleString() || '3,200'}`,
                change: metrics?.eth_24h_change || -1.45,
                chart: advancedChartData.slice(-12).map(d => d.price * 0.05),
                color: colors.accent.secondary
              },
              {
                id: 'btc_dom',
                label: 'BTC Dominance',
                value: `${metrics?.btc_dominance?.toFixed(1) || '55.2'}%`,
                change: 0.23,
                chart: Array.from({length: 12}, (_, i) => 55 + Math.sin(i) * 2),
                color: colors.status.warning
              },
              {
                id: 'market_cap',
                label: 'Market Cap',
                value: '$2.8T',
                change: 2.1,
                chart: Array.from({length: 12}, (_, i) => 2800 + Math.cos(i) * 100),
                color: colors.status.success
              }
            ].map((metric, index) => (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl border cursor-pointer hover:scale-[1.02] transition-all"
                style={{
                  background: glass('medium'),
                  borderColor: colors.border.primary
                }}
                onClick={() => toggleCard(metric.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={typography.caption} style={{ color: colors.text.muted }}>
                    {metric.label.toUpperCase()}
                  </div>
                  <div 
                    className="flex items-center gap-1 text-sm font-semibold"
                    style={{ color: metric.change >= 0 ? colors.status.success : colors.status.danger }}
                  >
                    {metric.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(2)}%
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-2xl font-bold" style={{ color: colors.text.primary }}>
                    {metric.value}
                  </div>
                </div>

                {/* Mini Chart */}
                <div className="h-12">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metric.chart.map((value, i) => ({ value, index: i }))}>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={metric.color}
                        fill={`${metric.color}20`}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Expanded View */}
                <AnimatePresence>
                  {expandedCards.has(metric.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t"
                      style={{ borderColor: colors.border.primary }}
                    >
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className={typography.caption} style={{ color: colors.text.muted }}>
                            24h High
                          </div>
                          <div style={{ color: colors.text.primary }}>
                            ${(parseFloat(metric.value.replace(/[$,]/g, '')) * 1.05).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className={typography.caption} style={{ color: colors.text.muted }}>
                            24h Low
                          </div>
                          <div style={{ color: colors.text.primary }}>
                            ${(parseFloat(metric.value.replace(/[$,]/g, '')) * 0.95).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>

          {/* Middle Row - Advanced Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            {/* Main Price Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 p-6 rounded-2xl border"
              style={{
                background: glass('medium'),
                borderColor: colors.border.primary
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={typography.h3} style={{ color: colors.text.primary }}>
                    Advanced Price Analysis
                  </h3>
                  <p className={typography.caption} style={{ color: colors.text.tertiary }}>
                    Multi-timeframe technical analysis with AI insights
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg" style={{ background: colors.background.secondary }}>
                    <Layers size={16} style={{ color: colors.text.tertiary }} />
                  </button>
                  <button className="p-2 rounded-lg" style={{ background: colors.background.secondary }}>
                    <Maximize2 size={16} style={{ color: colors.text.tertiary }} />
                  </button>
                </div>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={advancedChartData.slice(-24)}>
                    <XAxis 
                      dataKey="hour" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: colors.text.muted, fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: colors.text.muted, fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: colors.background.secondary,
                        border: `1px solid ${colors.border.primary}`,
                        borderRadius: '12px',
                        color: colors.text.primary
                      }}
                    />
                    
                    {/* Bollinger Bands */}
                    <Area
                      dataKey="bb_upper"
                      fill={`${colors.accent.primary}10`}
                      stroke="transparent"
                    />
                    <Area
                      dataKey="bb_lower"
                      fill={`${colors.accent.primary}10`}
                      stroke="transparent"
                    />
                    
                    {/* Price Line */}
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke={colors.accent.primary}
                      strokeWidth={3}
                      dot={false}
                    />
                    
                    {/* Volume Bars */}
                    <Bar
                      dataKey="volume"
                      fill={`${colors.accent.secondary}30`}
                      radius={[2, 2, 0, 0]}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Market Analysis Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* AI Market Sentiment */}
              <div 
                className="p-6 rounded-2xl border"
                style={{
                  background: glass('medium'),
                  borderColor: colors.border.primary
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${colors.accent.primary}20` }}
                  >
                    <Lightbulb size={16} style={{ color: colors.accent.primary }} />
                  </div>
                  <div>
                    <div className={typography.body} style={{ color: colors.text.primary }}>
                      AI Sentiment
                    </div>
                    <div className={typography.caption} style={{ color: colors.text.tertiary }}>
                      Neural network analysis
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={typography.caption} style={{ color: colors.text.muted }}>
                      Market Sentiment
                    </span>
                    <span className="font-semibold" style={{ color: colors.status.success }}>
                      Bullish
                    </span>
                  </div>
                  
                  <div className="w-full h-2 rounded-full" style={{ background: colors.background.tertiary }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '72%' }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full rounded-full bg-gradient-to-r from-green-400 to-blue-400"
                    />
                  </div>
                  
                  <div className="text-2xl font-bold" style={{ color: colors.text.primary }}>
                    72/100
                  </div>
                </div>
              </div>

              {/* Fear & Greed Gauge */}
              <div 
                className="p-6 rounded-2xl border"
                style={{
                  background: glass('medium'),
                  borderColor: colors.border.primary
                }}
              >
                <div className="text-center">
                  <div className={typography.caption} style={{ color: colors.text.muted }}>
                    FEAR & GREED INDEX
                  </div>
                  
                  <div className="my-4">
                    <ResponsiveContainer width="100%" height={120}>
                      <RadialBarChart cx="50%" cy="90%" innerRadius="60%" outerRadius="90%" 
                                    startAngle={180} endAngle={0} data={[{ value: 72 }]}>
                        <RadialBar
                          dataKey="value"
                          cornerRadius={10}
                          fill={colors.status.success}
                        />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="text-3xl font-bold mb-2" style={{ color: colors.text.primary }}>
                    72
                  </div>
                  <div 
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      background: `${colors.status.success}20`,
                      color: colors.status.success
                    }}
                  >
                    Greed
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Row - Advanced Features */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Phase Transition Heatmap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl border"
              style={{
                background: glass('medium'),
                borderColor: colors.border.primary
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={typography.h3} style={{ color: colors.text.primary }}>
                    Rotation Heatmap
                  </h3>
                  <p className={typography.caption} style={{ color: colors.text.tertiary }}>
                    Real-time phase transition probabilities
                  </p>
                </div>
                <Shield size={20} style={{ color: colors.accent.primary }} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { phase: 'BTC Heavy', probability: 25, active: currentPhase === 'BTC_HEAVY' },
                  { phase: 'ETH Rotation', probability: 60, active: currentPhase === 'ETH_ROTATION' },
                  { phase: 'Alt Season', probability: 85, active: currentPhase === 'ALT_SEASON' },
                  { phase: 'Cash Heavy', probability: 15, active: currentPhase === 'CASH_HEAVY' }
                ].map((item, index) => (
                  <motion.div
                    key={item.phase}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-xl border-2 ${item.active ? 'animate-pulse' : ''}`}
                    style={{
                      background: item.active ? `${colors.accent.primary}10` : colors.background.secondary,
                      borderColor: item.active ? colors.accent.primary : colors.border.primary
                    }}
                  >
                    <div className={typography.caption} style={{ color: colors.text.muted }}>
                      {item.phase.toUpperCase()}
                    </div>
                    <div className="text-xl font-bold my-2" style={{ color: colors.text.primary }}>
                      {item.probability}%
                    </div>
                    <div className="w-full h-1 rounded-full" style={{ background: colors.background.tertiary }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.probability}%` }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                        className="h-full rounded-full"
                        style={{ 
                          background: item.probability > 70 ? colors.status.success :
                                     item.probability > 40 ? colors.status.warning :
                                     colors.status.danger
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Portfolio Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl border"
              style={{
                background: glass('medium'),
                borderColor: colors.border.primary
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={typography.h3} style={{ color: colors.text.primary }}>
                    Portfolio Allocation
                  </h3>
                  <p className={typography.caption} style={{ color: colors.text.tertiary }}>
                    Optimized based on current phase
                  </p>
                </div>
                <Target size={20} style={{ color: colors.accent.secondary }} />
              </div>

              <div className="flex items-center justify-center mb-6">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'BTC', value: 40, fill: colors.accent.primary },
                        { name: 'ETH', value: 35, fill: colors.accent.secondary },
                        { name: 'ALTS', value: 20, fill: colors.status.warning },
                        { name: 'CASH', value: 5, fill: colors.text.tertiary }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { name: 'BTC', value: 40, fill: colors.accent.primary },
                        { name: 'ETH', value: 35, fill: colors.accent.secondary },
                        { name: 'ALTS', value: 20, fill: colors.status.warning },
                        { name: 'CASH', value: 5, fill: colors.text.tertiary }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {[
                  { asset: 'BTC', allocation: 40, color: colors.accent.primary },
                  { asset: 'ETH', allocation: 35, color: colors.accent.secondary },
                  { asset: 'ALTS', allocation: 20, color: colors.status.warning },
                  { asset: 'CASH', allocation: 5, color: colors.text.tertiary }
                ].map((item) => (
                  <div key={item.asset} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ background: item.color }}
                      />
                      <span style={{ color: colors.text.primary }}>{item.asset}</span>
                    </div>
                    <span className="font-semibold" style={{ color: colors.text.primary }}>
                      {item.allocation}%
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* AI Predictive Analytics Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-8"
            >
              <AIPredictiveAnalytics />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedTradingDashboard;