import React from 'react';
import { useQuery } from 'react-query';
import { marketAPI, alertsAPI } from '../services/api';

const SmartAlerts = () => {
  const { data: metricsData } = useQuery('currentMetrics', marketAPI.getCurrentMetrics);
  const { data: alertsData } = useQuery('activeAlerts', alertsAPI.getActiveAlerts);

  const generateSmartAlerts = (metrics) => {
    const alerts = [];
    
    if (!metrics) return alerts;

    const { btc_dominance, eth_btc_ratio, total3_eth_ratio, btc_24h_change, eth_24h_change } = metrics;

    // BTC Dominance Alerts
    if (btc_dominance > 67) {
      alerts.push({
        type: 'warning',
        priority: 'high',
        title: 'BTC Dominance Near Peak',
        message: `BTC dominance at ${btc_dominance.toFixed(1)}%, approaching 68% threshold`,
        action: 'Prepare for ETH rotation - Watch ETH/BTC ratio closely',
        icon: '⚠️'
      });
    }

    if (btc_dominance < 50) {
      alerts.push({
        type: 'critical',
        priority: 'high',
        title: 'BTC Dominance Breakdown',
        message: `BTC dominance at ${btc_dominance.toFixed(1)}%, below 50%`,
        action: 'Consider profit-taking on altcoins, prepare cash allocation',
        icon: '🚨'
      });
    }

    // ETH/BTC Ratio Alerts
    if (eth_btc_ratio >= 0.050 && eth_btc_ratio <= 0.053) {
      alerts.push({
        type: 'info',
        priority: 'high',
        title: 'ETH/BTC in Bounce Zone',
        message: `ETH/BTC ratio at ${eth_btc_ratio.toFixed(4)}, in key support zone`,
        action: 'Watch for bounce signals - Potential rotation to ETH',
        icon: '🎯'
      });
    }

    if (eth_btc_ratio > 0.055) {
      alerts.push({
        type: 'success',
        priority: 'medium',
        title: 'ETH/BTC Breaking Higher',
        message: `ETH/BTC ratio at ${eth_btc_ratio.toFixed(4)}, above key resistance`,
        action: 'Strong ETH momentum - Consider altcoin rotation soon',
        icon: '🚀'
      });
    }

    // TOTAL3/ETH Ratio Alerts
    if (total3_eth_ratio > 1.0) {
      alerts.push({
        type: 'success',
        priority: 'medium',
        title: 'Altcoin Strength Building',
        message: `TOTAL3/ETH at ${total3_eth_ratio.toFixed(2)}, showing alt strength`,
        action: 'Altseason signals building - Prepare alt watchlist',
        icon: '📈'
      });
    }

    // Volatility Alerts
    if (Math.abs(btc_24h_change) > 10 || Math.abs(eth_24h_change) > 15) {
      alerts.push({
        type: 'warning',
        priority: 'medium',
        title: 'High Volatility Detected',
        message: `Large price moves: BTC ${btc_24h_change.toFixed(1)}%, ETH ${eth_24h_change.toFixed(1)}%`,
        action: 'Consider reducing position sizes or increasing cash allocation',
        icon: '📊'
      });
    }

    // Momentum Alerts
    if (btc_24h_change > 5 && eth_24h_change > 8) {
      alerts.push({
        type: 'success',
        priority: 'low',
        title: 'Positive Momentum',
        message: 'Strong upward momentum across major assets',
        action: 'Favorable environment for risk-on positioning',
        icon: '📈'
      });
    }

    return alerts.slice(0, 6); // Limit to 6 most important alerts
  };

  const getAlertStyle = (type) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const smartAlerts = generateSmartAlerts(metricsData?.data);
  const systemAlerts = alertsData?.data || [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Smart Alerts</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Live Analysis</span>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {/* Smart Generated Alerts */}
        {smartAlerts.map((alert, index) => (
          <div key={`smart-${index}`} className={`p-4 rounded-lg border ${getAlertStyle(alert.type)}`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 text-lg">{alert.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-sm">{alert.title}</h3>
                  <span className="text-xs">{getPriorityIcon(alert.priority)}</span>
                </div>
                <p className="text-sm opacity-90 mb-2">{alert.message}</p>
                <div className="bg-white/50 dark:bg-black/20 rounded px-3 py-2">
                  <p className="text-xs font-medium">💡 Action: {alert.action}</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* System Alerts */}
        {systemAlerts.map((alert) => (
          <div key={alert.id} className="p-4 rounded-lg border bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 text-lg">🔄</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-1">{alert.alert_type.replace('_', ' ')}</h3>
                <p className="text-sm opacity-90">{alert.message}</p>
                <div className="text-xs opacity-75 mt-1">
                  {new Date(alert.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* No Alerts State */}
        {smartAlerts.length === 0 && systemAlerts.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-gray-500 dark:text-gray-400">All systems normal</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              No urgent alerts at this time
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
            📊 Manual Data Refresh
          </button>
          <button className="px-3 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
            🔄 Force Phase Check
          </button>
          <button className="px-3 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
            📈 Run Backtest
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartAlerts;