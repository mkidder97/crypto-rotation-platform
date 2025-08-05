import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  DollarSign,
  Percent,
  Building2,
  Users,
  BarChart3
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip
} from 'recharts';

const MacroIndicators = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mock macro data - replace with real API calls
  const macroData = {
    unemployment: { value: 3.7, trend: -0.1, data: [] },
    inflation: { value: 3.2, trend: -0.5, data: [] },
    gdp: { value: 2.1, trend: 0.3, data: [] },
    fedFunds: { value: 5.25, trend: 0, data: [] }
  };

  const indicators = [
    {
      title: 'Unemployment Rate',
      value: macroData.unemployment.value,
      trend: macroData.unemployment.trend,
      unit: '%',
      icon: Users,
      color: '#10B981',
      description: 'U.S. unemployment rate'
    },
    {
      title: 'Inflation',
      value: macroData.inflation.value,
      trend: macroData.inflation.trend,
      unit: '%',
      icon: TrendingUp,
      color: '#F59E0B',
      description: 'Consumer Price Index'
    },
    {
      title: 'GDP Growth',
      value: macroData.gdp.value,
      trend: macroData.gdp.trend,
      unit: '%',
      icon: BarChart3,
      color: '#3B82F6',
      description: 'Quarterly GDP growth'
    },
    {
      title: 'Fed Funds Rate',
      value: macroData.fedFunds.value,
      trend: macroData.fedFunds.trend,
      unit: '%',
      icon: Building2,
      color: '#8B5CF6',
      description: 'Federal interest rate'
    }
  ];

  if (!mounted) return null;

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-semibold text-lg">Macro Economic Indicators</h3>
          <p className="text-gray-400 text-sm">Key economic metrics affecting crypto markets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {indicators.map((indicator, index) => {
          const Icon = indicator.icon;
          const isPositive = indicator.trend > 0;
          const isNegative = indicator.trend < 0;

          return (
            <motion.div
              key={indicator.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${indicator.color}20` }}
                >
                  <Icon size={16} style={{ color: indicator.color }} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {isPositive ? <TrendingUp size={12} /> : isNegative ? <TrendingDown size={12} /> : <Activity size={12} />}
                  {Math.abs(indicator.trend).toFixed(1)}%
                </div>
              </div>

              <div className="mb-2">
                <div className="text-2xl font-bold text-white mb-1">
                  {indicator.value}{indicator.unit}
                </div>
                <div className="text-xs text-gray-400">
                  {indicator.description}
                </div>
              </div>

              <div className="text-xs font-medium text-gray-300">
                {indicator.title}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Membership Notice */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
        <div className="text-center">
          <p className="text-gray-300 text-sm mb-2">
            Please, update your membership to access this information.
          </p>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
            More info about plans
          </button>
        </div>
      </div>
    </div>
  );
};

export default MacroIndicators;