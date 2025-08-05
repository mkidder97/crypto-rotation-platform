import React from 'react';
import { useQuery } from 'react-query';
import { phaseAPI, altcoinAPI, patternsAPI } from '../services/api';
import { format } from 'date-fns';

const Dashboard = () => {
  const { data: phaseTransitions } = useQuery('phaseTransitions', phaseAPI.getPhaseTransitions);
  const { data: altcoinData } = useQuery('altcoinMetrics', altcoinAPI.getMetrics);
  const { data: candlePatterns } = useQuery('candlePatterns', patternsAPI.getCandlePatterns);

  const getPhaseColor = (phase) => {
    const colors = {
      'BTC_HEAVY': 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300',
      'ETH_ROTATION': 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300',
      'ALT_SEASON': 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300',
      'CASH_HEAVY': 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300',
    };
    return colors[phase] || 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Phase Transition History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          Phase Transition History
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-2 text-sm text-gray-600 dark:text-gray-400">Date</th>
                <th className="text-left py-2 text-sm text-gray-600 dark:text-gray-400">From</th>
                <th className="text-left py-2 text-sm text-gray-600 dark:text-gray-400">To</th>
                <th className="text-left py-2 text-sm text-gray-600 dark:text-gray-400">BTC.D</th>
              </tr>
            </thead>
            <tbody>
              {phaseTransitions?.data?.slice(0, 5).map((transition, index) => (
                <tr key={index} className="border-b dark:border-gray-700">
                  <td className="py-2 text-sm text-gray-800 dark:text-gray-200">
                    {format(new Date(transition.transition_timestamp), 'MMM d, yyyy')}
                  </td>
                  <td className="py-2">
                    <span className={`text-xs px-2 py-1 rounded ${getPhaseColor(transition.from_phase)}`}>
                      {transition.from_phase.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2">
                    <span className={`text-xs px-2 py-1 rounded ${getPhaseColor(transition.to_phase)}`}>
                      {transition.to_phase.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2 text-sm text-gray-800 dark:text-gray-200">
                    {transition.btc_dominance_at_transition?.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Altcoin Market Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          Altcoin Market Overview
        </h2>
        {altcoinData?.data && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Alt Market Cap</div>
                <div className="text-lg font-semibold text-gray-800 dark:text-white">
                  ${(altcoinData.data.total_alt_market_cap / 1e9).toFixed(1)}B
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg 24h Change</div>
                <div className={`text-lg font-semibold ${
                  altcoinData.data.avg_24h_change > 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {altcoinData.data.avg_24h_change > 0 ? '+' : ''}
                  {altcoinData.data.avg_24h_change.toFixed(2)}%
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Top Performers (7d)
              </h3>
              <div className="space-y-1">
                {altcoinData.data.top_performers?.slice(0, 5).map((coin, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {coin.symbol.toUpperCase()} - {coin.name}
                    </span>
                    <span className={`text-sm font-semibold ${
                      coin.price_change_7d > 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {coin.price_change_7d > 0 ? '+' : ''}
                      {coin.price_change_7d.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Candle Patterns */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 lg:col-span-2">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          Technical Patterns
        </h2>
        {candlePatterns?.data && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                ETH/BTC Pattern
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Trend</span>
                  <span className={`font-semibold capitalize ${
                    candlePatterns.data.eth_btc.trend === 'bullish' 
                      ? 'text-green-600 dark:text-green-400' 
                      : candlePatterns.data.eth_btc.trend === 'bearish'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {candlePatterns.data.eth_btc.trend}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Consecutive Candles</span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {candlePatterns.data.eth_btc.consecutive_candles} {candlePatterns.data.eth_btc.latest_color}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Signal Strength</span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {candlePatterns.data.eth_btc.signal}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                BTC/USD Pattern
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Trend</span>
                  <span className={`font-semibold capitalize ${
                    candlePatterns.data.btc_usd.trend === 'bullish' 
                      ? 'text-green-600 dark:text-green-400' 
                      : candlePatterns.data.btc_usd.trend === 'bearish'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {candlePatterns.data.btc_usd.trend}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Consecutive Candles</span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {candlePatterns.data.btc_usd.consecutive_candles} {candlePatterns.data.btc_usd.latest_color}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;