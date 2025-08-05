import React from 'react';
import { useQuery } from 'react-query';
import { phaseAPI, marketAPI } from '../services/api';

const PhaseIndicator = () => {
  const { data, isLoading, error } = useQuery('currentPhase', phaseAPI.getCurrentPhase);
  const { data: metricsData } = useQuery('currentMetrics', marketAPI.getCurrentMetrics);

  const getPhaseColor = (phase) => {
    switch (phase) {
      case 'BTC_HEAVY':
        return 'bg-gradient-to-r from-orange-500 to-yellow-500';
      case 'ETH_ROTATION':
        return 'bg-gradient-to-r from-purple-500 to-indigo-500';
      case 'ALT_SEASON':
        return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'CASH_HEAVY':
        return 'bg-gradient-to-r from-red-500 to-pink-500';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  const getPhaseDescription = (phase) => {
    switch (phase) {
      case 'BTC_HEAVY':
        return 'Bitcoin Accumulation Phase - Focus on BTC (70-90%)';
      case 'ETH_ROTATION':
        return 'Ethereum Rotation Phase - Shift to ETH (60-70%)';
      case 'ALT_SEASON':
        return 'Altcoin Season - High Alt Exposure (60-80%)';
      case 'CASH_HEAVY':
        return 'Risk-Off Phase - Cash/Stables Priority (50%)';
      default:
        return 'Analyzing Market Phase...';
    }
  };

  const getPhaseEmoji = (phase) => {
    switch (phase) {
      case 'BTC_HEAVY': return '₿';
      case 'ETH_ROTATION': return '🔄';
      case 'ALT_SEASON': return '🚀';
      case 'CASH_HEAVY': return '💰';
      default: return '📊';
    }
  };

  const getActionableRecommendations = (phase, metrics) => {
    const recommendations = [];
    
    if (!metrics) return recommendations;

    switch (phase) {
      case 'BTC_HEAVY':
        recommendations.push('✅ Maintain high BTC allocation (70-90%)');
        if (metrics.btc_dominance > 65) {
          recommendations.push('⚠️ Watch for ETH rotation signals');
          recommendations.push('📊 Monitor ETH/BTC ratio near 0.050 zone');
        }
        break;
      case 'ETH_ROTATION':
        recommendations.push('🔄 Increase ETH allocation to 60-70%');
        recommendations.push('📝 Prepare altcoin watchlist');
        if (metrics.total3_eth_ratio > 0.8) {
          recommendations.push('🚨 Alt season may be starting soon');
        }
        break;
      case 'ALT_SEASON':
        recommendations.push('🚀 Maximize altcoin exposure (60-80%)');
        recommendations.push('🎯 Focus on mid-cap alts with strong ETH pairs');
        recommendations.push('⚠️ Set stop-losses to protect gains');
        if (metrics.eth_btc_ratio < 0.053) {
          recommendations.push('🚨 Consider taking profits soon');
        }
        break;
      case 'CASH_HEAVY':
        recommendations.push('💰 Maintain high cash allocation (50%+)');
        recommendations.push('⏳ Wait for clear re-entry signals');
        if (metrics.btc_24h_change > 5) {
          recommendations.push('👀 Watch for trend reversal');
        }
        break;
    }
    
    return recommendations;
  };

  const getTransitionProbability = (metrics) => {
    if (!metrics) return { next: 'Unknown', probability: 0, timeframe: 'Unknown' };
    
    const { btc_dominance, eth_btc_ratio, total3_eth_ratio } = metrics;
    
    // Simple transition probability logic
    if (btc_dominance > 65 && eth_btc_ratio < 0.052) {
      return { next: 'ETH_ROTATION', probability: 75, timeframe: '1-2 weeks' };
    } else if (eth_btc_ratio > 0.055 && total3_eth_ratio > 0.9) {
      return { next: 'ALT_SEASON', probability: 80, timeframe: '2-4 weeks' };
    } else if (eth_btc_ratio < 0.048 || btc_dominance < 45) {
      return { next: 'CASH_HEAVY', probability: 60, timeframe: '1-3 weeks' };
    }
    
    return { next: 'No Clear Signal', probability: 30, timeframe: 'Monitor' };
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 text-red-600 dark:text-red-400">
        Error loading phase data: {error.message}
      </div>
    );
  }

  const phaseData = data?.data;
  const metrics = metricsData?.data;
  const currentPhase = phaseData?.current_phase || 'BTC_HEAVY'; // Default fallback
  const confidence = phaseData?.phase_confidence || 65;
  
  const recommendations = getActionableRecommendations(currentPhase, metrics);
  const nextTransition = getTransitionProbability(metrics);

  return (
    <div className={`${getPhaseColor(currentPhase)} rounded-lg shadow-xl p-8 text-white relative overflow-hidden`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
      </div>
      
      <div className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Phase Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-6xl">{getPhaseEmoji(currentPhase)}</span>
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  {currentPhase?.replace('_', ' ') || 'ANALYZING'}
                </h1>
                <p className="text-xl opacity-90">
                  {getPhaseDescription(currentPhase)}
                </p>
              </div>
            </div>
            
            {/* Confidence & Status */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-sm opacity-75 mb-2">Phase Confidence</div>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-white/20 rounded-full h-3">
                    <div 
                      className="bg-white rounded-full h-3 transition-all duration-1000"
                      style={{ width: `${confidence}%` }}
                    />
                  </div>
                  <span className="text-lg font-bold">{confidence}%</span>
                </div>
              </div>
              
              <div>
                <div className="text-sm opacity-75 mb-2">Next Transition</div>
                <div className="text-lg font-bold">
                  {nextTransition.probability > 50 ? (
                    <>
                      {nextTransition.next} ({nextTransition.probability}%)
                      <div className="text-sm opacity-75">{nextTransition.timeframe}</div>
                    </>
                  ) : (
                    <>
                      Stay Current
                      <div className="text-sm opacity-75">Monitor signals</div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Items */}
            {recommendations.length > 0 && (
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <h3 className="font-bold mb-3 flex items-center">
                  <span className="mr-2">🎯</span>
                  Action Items
                </h3>
                <div className="space-y-2">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="text-sm opacity-90">{rec}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Market Metrics */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Key Metrics</h3>
            
            {metrics && (
              <div className="space-y-4">
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-sm opacity-75">BTC Dominance</div>
                  <div className="text-2xl font-bold">{metrics.btc_dominance?.toFixed(1) || '55.0'}%</div>
                  <div className="text-xs opacity-60">Threshold: 68%</div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-sm opacity-75">ETH/BTC Ratio</div>
                  <div className="text-2xl font-bold">{metrics.eth_btc_ratio?.toFixed(4) || '0.0323'}</div>
                  <div className="text-xs opacity-60">Zone: 0.050-0.053</div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-sm opacity-75">TOTAL3/ETH</div>
                  <div className="text-2xl font-bold">{metrics.total3_eth_ratio?.toFixed(2) || '2.00'}</div>
                  <div className="text-xs opacity-60">Alt strength</div>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-sm opacity-75">24h Performance</div>
                  <div className="flex justify-between text-sm">
                    <span>BTC: {metrics.btc_24h_change > 0 ? '+' : ''}{metrics.btc_24h_change?.toFixed(1) || '0.0'}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>ETH: {metrics.eth_24h_change > 0 ? '+' : ''}{metrics.eth_24h_change?.toFixed(1) || '0.0'}%</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Status Indicator */}
            <div className="mt-6 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm">System Status</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs">Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhaseIndicator;