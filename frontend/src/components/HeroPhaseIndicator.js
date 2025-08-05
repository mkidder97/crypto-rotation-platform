import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'react-query';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import { phaseAPI, marketAPI } from '../services/api';
import { cn, phaseStyles, animations, glass, card } from '../utils/designSystem';

const HeroPhaseIndicator = () => {
  const [mounted, setMounted] = useState(false);
  const { data, isLoading, error } = useQuery('currentPhase', phaseAPI.getCurrentPhase);
  const { data: metricsData } = useQuery('currentMetrics', marketAPI.getCurrentMetrics);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getPhaseIcon = (phase) => {
    switch (phase) {
      case 'BTC_HEAVY': return '₿';
      case 'ETH_ROTATION': return '🔄';
      case 'ALT_SEASON': return '🚀';
      case 'CASH_HEAVY': return '💰';
      default: return '📊';
    }
  };

  const getPhaseTitle = (phase) => {
    switch (phase) {
      case 'BTC_HEAVY': return 'Bitcoin Accumulation';
      case 'ETH_ROTATION': return 'Ethereum Rotation';
      case 'ALT_SEASON': return 'Altcoin Season';
      case 'CASH_HEAVY': return 'Capital Preservation';
      default: return 'Market Analysis';
    }
  };

  const getPhaseDescription = (phase) => {
    switch (phase) {
      case 'BTC_HEAVY': return 'Optimal period for Bitcoin accumulation with 70-90% allocation';
      case 'ETH_ROTATION': return 'Transition phase favoring Ethereum with 60-70% allocation';
      case 'ALT_SEASON': return 'High-growth phase for altcoins with 60-80% allocation';
      case 'CASH_HEAVY': return 'Risk-off environment prioritizing capital preservation';
      default: return 'Analyzing market conditions for optimal positioning';
    }
  };

  const getNextTransition = (metrics) => {
    if (!metrics) return { next: 'Analyzing...', probability: 0, timeframe: 'Unknown' };
    
    const { btc_dominance, eth_btc_ratio, total3_eth_ratio } = metrics;
    
    if (btc_dominance > 65 && eth_btc_ratio < 0.052) {
      return { next: 'ETH Rotation', probability: 78, timeframe: '1-2 weeks' };
    } else if (eth_btc_ratio > 0.055 && total3_eth_ratio > 0.9) {
      return { next: 'Alt Season', probability: 85, timeframe: '2-4 weeks' };
    } else if (eth_btc_ratio < 0.048) {
      return { next: 'Cash Heavy', probability: 62, timeframe: '1-3 weeks' };
    }
    
    return { next: 'Hold Current', probability: 45, timeframe: 'Monitor' };
  };

  const getMarketSentiment = (metrics) => {
    if (!metrics) return { sentiment: 'neutral', strength: 0 };
    
    const { btc_24h_change, eth_24h_change } = metrics;
    const avgChange = (btc_24h_change + eth_24h_change) / 2;
    
    if (avgChange > 5) return { sentiment: 'bullish', strength: Math.min(avgChange / 10, 1) };
    if (avgChange < -5) return { sentiment: 'bearish', strength: Math.min(Math.abs(avgChange) / 10, 1) };
    return { sentiment: 'neutral', strength: 0.5 };
  };

  if (!mounted) return null;

  if (isLoading) {
    return (
      <motion.div 
        {...animations.fadeIn}
        className={cn(card.base, "p-8 h-96 flex items-center justify-center")}
      >
        <div className="text-center space-y-4">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
          >
            <Activity className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-gray-600 dark:text-gray-400">Analyzing market conditions...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        {...animations.fadeIn}
        className={cn(card.base, "p-8 border-red-500/20 bg-red-50/50 dark:bg-red-900/10")}
      >
        <div className="text-center space-y-4">
          <AlertTriangle className="w-16 h-16 mx-auto text-red-500" />
          <h3 className="text-xl font-semibold text-red-800 dark:text-red-300">
            Unable to Load Phase Data
          </h3>
          <p className="text-red-600 dark:text-red-400">
            Please check your connection and try again
          </p>
        </div>
      </motion.div>
    );
  }

  const phaseData = data?.data;
  const metrics = metricsData?.data;
  const currentPhase = phaseData?.current_phase || 'BTC_HEAVY';
  const confidence = phaseData?.phase_confidence || 75;
  const nextTransition = getNextTransition(metrics);
  const marketSentiment = getMarketSentiment(metrics);
  const phaseStyle = phaseStyles[currentPhase];

  return (
    <motion.div
      {...animations.fadeIn}
      className={cn(
        "relative overflow-hidden rounded-3xl",
        phaseStyle?.gradient || 'bg-gradient-to-br from-gray-500 to-gray-600',
        "shadow-2xl",
        phaseStyle?.glow
      )}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-full h-full"
        />
      </div>

      <div className="relative z-10 p-8 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Phase Display */}
          <div className="lg:col-span-8 space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center space-x-6"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="text-8xl lg:text-9xl"
              >
                {getPhaseIcon(currentPhase)}
              </motion.div>
              
              <div className="space-y-2">
                <motion.h1
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-4xl lg:text-6xl font-bold text-white mb-2"
                >
                  {getPhaseTitle(currentPhase)}
                </motion.h1>
                
                <motion.p
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-xl lg:text-2xl text-white/90 max-w-2xl"
                >
                  {getPhaseDescription(currentPhase)}
                </motion.p>
              </div>
            </motion.div>

            {/* Confidence and Next Transition */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Confidence Meter */}
              <div className={cn(glass('medium'), "p-6 rounded-2xl border border-white/20")}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">Phase Confidence</h3>
                  <CheckCircle className="w-5 h-5 text-white/80" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-white">{confidence}%</span>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium",
                      confidence > 80 ? "bg-green-500/20 text-green-100" :
                      confidence > 60 ? "bg-yellow-500/20 text-yellow-100" :
                      "bg-red-500/20 text-red-100"
                    )}>
                      {confidence > 80 ? 'High' : confidence > 60 ? 'Medium' : 'Low'}
                    </div>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${confidence}%` }}
                      transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                      className="h-3 bg-gradient-to-r from-white to-white/80 rounded-full shadow-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Next Transition */}
              <div className={cn(glass('medium'), "p-6 rounded-2xl border border-white/20")}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">Next Transition</h3>
                  <Clock className="w-5 h-5 text-white/80" />
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-white">
                    {nextTransition.next}
                  </div>
                  <div className="flex items-center justify-between text-sm text-white/80">
                    <span>Probability: {nextTransition.probability}%</span>
                    <span>ETA: {nextTransition.timeframe}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${nextTransition.probability}%` }}
                      transition={{ delay: 1, duration: 1, ease: "easeOut" }}
                      className="h-2 bg-white/80 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Side Metrics */}
          <div className="lg:col-span-4 space-y-4">
            {/* Market Sentiment */}
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className={cn(glass('medium'), "p-6 rounded-2xl border border-white/20")}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Market Sentiment</h3>
                {marketSentiment.sentiment === 'bullish' ? (
                  <TrendingUp className="w-5 h-5 text-green-300" />
                ) : marketSentiment.sentiment === 'bearish' ? (
                  <TrendingDown className="w-5 h-5 text-red-300" />
                ) : (
                  <Activity className="w-5 h-5 text-white/80" />
                )}
              </div>
              <div className="space-y-3">
                <div className="text-2xl font-bold text-white capitalize">
                  {marketSentiment.sentiment}
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${marketSentiment.strength * 100}%` }}
                    transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
                    className={cn(
                      "h-2 rounded-full",
                      marketSentiment.sentiment === 'bullish' ? "bg-green-400" :
                      marketSentiment.sentiment === 'bearish' ? "bg-red-400" :
                      "bg-white/80"
                    )}
                  />
                </div>
              </div>
            </motion.div>

            {/* Key Metrics */}
            {metrics && (
              <motion.div
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="space-y-3"
              >
                <div className={cn(glass('light'), "p-4 rounded-xl border border-white/10")}>
                  <div className="text-sm text-white/80">BTC Dominance</div>
                  <div className="text-xl font-bold text-white">
                    {metrics.btc_dominance?.toFixed(1) || '55.0'}%
                  </div>
                  <div className="text-xs text-white/60">Threshold: 68%</div>
                </div>
                
                <div className={cn(glass('light'), "p-4 rounded-xl border border-white/10")}>
                  <div className="text-sm text-white/80">ETH/BTC Ratio</div>
                  <div className="text-xl font-bold text-white">
                    {metrics.eth_btc_ratio?.toFixed(4) || '0.0323'}
                  </div>
                  <div className="text-xs text-white/60">Zone: 0.050-0.053</div>
                </div>
                
                <div className={cn(glass('light'), "p-4 rounded-xl border border-white/10")}>
                  <div className="text-sm text-white/80">TOTAL3/ETH</div>
                  <div className="text-xl font-bold text-white">
                    {metrics.total3_eth_ratio?.toFixed(2) || '2.00'}
                  </div>
                  <div className="text-xs text-white/60">Alt strength</div>
                </div>
              </motion.div>
            )}

            {/* Live Status */}
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className={cn(glass('light'), "p-4 rounded-xl border border-white/10")}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/80">System Status</span>
                <div className="flex items-center space-x-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 bg-green-400 rounded-full"
                  />
                  <span className="text-xs text-white/80">Live</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HeroPhaseIndicator;