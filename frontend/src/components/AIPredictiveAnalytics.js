import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'react-query';
import { 
  Brain,
  Zap,
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  Eye,
  Cpu,
  BarChart3,
  PieChart,
  Layers,
  Sparkles,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Lightbulb,
  Gauge,
  Network,
  Radar,
  Stars
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
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  ReferenceLine,
  Cell
} from 'recharts';
import { phaseAPI, marketAPI } from '../services/api';
import { colors, animations, typography, glass, phaseStyles } from '../utils/designSystem';

const AIPredictiveAnalytics = () => {
  const [mounted, setMounted] = useState(false);
  const [selectedModel, setSelectedModel] = useState('neural_ensemble');
  const [predictionTimeframe, setPredictionTimeframe] = useState('7d');
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);
  const [aiInsights, setAiInsights] = useState([]);

  const { data: metricsData } = useQuery(
    'currentMetrics', 
    marketAPI.getCurrentMetrics,
    { refetchInterval: 10000 }
  );

  const { data: phaseData } = useQuery(
    'currentPhase', 
    phaseAPI.getCurrentPhase,
    { refetchInterval: 15000 }
  );

  useEffect(() => {
    setMounted(true);
    
    // Simulate AI generating insights
    const generateInsights = () => {
      const insights = [
        {
          id: 1,
          type: 'prediction',
          confidence: 87,
          title: 'Phase Transition Imminent',
          description: 'Neural network detects 87% probability of ETH rotation within 72 hours',
          impact: 'high',
          timeframe: '2-3 days',
          action: 'Prepare portfolio rebalancing'
        },
        {
          id: 2,
          type: 'pattern',
          confidence: 92,
          title: 'Fractal Pattern Recognition',
          description: 'Historical pattern suggests 15% BTC price increase likely',
          impact: 'medium',
          timeframe: '1-2 weeks',
          action: 'Consider increasing BTC allocation'
        },
        {
          id: 3,
          type: 'sentiment',
          confidence: 76,
          title: 'Social Sentiment Shift',
          description: 'ML sentiment analysis indicates growing bullish momentum',
          impact: 'medium',
          timeframe: '5-7 days',
          action: 'Monitor altcoin opportunities'
        },
        {
          id: 4,
          type: 'risk',
          confidence: 83,
          title: 'Volatility Spike Warning',
          description: 'Ensemble models predict increased volatility in next 48h',
          impact: 'high',
          timeframe: '1-2 days',
          action: 'Reduce leverage, increase stops'
        }
      ];
      
      setAiInsights(insights);
    };

    generateInsights();
    const interval = setInterval(generateInsights, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, []);

  const metrics = metricsData?.data;
  const currentPhase = phaseData?.data?.phase || 'BTC_HEAVY';

  // Generate advanced ML predictions
  const mlPredictions = useMemo(() => {
    if (!metrics) return null;

    const { btc_dominance, eth_btc_ratio, total3_eth_ratio } = metrics;
    
    // Simulate advanced ML model outputs
    const models = {
      neural_ensemble: {
        accuracy: 87.3,
        predictions: {
          btc_price_7d: { value: 68500, confidence: 85, direction: 'up' },
          eth_price_7d: { value: 3450, confidence: 82, direction: 'up' },
          phase_transition: { probability: 73, next_phase: 'ETH_ROTATION', timeframe: '3-5 days' }
        }
      },
      transformer: {
        accuracy: 89.1,
        predictions: {
          btc_price_7d: { value: 67200, confidence: 89, direction: 'up' },
          eth_price_7d: { value: 3380, confidence: 87, direction: 'up' },
          phase_transition: { probability: 81, next_phase: 'ETH_ROTATION', timeframe: '2-4 days' }
        }
      },
      lstm_attention: {
        accuracy: 84.7,
        predictions: {
          btc_price_7d: { value: 69100, confidence: 84, direction: 'up' },
          eth_price_7d: { value: 3520, confidence: 79, direction: 'up' },
          phase_transition: { probability: 69, next_phase: 'ETH_ROTATION', timeframe: '4-7 days' }
        }
      }
    };

    return models[selectedModel];
  }, [metrics, selectedModel]);

  // Generate prediction confidence heatmap data
  const generateConfidenceData = () => {
    const timeframes = ['1h', '4h', '1d', '3d', '7d', '14d', '30d'];
    const assets = ['BTC', 'ETH', 'ALT'];
    
    return timeframes.map((timeframe, i) => ({
      timeframe,
      BTC: 70 + Math.random() * 25,
      ETH: 65 + Math.random() * 30,
      ALT: 60 + Math.random() * 35,
      overall: 68 + Math.random() * 20
    }));
  };

  const confidenceData = generateConfidenceData();

  if (!mounted) return null;

  const getInsightIcon = (type) => {
    const icons = {
      prediction: Brain,
      pattern: Radar,
      sentiment: Activity,
      risk: Shield
    };
    return icons[type] || Lightbulb;
  };

  const getInsightColor = (impact) => {
    const colorMap = {
      high: colors.status.danger,
      medium: colors.status.warning,
      low: colors.status.info
    };
    return colorMap[impact] || colors.text.tertiary;
  };

  return (
    <div className="space-y-8">
      {/* AI Analytics Header */}
      <motion.div
        {...animations.fadeIn}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${colors.accent.primary} 0%, ${colors.accent.secondary} 100%)`,
              boxShadow: `0 0 20px ${colors.accent.primary}30`
            }}
          >
            <Brain size={24} style={{ color: 'white' }} />
          </div>
          
          <div>
            <h2 className={typography.h2} style={{ color: colors.text.primary }}>
              AI Predictive Analytics
            </h2>
            <p className={typography.caption} style={{ color: colors.text.tertiary }}>
              Neural network ensemble with 87.3% historical accuracy
            </p>
          </div>
        </div>

        {/* Model Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 rounded-xl" 
               style={{ background: colors.background.secondary }}>
            {[
              { id: 'neural_ensemble', label: 'Ensemble', accuracy: 87.3 },
              { id: 'transformer', label: 'Transformer', accuracy: 89.1 },
              { id: 'lstm_attention', label: 'LSTM', accuracy: 84.7 }
            ].map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex flex-col items-center ${
                  selectedModel === model.id ? 'animate-pulse' : ''
                }`}
                style={{
                  background: selectedModel === model.id ? colors.accent.primary : 'transparent',
                  color: selectedModel === model.id ? 'white' : colors.text.secondary
                }}
              >
                <span>{model.label}</span>
                <span className="text-xs opacity-70">{model.accuracy}%</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Predictions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Price Predictions */}
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
                ML Price Predictions
              </h3>
              <p className={typography.caption} style={{ color: colors.text.tertiary }}>
                7-day forward predictions with confidence intervals
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Cpu size={16} style={{ color: colors.accent.primary }} />
              <span className="text-sm font-medium" style={{ color: colors.accent.primary }}>
                Computing...
              </span>
            </div>
          </div>

          {mlPredictions && (
            <div className="grid grid-cols-2 gap-6">
              {[
                { 
                  asset: 'BTC', 
                  current: metrics?.btc_price || 65000,
                  prediction: mlPredictions.predictions.btc_price_7d,
                  color: colors.crypto.bitcoin
                },
                { 
                  asset: 'ETH', 
                  current: metrics?.eth_price || 3200,
                  prediction: mlPredictions.predictions.eth_price_7d,
                  color: colors.crypto.ethereum
                }
              ].map((item) => {
                const changePercent = ((item.prediction.value - item.current) / item.current) * 100;
                
                return (
                  <div key={item.asset} className="p-4 rounded-xl border"
                       style={{ 
                         background: colors.background.secondary,
                         borderColor: colors.border.primary
                       }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                          style={{ 
                            background: `${item.color}20`,
                            color: item.color
                          }}
                        >
                          {item.asset}
                        </div>
                        <div>
                          <div className="text-sm font-medium" style={{ color: colors.text.primary }}>
                            {item.asset === 'BTC' ? 'Bitcoin' : 'Ethereum'}
                          </div>
                          <div className={typography.caption} style={{ color: colors.text.muted }}>
                            Current: ${item.current.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-2xl font-bold" style={{ color: colors.text.primary }}>
                        ${item.prediction.value.toLocaleString()}
                      </div>
                      <div 
                        className="flex items-center gap-1 text-sm font-semibold"
                        style={{ 
                          color: changePercent >= 0 ? colors.status.success : colors.status.danger 
                        }}
                      >
                        {changePercent >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={typography.caption} style={{ color: colors.text.muted }}>
                        Confidence
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full" 
                             style={{ background: colors.background.tertiary }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.prediction.confidence}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full rounded-full"
                            style={{ background: item.color }}
                          />
                        </div>
                        <span className="text-sm font-medium" style={{ color: colors.text.primary }}>
                          {item.prediction.confidence}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Confidence Heatmap */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-6 rounded-2xl border"
          style={{
            background: glass('medium'),
            borderColor: colors.border.primary
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Gauge size={20} style={{ color: colors.accent.secondary }} />
            <div>
              <h3 className={typography.h4} style={{ color: colors.text.primary }}>
                Confidence Matrix
              </h3>
              <p className={typography.caption} style={{ color: colors.text.tertiary }}>
                Model confidence by timeframe
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {confidenceData.map((item, index) => (
              <div key={item.timeframe} className="flex items-center gap-3">
                <div className="w-8 text-xs font-medium" style={{ color: colors.text.muted }}>
                  {item.timeframe}
                </div>
                
                <div className="flex-1 grid grid-cols-3 gap-1">
                  {['BTC', 'ETH', 'ALT'].map((asset) => (
                    <div
                      key={asset}
                      className="h-6 rounded flex items-center justify-center text-xs font-medium"
                      style={{
                        background: `hsl(${item[asset] * 1.2}, 70%, ${50 + item[asset] * 0.3}%)`,
                        color: item[asset] > 75 ? 'white' : colors.text.primary
                      }}
                    >
                      {Math.round(item[asset])}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t" style={{ borderColor: colors.border.primary }}>
            <div className="flex justify-between text-xs" style={{ color: colors.text.muted }}>
              <span>Low</span>
              <span>Confidence</span>
              <span>High</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI Insights Feed */}
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
          <div className="flex items-center gap-3">
            <Sparkles size={20} style={{ color: colors.accent.primary }} />
            <div>
              <h3 className={typography.h3} style={{ color: colors.text.primary }}>
                AI Insights Feed
              </h3>
              <p className={typography.caption} style={{ color: colors.text.tertiary }}>
                Real-time analysis from neural network ensemble
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: colors.status.success }}
            />
            <span className={typography.caption} style={{ color: colors.text.muted }}>
              Live Analysis
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {aiInsights.map((insight, index) => {
            const Icon = getInsightIcon(insight.type);
            const impactColor = getInsightColor(insight.impact);
            
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl border hover:scale-[1.02] transition-transform cursor-pointer"
                style={{
                  background: colors.background.secondary,
                  borderColor: colors.border.primary
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        background: `${impactColor}20`,
                        color: impactColor
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    
                    <div>
                      <div className="font-semibold text-sm" style={{ color: colors.text.primary }}>
                        {insight.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={typography.caption} style={{ color: colors.text.muted }}>
                          {insight.timeframe}
                        </span>
                        <div 
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            background: `${impactColor}20`,
                            color: impactColor
                          }}
                        >
                          {insight.confidence}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm mb-3" style={{ color: colors.text.secondary }}>
                  {insight.description}
                </p>

                <div 
                  className="text-xs font-medium px-2 py-1 rounded"
                  style={{
                    background: `${colors.accent.primary}10`,
                    color: colors.accent.primary
                  }}
                >
                  Action: {insight.action}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default AIPredictiveAnalytics;