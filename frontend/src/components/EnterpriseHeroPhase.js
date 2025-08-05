import React, { useState, useEffect } from 'react';
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
  PieChart
} from 'lucide-react';
import { phaseAPI, marketAPI } from '../services/api';
import { cn, colors, phaseStyles, animations, typography, metrics, shadows, glass } from '../utils/designSystem';

const EnterpriseHeroPhase = () => {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const { data: phaseData, isLoading, error } = useQuery('currentPhase', phaseAPI.getCurrentPhase, {
    refetchInterval: 15000, // Refetch every 15 seconds
  });
  
  const { data: metricsData } = useQuery('currentMetrics', marketAPI.getCurrentMetrics, {
    refetchInterval: 15000,
  });

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getPhaseIcon = (phase) => {
    const icons = {
      'BTC_HEAVY': '₿',
      'ETH_ROTATION': '⟠', 
      'ALT_SEASON': '🚀',
      'CASH_HEAVY': '💰'
    };
    return icons[phase] || '📊';
  };

  const getNextTransition = (metrics, currentPhase) => {
    if (!metrics) return { next: 'Analyzing...', probability: 0, timeframe: 'Unknown' };
    
    const { btc_dominance, eth_btc_ratio, total3_eth_ratio, total3_btc_ratio } = metrics;
    
    // PRD-compliant transition logic
    if (currentPhase === 'BTC_HEAVY') {
      // Phase A: BTC to ETH Rotation (PRD specs)
      if (btc_dominance > 68 && eth_btc_ratio >= 0.050 && eth_btc_ratio <= 0.053) {
        return { next: 'ETH Rotation', probability: 85, timeframe: '1-2 weeks' };
      }
    } else if (currentPhase === 'ETH_ROTATION') {
      // Phase B: ETH to Alts Rotation (PRD specs)
      if (btc_dominance < 68 && eth_btc_ratio > 0.053 && total3_eth_ratio > 0.9) {
        return { next: 'Alt Season', probability: 90, timeframe: '2-4 weeks' };
      }
    } else if (currentPhase === 'ALT_SEASON') {
      // Phase C: Back to BTC/ETH (PRD specs)
      if (eth_btc_ratio < 0.053 || btc_dominance > 58) {
        return { next: 'BTC Heavy', probability: 75, timeframe: '3-6 weeks' };
      }
    }
    
    // Default monitoring state
    return { next: 'Monitor Current', probability: 45, timeframe: 'Watch signals' };
  };

  const getMarketSentiment = (metrics) => {
    if (!metrics) return { sentiment: 'neutral', strength: 0.5, trend: 'sideways' };
    
    const { btc_24h_change = 0, eth_24h_change = 0 } = metrics;
    const avgChange = (btc_24h_change + eth_24h_change) / 2;
    
    if (avgChange > 5) return { sentiment: 'bullish', strength: Math.min(avgChange / 10, 1), trend: 'up' };
    if (avgChange < -5) return { sentiment: 'bearish', strength: Math.min(Math.abs(avgChange) / 10, 1), trend: 'down' };
    return { sentiment: 'neutral', strength: 0.5, trend: 'sideways' };
  };

  const formatCurrency = (value) => {
    if (!value) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value) => {
    if (!value) return '0.00%';
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (!mounted) return null;

  if (isLoading) {
    return (
      <motion.div 
        {...animations.fadeIn}
        className="relative overflow-hidden rounded-3xl p-12"
        style={{
          background: `linear-gradient(135deg, ${colors.background.tertiary} 0%, ${colors.background.surface} 100%)`,
          border: `1px solid ${colors.border.primary}`
        }}
      >
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full border-4 border-t-transparent"
            style={{ borderColor: colors.accent.primary }}
          />
          <div className="ml-6">
            <div className={typography.h3} style={{ color: colors.text.secondary }}>
              Analyzing Market Conditions
            </div>
            <div className={typography.caption} style={{ color: colors.text.muted }}>
              Loading real-time data...
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        {...animations.fadeIn}
        className="relative overflow-hidden rounded-3xl p-12"
        style={{
          background: `linear-gradient(135deg, ${colors.status.danger}20 0%, ${colors.background.surface} 100%)`,
          border: `1px solid ${colors.status.danger}40`
        }}
      >
        <div className="flex items-center justify-center h-64">
          <AlertTriangle size={48} style={{ color: colors.status.danger }} />
          <div className="ml-6">
            <div className={typography.h3} style={{ color: colors.status.danger }}>
              Connection Error
            </div>
            <div className={typography.caption} style={{ color: colors.text.muted }}>
              Unable to fetch market data. Please check your connection.
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const phase = phaseData?.data;
  const metrics = metricsData?.data;
  const currentPhase = phase?.current_phase || 'BTC_HEAVY';
  const confidence = phase?.phase_confidence || 75;
  const nextTransition = getNextTransition(metrics, currentPhase);
  const marketSentiment = getMarketSentiment(metrics);
  const phaseStyle = phaseStyles[currentPhase];

  return (
    <motion.div
      {...animations.fadeIn}
      className="relative overflow-hidden rounded-3xl"
      style={{
        background: phaseStyle?.gradient || `linear-gradient(135deg, ${colors.background.tertiary} 0%, ${colors.background.surface} 100%)`,
        boxShadow: phaseStyle?.glow || shadows.card,
      }}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 40% 60%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-full h-full"
        />
      </div>

      <div className="relative z-10 p-12">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div 
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ 
                backgroundColor: colors.status.success,
                boxShadow: `0 0 12px ${colors.status.success}60`
              }}
            />
            <div className={typography.caption} style={{ color: colors.text.muted }}>
              LIVE MARKET ANALYSIS
            </div>
          </div>
          <div className={typography.caption} style={{ color: colors.text.muted }}>
            {currentTime.toLocaleTimeString('en-US', { 
              hour12: false, 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit' 
            })} UTC
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-center">
          {/* Main Phase Display */}
          <div className="xl:col-span-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center gap-8 mb-8"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="text-8xl lg:text-9xl"
              >
                {getPhaseIcon(currentPhase)}
              </motion.div>
              
              <div>
                <motion.h1
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className={typography.display}
                  style={{ color: colors.text.primary }}
                >
                  {phaseStyle?.name || currentPhase.replace('_', ' ')}
                </motion.h1>
                
                <motion.p
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className={typography.bodyLarge}
                  style={{ color: colors.text.secondary }}
                >
                  {phaseStyle?.description || 'Market analysis in progress'}
                </motion.p>
              </div>
            </motion.div>

            {/* Metrics Grid */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Confidence */}
              <div 
                className="p-6 rounded-2xl border"
                style={{
                  background: glass('medium'),
                  borderColor: colors.border.primary
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={typography.micro} style={{ color: colors.text.muted }}>
                    PHASE CONFIDENCE
                  </div>
                  <CheckCircle2 size={16} style={{ color: colors.status.success }} />
                </div>
                <div className="flex items-end gap-3">
                  <div className={typography.monoLarge} style={{ color: colors.text.primary }}>
                    {confidence}%
                  </div>
                  <div 
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: confidence > 80 ? `${colors.status.success}20` : 
                                     confidence > 60 ? `${colors.status.warning}20` : 
                                     `${colors.status.danger}20`,
                      color: confidence > 80 ? colors.status.success : 
                             confidence > 60 ? colors.status.warning : 
                             colors.status.danger
                    }}
                  >
                    {confidence > 80 ? 'High' : confidence > 60 ? 'Medium' : 'Low'}
                  </div>
                </div>
                <div className="mt-4">
                  <div 
                    className="h-2 rounded-full"
                    style={{ backgroundColor: `${colors.text.primary}20` }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${confidence}%` }}
                      transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                      className="h-2 rounded-full"
                      style={{ 
                        background: `linear-gradient(90deg, ${colors.accent.primary} 0%, ${colors.accent.secondary} 100%)`
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Next Transition */}
              <div 
                className="p-6 rounded-2xl border"
                style={{
                  background: glass('medium'),
                  borderColor: colors.border.primary
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={typography.micro} style={{ color: colors.text.muted }}>
                    NEXT TRANSITION
                  </div>
                  <Clock size={16} style={{ color: colors.text.tertiary }} />
                </div>
                <div className={typography.h4} style={{ color: colors.text.primary }}>
                  {nextTransition.next}
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span style={{ color: colors.text.tertiary }}>
                    {nextTransition.probability}% probability
                  </span>
                  <span style={{ color: colors.text.tertiary }}>
                    ETA: {nextTransition.timeframe}
                  </span>
                </div>
              </div>

              {/* Market Sentiment */}
              <div 
                className="p-6 rounded-2xl border"
                style={{
                  background: glass('medium'),
                  borderColor: colors.border.primary
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={typography.micro} style={{ color: colors.text.muted }}>
                    MARKET SENTIMENT
                  </div>
                  {marketSentiment.trend === 'up' ? (
                    <TrendingUp size={16} style={{ color: colors.status.success }} />
                  ) : marketSentiment.trend === 'down' ? (
                    <TrendingDown size={16} style={{ color: colors.status.danger }} />
                  ) : (
                    <Activity size={16} style={{ color: colors.text.tertiary }} />
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    className={`${typography.h4} capitalize`}
                    style={{ 
                      color: marketSentiment.sentiment === 'bullish' ? colors.status.success :
                             marketSentiment.sentiment === 'bearish' ? colors.status.danger :
                             colors.text.primary
                    }}
                  >
                    {marketSentiment.sentiment}
                  </div>
                  <div 
                    className="w-12 h-2 rounded-full"
                    style={{ backgroundColor: `${colors.text.primary}20` }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${marketSentiment.strength * 100}%` }}
                      transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
                      className="h-2 rounded-full"
                      style={{ 
                        backgroundColor: marketSentiment.sentiment === 'bullish' ? colors.status.success :
                                        marketSentiment.sentiment === 'bearish' ? colors.status.danger :
                                        colors.text.primary
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Side Metrics */}
          <div className="xl:col-span-4 space-y-6">
            {/* Key Market Metrics */}
            {metrics && (
              <motion.div
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="space-y-4"
              >
                <div className={typography.micro} style={{ color: colors.text.muted }}>
                  KEY MARKET METRICS
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {/* BTC Price */}
                  <div 
                    className="p-4 rounded-xl border"
                    style={{
                      background: glass('light'),
                      borderColor: colors.border.primary
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={typography.caption} style={{ color: colors.text.tertiary }}>
                          Bitcoin Price
                        </div>
                        <div className={typography.mono} style={{ color: colors.text.primary }}>
                          {formatCurrency(metrics.btc_price)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div 
                          className="text-sm font-semibold flex items-center gap-1"
                          style={{ 
                            color: metrics.btc_24h_change >= 0 ? colors.status.success : colors.status.danger 
                          }}
                        >
                          {metrics.btc_24h_change >= 0 ? (
                            <ArrowUpRight size={14} />
                          ) : (
                            <ArrowDownRight size={14} />
                          )}
                          {formatPercent(metrics.btc_24h_change)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ETH Price */}
                  <div 
                    className="p-4 rounded-xl border"
                    style={{
                      background: glass('light'),
                      borderColor: colors.border.primary
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={typography.caption} style={{ color: colors.text.tertiary }}>
                          Ethereum Price
                        </div>
                        <div className={typography.mono} style={{ color: colors.text.primary }}>
                          {formatCurrency(metrics.eth_price)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div 
                          className="text-sm font-semibold flex items-center gap-1"
                          style={{ 
                            color: metrics.eth_24h_change >= 0 ? colors.status.success : colors.status.danger 
                          }}
                        >
                          {metrics.eth_24h_change >= 0 ? (
                            <ArrowUpRight size={14} />
                          ) : (
                            <ArrowDownRight size={14} />
                          )}
                          {formatPercent(metrics.eth_24h_change)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BTC Dominance */}
                  <div 
                    className="p-4 rounded-xl border"
                    style={{
                      background: glass('light'),
                      borderColor: colors.border.primary
                    }}
                  >
                    <div className={typography.caption} style={{ color: colors.text.tertiary }}>
                      BTC Dominance
                    </div>
                    <div className="flex items-end justify-between">
                      <div className={typography.mono} style={{ color: colors.text.primary }}>
                        {metrics.btc_dominance?.toFixed(1)}%
                      </div>
                      <div className={typography.caption} style={{ color: colors.text.muted }}>
                        Target: 68%
                      </div>
                    </div>
                  </div>

                  {/* ETH/BTC Ratio */}
                  <div 
                    className="p-4 rounded-xl border"
                    style={{
                      background: glass('light'),
                      borderColor: colors.border.primary
                    }}
                  >
                    <div className={typography.caption} style={{ color: colors.text.tertiary }}>
                      ETH/BTC Ratio
                    </div>
                    <div className="flex items-end justify-between">
                      <div className={typography.mono} style={{ color: colors.text.primary }}>
                        {metrics.eth_btc_ratio?.toFixed(4)}
                      </div>
                      <div className={typography.caption} style={{ color: colors.text.muted }}>
                        Zone: 0.050-0.053
                      </div>
                    </div>
                  </div>

                  {/* TOTAL3/ETH Ratio - Critical PRD Metric */}
                  <div 
                    className="p-4 rounded-xl border"
                    style={{
                      background: glass('light'),
                      borderColor: colors.border.primary
                    }}
                  >
                    <div className={typography.caption} style={{ color: colors.text.tertiary }}>
                      TOTAL3/ETH Ratio
                    </div>
                    <div className="flex items-end justify-between">
                      <div className={typography.mono} style={{ color: colors.text.primary }}>
                        {metrics.total3_eth_ratio?.toFixed(2)}
                      </div>
                      <div 
                        className={typography.caption} 
                        style={{ 
                          color: metrics.total3_eth_ratio > 0.9 ? colors.status.success : colors.text.muted
                        }}
                      >
                        Alt Strength
                      </div>
                    </div>
                  </div>

                  {/* TOTAL3/BTC Ratio - Additional PRD Metric */}
                  <div 
                    className="p-4 rounded-xl border"
                    style={{
                      background: glass('light'),
                      borderColor: colors.border.primary
                    }}
                  >
                    <div className={typography.caption} style={{ color: colors.text.tertiary }}>
                      TOTAL3/BTC Ratio
                    </div>
                    <div className="flex items-end justify-between">
                      <div className={typography.mono} style={{ color: colors.text.primary }}>
                        {metrics.total3_btc_ratio?.toFixed(3)}
                      </div>
                      <div className={typography.caption} style={{ color: colors.text.muted }}>
                        Alt/BTC Power
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* System Status */}
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="p-4 rounded-xl border"
              style={{
                background: glass('light'),
                borderColor: colors.border.primary
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className={typography.caption} style={{ color: colors.text.tertiary }}>
                    System Status
                  </div>
                  <div className={typography.body} style={{ color: colors.text.primary }}>
                    All Systems Operational
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-3 h-3 rounded-full"
                    style={{ 
                      backgroundColor: colors.status.success,
                      boxShadow: `0 0 8px ${colors.status.success}50`
                    }}
                  />
                  <div className={typography.caption} style={{ color: colors.status.success }}>
                    Live
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EnterpriseHeroPhase;