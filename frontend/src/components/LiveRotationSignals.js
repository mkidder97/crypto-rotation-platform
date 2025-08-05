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
  Eye,
  Signal,
  Gauge
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, AreaChart, Area, ComposedChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { phaseAPI, marketAPI } from '../services/api';
import { colors, animations, typography, glass } from '../utils/designSystem';

const LiveRotationSignals = () => {
  const [mounted, setMounted] = useState(false);
  const [activeSignal, setActiveSignal] = useState(null);
  
  const { data: metricsData, isLoading } = useQuery(
    'currentMetrics', 
    marketAPI.getCurrentMetrics,
    { refetchInterval: 5000 } // 5 second updates for live feel
  );
  
  const { data: phaseData } = useQuery(
    'currentPhase', 
    phaseAPI.getCurrentPhase,
    { refetchInterval: 10000 }
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const metrics = metricsData?.data;
  const currentPhase = phaseData?.data?.phase || 'BTC_HEAVY';

  // Real-time signal calculations based on PRD
  const calculateSignals = () => {
    if (!metrics) return [];

    const { btc_dominance, eth_btc_ratio, total3_eth_ratio } = metrics;
    const signals = [];

    // BTC Dominance Signal
    const btcDomSignal = {
      id: 'btc_dom',
      name: 'BTC Dominance',
      value: btc_dominance,
      threshold: 68,
      status: btc_dominance > 68 ? 'active' : 'monitoring',
      strength: Math.min((btc_dominance - 50) / 20, 1),
      description: btc_dominance > 68 ? 'Above 68% - ETH rotation signal' : 'Below threshold - Continue monitoring',
      color: btc_dominance > 68 ? colors.status.warning : colors.text.tertiary
    };

    // ETH/BTC Ratio Signal
    const ethBtcSignal = {
      id: 'eth_btc',
      name: 'ETH/BTC Ratio',
      value: eth_btc_ratio,
      threshold: 0.053,
      status: eth_btc_ratio >= 0.050 && eth_btc_ratio <= 0.053 ? 'active' : 
              eth_btc_ratio > 0.053 ? 'bullish' : 'monitoring',
      strength: eth_btc_ratio / 0.08, // Normalize to 0-1
      description: eth_btc_ratio >= 0.050 && eth_btc_ratio <= 0.053 ? 
                  'In bounce zone - Watch for breakout' : 
                  eth_btc_ratio > 0.053 ? 'Above zone - Alt season signal' : 'Below bounce zone',
      color: eth_btc_ratio >= 0.050 && eth_btc_ratio <= 0.053 ? colors.status.warning :
             eth_btc_ratio > 0.053 ? colors.status.success : colors.text.tertiary
    };

    // TOTAL3/ETH Signal
    const total3EthSignal = {
      id: 'total3_eth',
      name: 'TOTAL3/ETH',
      value: total3_eth_ratio,
      threshold: 0.8,
      status: total3_eth_ratio > 0.8 ? 'active' : 'monitoring',
      strength: Math.min(total3_eth_ratio / 1.2, 1),
      description: total3_eth_ratio > 0.8 ? 'Altcoin strength confirmed' : 'Alts underperforming ETH',
      color: total3_eth_ratio > 0.8 ? colors.status.success : colors.text.tertiary
    };

    return [btcDomSignal, ethBtcSignal, total3EthSignal];
  };

  const signals = calculateSignals();

  // Generate mock time series data for visualization
  const generateTimeSeriesData = (currentValue, volatility = 0.02) => {
    const data = [];
    const points = 24; // 24 hours of data
    
    for (let i = 0; i < points; i++) {
      const time = new Date();
      time.setHours(time.getHours() - (points - i));
      
      const noise = (Math.random() - 0.5) * volatility * currentValue;
      const trend = Math.sin((i / points) * Math.PI * 2) * currentValue * 0.1;
      
      data.push({
        time: time.toISOString(),
        value: currentValue + noise + trend,
        hour: time.getHours()
      });
    }
    
    return data;
  };

  const getPhaseTransitionProbability = () => {
    if (!metrics) return 0;
    
    const { btc_dominance, eth_btc_ratio, total3_eth_ratio } = metrics;
    let probability = 0;
    
    if (currentPhase === 'BTC_HEAVY') {
      if (btc_dominance > 68) probability += 30;
      if (eth_btc_ratio >= 0.050 && eth_btc_ratio <= 0.053) probability += 40;
      if (eth_btc_ratio > 0.053) probability += 20;
    } else if (currentPhase === 'ETH_ROTATION') {
      if (btc_dominance < 68) probability += 25;
      if (eth_btc_ratio > 0.053) probability += 35;
      if (total3_eth_ratio > 0.8) probability += 30;
    }
    
    return Math.min(probability, 100);
  };

  const transitionProbability = getPhaseTransitionProbability();

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        {...animations.fadeIn}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className={typography.h2} style={{ color: colors.text.primary }}>
            Live Rotation Signals
          </h2>
          <p className={typography.caption} style={{ color: colors.text.tertiary }}>
            Real-time market indicators for phase transitions
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: colors.status.success }}
            />
            <span className={typography.caption} style={{ color: colors.text.muted }}>
              Live Data
            </span>
          </div>
          
          {/* Transition Probability Gauge */}
          <div 
            className="px-4 py-2 rounded-xl border"
            style={{
              background: glass('light'),
              borderColor: colors.border.primary
            }}
          >
            <div className="flex items-center gap-3">
              <Gauge size={16} style={{ color: colors.text.tertiary }} />
              <div>
                <div className={typography.caption} style={{ color: colors.text.muted }}>
                  Transition Probability
                </div>
                <div 
                  className="text-lg font-bold"
                  style={{ 
                    color: transitionProbability > 70 ? colors.status.success :
                           transitionProbability > 40 ? colors.status.warning :
                           colors.text.tertiary
                  }}
                >
                  {transitionProbability}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Signal Cards */}
      <motion.div
        {...animations.fadeIn}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {signals.map((signal, index) => (
          <motion.div
            key={signal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 rounded-2xl border cursor-pointer hover:scale-[1.02] transition-transform"
            style={{
              background: glass('medium'),
              borderColor: activeSignal === signal.id ? signal.color : colors.border.primary
            }}
            onClick={() => setActiveSignal(activeSignal === signal.id ? null : signal.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: `${signal.color}20`,
                    color: signal.color
                  }}
                >
                  <Signal size={20} />
                </div>
                <div>
                  <div className={typography.body} style={{ color: colors.text.primary }}>
                    {signal.name}
                  </div>
                  <div className={typography.caption} style={{ color: colors.text.tertiary }}>
                    {signal.status.toUpperCase()}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div 
                  className="text-xl font-bold"
                  style={{ color: signal.color }}
                >
                  {signal.id === 'btc_dom' ? `${signal.value?.toFixed(1)}%` :
                   signal.value?.toFixed(4) || '0.0000'}
                </div>
                <div className={typography.caption} style={{ color: colors.text.muted }}>
                  vs {signal.id === 'btc_dom' ? `${signal.threshold}%` : signal.threshold}
                </div>
              </div>
            </div>

            {/* Signal Strength Bar */}
            <div className="mb-4">
              <div 
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: `${colors.text.tertiary}20` }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${signal.strength * 100}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: signal.color }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className={typography.micro} style={{ color: colors.text.muted }}>
                  Weak
                </span>
                <span className={typography.micro} style={{ color: colors.text.muted }}>
                  Strong
                </span>
              </div>
            </div>

            <div className={typography.caption} style={{ color: colors.text.secondary }}>
              {signal.description}
            </div>

            {/* Expanded Chart View */}
            <AnimatePresence>
              {activeSignal === signal.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-6 border-t"
                  style={{ borderColor: colors.border.primary }}
                >
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={generateTimeSeriesData(signal.value)}>
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={signal.color}
                          fill={`${signal.color}20`}
                          strokeWidth={2}
                        />
                        <XAxis 
                          dataKey="hour" 
                          hide 
                        />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: colors.background.secondary,
                            border: `1px solid ${colors.border.primary}`,
                            borderRadius: '8px',
                            color: colors.text.primary
                          }}
                          formatter={(value) => [
                            signal.id === 'btc_dom' ? `${value.toFixed(1)}%` : value.toFixed(4),
                            signal.name
                          ]}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>

      {/* Phase Transition Timeline */}
      <motion.div
        {...animations.fadeIn}
        className="p-8 rounded-3xl border"
        style={{
          background: glass('medium'),
          borderColor: colors.border.primary
        }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className={typography.h3} style={{ color: colors.text.primary }}>
              Rotation Phase Timeline
            </h3>
            <p className={typography.caption} style={{ color: colors.text.tertiary }}>
              Current phase and transition indicators based on PRD specifications
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between relative">
          {/* Timeline Line */}
          <div 
            className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2"
            style={{ backgroundColor: colors.border.primary }}
          />
          
          {['BTC_HEAVY', 'ETH_ROTATION', 'ALT_SEASON', 'CASH_HEAVY'].map((phase, index) => {
            const isActive = currentPhase === phase;
            const isCompleted = index < ['BTC_HEAVY', 'ETH_ROTATION', 'ALT_SEASON', 'CASH_HEAVY'].indexOf(currentPhase);
            
            return (
              <div key={phase} className="relative z-10 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`w-12 h-12 rounded-full border-4 flex items-center justify-center mx-auto mb-3 ${
                    isActive ? 'animate-pulse' : ''
                  }`}
                  style={{
                    backgroundColor: isActive ? colors.accent.primary : 
                                   isCompleted ? colors.status.success :
                                   colors.background.primary,
                    borderColor: isActive ? colors.accent.primary :
                                isCompleted ? colors.status.success :
                                colors.border.primary,
                    color: colors.text.primary
                  }}
                >
                  {isActive ? <Activity size={20} /> :
                   isCompleted ? <CheckCircle2 size={20} /> :
                   <Clock size={20} />}
                </motion.div>
                
                <div 
                  className={`font-semibold ${typography.caption}`}
                  style={{ 
                    color: isActive ? colors.accent.primary :
                           colors.text.secondary
                  }}
                >
                  {phase.replace('_', ' ')}
                </div>
                
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 px-2 py-1 rounded-full text-xs"
                    style={{
                      backgroundColor: `${colors.accent.primary}20`,
                      color: colors.accent.primary
                    }}
                  >
                    ACTIVE
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default LiveRotationSignals;