import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { allocationAPI, marketAPI } from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend);

const AllocationChart = () => {
  const [portfolioValue, setPortfolioValue] = useState(100000);
  const { data, isLoading, error } = useQuery(
    'recommendedAllocation',
    allocationAPI.getRecommendedAllocation
  );
  const { data: metricsData } = useQuery('currentMetrics', marketAPI.getCurrentMetrics);

  const getPhaseBasedAllocation = (phase) => {
    switch (phase) {
      case 'BTC_HEAVY':
        return { btc: 80, eth: 15, alt: 5, cash: 0 };
      case 'ETH_ROTATION':
        return { btc: 25, eth: 65, alt: 10, cash: 0 };
      case 'ALT_SEASON':
        return { btc: 15, eth: 25, alt: 60, cash: 0 };
      case 'CASH_HEAVY':
        return { btc: 30, eth: 20, alt: 0, cash: 50 };
      default:
        return { btc: 60, eth: 30, alt: 10, cash: 0 };
    }
  };

  const calculateDollarAmounts = (allocation, totalValue) => {
    return {
      btc: (allocation.btc / 100) * totalValue,
      eth: (allocation.eth / 100) * totalValue,
      alt: (allocation.alt / 100) * totalValue,
      cash: (allocation.cash / 100) * totalValue
    };
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          Portfolio Allocation
        </h2>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Use fallback allocation based on current phase
  const currentPhase = data?.data?.phase || 'BTC_HEAVY';
  const fallbackAllocation = getPhaseBasedAllocation(currentPhase);
  const allocation = data?.data?.allocations || fallbackAllocation;
  const dollarAmounts = calculateDollarAmounts(allocation, portfolioValue);

  const chartData = {
    labels: ['Bitcoin', 'Ethereum', 'Altcoins', 'Cash/Stables'],
    datasets: [
      {
        data: [
          allocation.btc || 0,
          allocation.eth || 0,
          allocation.alt || 0,
          allocation.cash || 0,
        ],
        backgroundColor: [
          'rgba(247, 147, 26, 0.9)',   // Bitcoin orange
          'rgba(131, 95, 255, 0.9)',   // Ethereum purple
          'rgba(34, 197, 94, 0.9)',    // Altcoins green
          'rgba(239, 68, 68, 0.9)',    // Cash red
        ],
        borderColor: [
          'rgba(247, 147, 26, 1)',
          'rgba(131, 95, 255, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const percentage = context.parsed;
            const dollarValue = (percentage / 100) * portfolioValue;
            return `${context.label}: ${percentage}% ($${dollarValue.toLocaleString()})`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          Portfolio Allocation
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {currentPhase.replace('_', ' ')} Phase
        </div>
      </div>
      
      {/* Portfolio Value Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Portfolio Value ($)
        </label>
        <input
          type="number"
          value={portfolioValue}
          onChange={(e) => setPortfolioValue(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          min="1000"
          step="1000"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="h-48">
          <Doughnut data={chartData} options={options} />
        </div>
        
        {/* Allocation Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <span className="font-medium text-gray-800 dark:text-white">Bitcoin</span>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-800 dark:text-white">{allocation.btc}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                ${dollarAmounts.btc.toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
              <span className="font-medium text-gray-800 dark:text-white">Ethereum</span>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-800 dark:text-white">{allocation.eth}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                ${dollarAmounts.eth.toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="font-medium text-gray-800 dark:text-white">Altcoins</span>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-800 dark:text-white">{allocation.alt}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                ${dollarAmounts.alt.toLocaleString()}
              </div>
            </div>
          </div>
          
          {allocation.cash > 0 && (
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="font-medium text-gray-800 dark:text-white">Cash/Stables</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-800 dark:text-white">{allocation.cash}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  ${dollarAmounts.cash.toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Rebalancing Alert */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">💡</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
              Rebalancing Recommendation
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {currentPhase === 'BTC_HEAVY' && 'Focus on Bitcoin accumulation while monitoring ETH/BTC ratio for rotation signals.'}
              {currentPhase === 'ETH_ROTATION' && 'Shift from BTC to ETH. Begin researching quality altcoins for potential rotation.'}
              {currentPhase === 'ALT_SEASON' && 'Maximize altcoin exposure while maintaining stop-losses. Consider profit-taking targets.'}
              {currentPhase === 'CASH_HEAVY' && 'Preserve capital in stablecoins. Wait for clear re-entry signals before deploying cash.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllocationChart;