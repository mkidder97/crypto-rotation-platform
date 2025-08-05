import React from 'react';
import { useQuery } from 'react-query';
import { marketAPI } from '../services/api';

const MetricsPanel = () => {
  const { data, isLoading, error } = useQuery('currentMetrics', marketAPI.getCurrentMetrics);

  const formatNumber = (num, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600 dark:text-green-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Market Metrics</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Market Metrics</h2>
        <div className="text-red-600 dark:text-red-400">
          Error loading metrics: {error.message}
        </div>
      </div>
    );
  }

  const metrics = data?.data;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Market Metrics</h2>
      
      <div className="space-y-4">
        <div className="border-b dark:border-gray-700 pb-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">BTC Dominance</div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {formatNumber(metrics?.btc_dominance)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500">
            Threshold: 68%
          </div>
        </div>

        <div className="border-b dark:border-gray-700 pb-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">ETH/BTC Ratio</div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {formatNumber(metrics?.eth_btc_ratio, 4)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500">
            Bounce Zone: 0.050-0.053
          </div>
        </div>

        <div className="border-b dark:border-gray-700 pb-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">TOTAL3/ETH Ratio</div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {formatNumber(metrics?.total3_eth_ratio, 3)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500">
            Alt strength indicator
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">BTC Price</div>
            <div className="text-lg font-bold text-gray-800 dark:text-white">
              {formatCurrency(metrics?.btc_price)}
            </div>
            <div className={`text-sm ${getChangeColor(metrics?.btc_24h_change)}`}>
              {metrics?.btc_24h_change > 0 ? '+' : ''}{formatNumber(metrics?.btc_24h_change)}%
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">ETH Price</div>
            <div className="text-lg font-bold text-gray-800 dark:text-white">
              {formatCurrency(metrics?.eth_price)}
            </div>
            <div className={`text-sm ${getChangeColor(metrics?.eth_24h_change)}`}>
              {metrics?.eth_24h_change > 0 ? '+' : ''}{formatNumber(metrics?.eth_24h_change)}%
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Market Cap</div>
          <div className="text-lg font-bold text-gray-800 dark:text-white">
            ${formatNumber(metrics?.total_market_cap / 1e9, 0)}B
          </div>
        </div>

        {metrics?.eth_btc_trend && (
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              ETH/BTC Trend
            </div>
            <div className="text-lg capitalize text-gray-800 dark:text-white">
              {metrics.eth_btc_trend}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {metrics.eth_btc_consecutive_candles} consecutive candles
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricsPanel;