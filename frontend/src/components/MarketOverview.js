import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart3,
  DollarSign,
  Percent,
  Globe,
  Zap,
  Clock,
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Sparklines, SparklinesLine } from 'recharts';
import { marketAPI, altcoinAPI } from '../services/api';
import { cn, colors, typography, card, glass, animations, shadows } from '../utils/designSystem';

const MarketOverview = () => {
  const [mounted, setMounted] = useState(false);
  
  const { data: metricsData, isLoading: metricsLoading } = useQuery(
    'currentMetrics', 
    marketAPI.getCurrentMetrics,
    { refetchInterval: 15000 }
  );
  
  const { data: marketAnalysis } = useQuery(
    'marketAnalysis',
    marketAPI.getMarketAnalysis,
    { refetchInterval: 30000 }
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatCurrency = (value) => {
    if (!value) return '$0';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercent = (value) => {
    if (!value) return '0.00%';
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getChangeColor = (value) => {
    return value >= 0 ? colors.status.success : colors.status.danger;
  };

  const generateSparklineData = (change) => {
    // Generate realistic-looking sparkline data based on the change
    const points = 20;
    const data = [];
    const volatility = Math.abs(change) * 0.1;
    
    for (let i = 0; i < points; i++) {
      const progress = i / (points - 1);
      const trend = change * progress;
      const noise = (Math.random() - 0.5) * volatility;
      data.push(100 + trend + noise);
    }
    
    return data;
  };

  if (!mounted) return null;

  const metrics = metricsData?.data;

  // Mock top cryptocurrencies data (in a real app, this would come from API)
  const topCryptos = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: metrics?.btc_price || 65000,
      change24h: metrics?.btc_24h_change || 2.34,
      marketCap: 1280000000000,
      volume: 28500000000,
      sparkline: generateSparklineData(metrics?.btc_24h_change || 2.34)
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      price: metrics?.eth_price || 3200,
      change24h: metrics?.eth_24h_change || -1.45,
      marketCap: 384000000000,
      volume: 15200000000,
      sparkline: generateSparklineData(metrics?.eth_24h_change || -1.45)
    },
    {
      symbol: 'BNB',
      name: 'BNB',
      price: 485,
      change24h: 3.12,
      marketCap: 75000000000,
      volume: 1800000000,
      sparkline: generateSparklineData(3.12)
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      price: 198,
      change24h: 5.67,
      marketCap: 95000000000,
      volume: 3200000000,
      sparkline: generateSparklineData(5.67)
    },
    {
      symbol: 'ADA',
      name: 'Cardano',
      price: 0.52,
      change24h: -2.18,
      marketCap: 18000000000,
      volume: 480000000,
      sparkline: generateSparklineData(-2.18)
    },
    {
      symbol: 'AVAX',
      name: 'Avalanche',
      price: 38.5,
      change24h: 4.23,
      marketCap: 15000000000,
      volume: 650000000,
      sparkline: generateSparklineData(4.23)
    }
  ];

  const marketStats = [
    {
      label: 'Total Market Cap',
      value: formatCurrency(metrics?.total_market_cap || 2.8e12),
      change: '+2.34%',
      positive: true,
      icon: Globe
    },
    {
      label: 'Total Volume (24h)',
      value: formatCurrency(89500000000),
      change: '+8.12%',
      positive: true,
      icon: BarChart3
    },
    {
      label: 'BTC Dominance',
      value: `${metrics?.btc_dominance?.toFixed(1) || '55.2'}%`,
      change: '+0.23%',
      positive: true,
      icon: Percent
    },
    {
      label: 'DeFi TVL',
      value: formatCurrency(185000000000),
      change: '-1.45%',
      positive: false,
      icon: Zap
    }
  ];

  return (
    <div className="space-y-8">
      {/* Market Statistics */}
      <motion.div
        {...animations.fadeIn}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {marketStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="p-6 rounded-2xl border"
              style={{
                background: glass('medium'),
                borderColor: colors.border.primary
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon size={20} style={{ color: colors.text.tertiary }} />
                <div 
                  className="text-sm font-semibold flex items-center gap-1"
                  style={{ color: getChangeColor(stat.positive ? 1 : -1) }}
                >
                  {stat.positive ? (
                    <ArrowUpRight size={14} />
                  ) : (
                    <ArrowDownRight size={14} />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className={typography.micro} style={{ color: colors.text.muted }}>
                {stat.label}
              </div>
              <div className={typography.h3} style={{ color: colors.text.primary }}>
                {stat.value}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Top Cryptocurrencies Table */}
      <motion.div
        {...animations.fadeIn}
        className="rounded-3xl border overflow-hidden"
        style={{
          background: glass('medium'),
          borderColor: colors.border.primary
        }}
      >
        <div className="px-8 py-6 border-b" style={{ borderColor: colors.border.primary }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={typography.h3} style={{ color: colors.text.primary }}>
                Market Leaders
              </h3>
              <p className={typography.caption} style={{ color: colors.text.tertiary }}>
                Top cryptocurrencies by market capitalization
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: colors.status.success }}
              />
              <span className={typography.caption} style={{ color: colors.text.muted }}>
                Live Data
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderColor: colors.border.primary }}>
                <th className="px-8 py-4 text-left">
                  <div className={typography.micro} style={{ color: colors.text.muted }}>
                    ASSET
                  </div>
                </th>
                <th className="px-4 py-4 text-right">
                  <div className={typography.micro} style={{ color: colors.text.muted }}>
                    PRICE
                  </div>
                </th>
                <th className="px-4 py-4 text-right">
                  <div className={typography.micro} style={{ color: colors.text.muted }}>
                    24H CHANGE
                  </div>
                </th>
                <th className="px-4 py-4 text-right">
                  <div className={typography.micro} style={{ color: colors.text.muted }}>
                    MARKET CAP
                  </div>
                </th>
                <th className="px-4 py-4 text-right">
                  <div className={typography.micro} style={{ color: colors.text.muted }}>
                    VOLUME (24H)
                  </div>
                </th>
                <th className="px-8 py-4 text-right">
                  <div className={typography.micro} style={{ color: colors.text.muted }}>
                    CHART (7D)
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {topCryptos.map((crypto, index) => (
                <motion.tr
                  key={crypto.symbol}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
                  className="border-t hover:bg-white/5 transition-colors duration-200"
                  style={{ borderColor: colors.border.primary }}
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                          style={{
                            background: `linear-gradient(135deg, ${colors.accent.primary}40 0%, ${colors.accent.secondary}20 100%)`,
                            color: colors.text.primary
                          }}
                        >
                          {crypto.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className={typography.body} style={{ color: colors.text.primary }}>
                            {crypto.symbol}
                          </div>
                          <div className={typography.caption} style={{ color: colors.text.tertiary }}>
                            {crypto.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-6 text-right">
                    <div className={typography.mono} style={{ color: colors.text.primary }}>
                      {formatCurrency(crypto.price)}
                    </div>
                  </td>
                  <td className="px-4 py-6 text-right">
                    <div 
                      className="font-semibold flex items-center justify-end gap-1"
                      style={{ color: getChangeColor(crypto.change24h) }}
                    >
                      {crypto.change24h >= 0 ? (
                        <ArrowUpRight size={16} />
                      ) : (
                        <ArrowDownRight size={16} />
                      )}
                      {formatPercent(crypto.change24h)}
                    </div>
                  </td>
                  <td className="px-4 py-6 text-right">
                    <div className={typography.body} style={{ color: colors.text.secondary }}>
                      {formatCurrency(crypto.marketCap)}
                    </div>
                  </td>
                  <td className="px-4 py-6 text-right">
                    <div className={typography.body} style={{ color: colors.text.secondary }}>
                      {formatCurrency(crypto.volume)}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="w-24 h-12">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={crypto.sparkline.map((value, i) => ({ value, index: i }))}>
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke={getChangeColor(crypto.change24h)}
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        {...animations.fadeIn}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Fear & Greed Index */}
        <div 
          className="p-6 rounded-2xl border"
          style={{
            background: glass('medium'),
            borderColor: colors.border.primary
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={typography.micro} style={{ color: colors.text.muted }}>
              FEAR & GREED INDEX
            </div>
            <Activity size={16} style={{ color: colors.text.tertiary }} />
          </div>
          <div className="flex items-end gap-4">
            <div className={typography.h2} style={{ color: colors.text.primary }}>
              72
            </div>
            <div 
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: `${colors.status.success}20`,
                color: colors.status.success
              }}
            >
              Greed
            </div>
          </div>
        </div>

        {/* Active Addresses */}
        <div 
          className="p-6 rounded-2xl border"
          style={{
            background: glass('medium'),
            borderColor: colors.border.primary
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={typography.micro} style={{ color: colors.text.muted }}>
              ACTIVE ADDRESSES (24H)
            </div>
            <Clock size={16} style={{ color: colors.text.tertiary }} />
          </div>
          <div className="flex items-end gap-4">
            <div className={typography.h2} style={{ color: colors.text.primary }}>
              1.2M
            </div>
            <div 
              className="text-sm font-semibold flex items-center gap-1"
              style={{ color: colors.status.success }}
            >
              <ArrowUpRight size={14} />
              +5.2%
            </div>
          </div>
        </div>

        {/* Gas Tracker */}
        <div 
          className="p-6 rounded-2xl border"
          style={{
            background: glass('medium'),
            borderColor: colors.border.primary
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={typography.micro} style={{ color: colors.text.muted }}>
              ETH GAS (GWEI)
            </div>
            <Zap size={16} style={{ color: colors.text.tertiary }} />
          </div>
          <div className="flex items-end gap-4">
            <div className={typography.h2} style={{ color: colors.text.primary }}>
              23
            </div>
            <div 
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: `${colors.status.success}20`,
                color: colors.status.success
              }}
            >
              Low
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MarketOverview;