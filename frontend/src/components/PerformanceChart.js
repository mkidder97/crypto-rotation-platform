import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { format, subDays } from 'date-fns';
import { performanceAPI } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PerformanceChart = () => {
  const [timeRange, setTimeRange] = useState(30); // Default 30 days
  
  const endDate = new Date();
  const startDate = subDays(endDate, timeRange);
  
  const { data, isLoading, error } = useQuery(
    ['performance', timeRange],
    () => performanceAPI.getPerformanceMetrics(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    )
  );

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          Portfolio Performance
        </h2>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          Portfolio Performance
        </h2>
        <div className="text-red-600 dark:text-red-400">
          Error loading performance data: {error.message}
        </div>
      </div>
    );
  }

  const performanceData = data?.data || [];
  
  // Generate sample data if no real data exists
  const chartData = {
    labels: performanceData.length > 0 
      ? performanceData.map(d => format(new Date(d.date), 'MMM d'))
      : Array.from({ length: timeRange }, (_, i) => 
          format(subDays(endDate, timeRange - i - 1), 'MMM d')
        ),
    datasets: [
      {
        label: 'Portfolio Value',
        data: performanceData.length > 0
          ? performanceData.map(d => d.portfolio_value || 100000)
          : Array.from({ length: timeRange }, (_, i) => 
              100000 + Math.random() * 20000 - 10000
            ),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Benchmark (BTC)',
        data: performanceData.length > 0
          ? performanceData.map(d => d.benchmark_return ? 100000 * (1 + d.benchmark_return / 100) : 100000)
          : Array.from({ length: timeRange }, (_, i) => 
              100000 + Math.random() * 15000 - 7500
            ),
        borderColor: 'rgb(247, 147, 26)',
        backgroundColor: 'rgba(247, 147, 26, 0.1)',
        fill: false,
        borderDash: [5, 5],
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: document.body.classList.contains('dark') ? '#e5e7eb' : '#374151',
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: document.body.classList.contains('dark') ? '#374151' : '#e5e7eb',
        },
        ticks: {
          color: document.body.classList.contains('dark') ? '#9ca3af' : '#6b7280',
        },
      },
      y: {
        grid: {
          color: document.body.classList.contains('dark') ? '#374151' : '#e5e7eb',
        },
        ticks: {
          color: document.body.classList.contains('dark') ? '#9ca3af' : '#6b7280',
          callback: function(value) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value);
          },
        },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          Portfolio Performance
        </h2>
        <div className="flex space-x-2">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setTimeRange(days)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                timeRange === days
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {days}D
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
      
      {performanceData.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Return</div>
            <div className="text-lg font-semibold text-gray-800 dark:text-white">
              +{((performanceData[performanceData.length - 1]?.cumulative_return || 0) * 100).toFixed(2)}%
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Daily Return</div>
            <div className="text-lg font-semibold text-gray-800 dark:text-white">
              {((performanceData[performanceData.length - 1]?.daily_return || 0) * 100).toFixed(2)}%
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Current Phase</div>
            <div className="text-lg font-semibold text-gray-800 dark:text-white">
              {performanceData[performanceData.length - 1]?.phase?.replace('_', ' ') || 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Portfolio Value</div>
            <div className="text-lg font-semibold text-gray-800 dark:text-white">
              ${(performanceData[performanceData.length - 1]?.portfolio_value || 0).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceChart;