import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'react-query';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ReferenceArea,
  ComposedChart,
  Bar,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  BarChart3, 
  Activity, 
  Zap,
  Target,
  Eye,
  Info,
  Play,
  ChevronDown
} from 'lucide-react';

const AdvancedCryptoverseCharts = () => {
  const [mounted, setMounted] = useState(false);
  const [selectedChart, setSelectedChart] = useState('rainbow');
  const [timeRange, setTimeRange] = useState('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Enhanced historical data with logarithmic regression bands
  const generateRainbowData = () => {
    const startDate = new Date('2010-01-01');
    const endDate = new Date('2024-12-31');
    const data = [];
    
    for (let year = 2010; year <= 2024; year++) {
      const daysSinceGenesis = (year - 2010) * 365 + Math.random() * 365;
      const basePrice = Math.pow(10, (Math.log10(daysSinceGenesis) * 2.5 - 3));
      
      // Logarithmic regression bands (rainbow colors)
      const redBand = basePrice * 100;
      const orangeBand = basePrice * 50;
      const yellowBand = basePrice * 25;
      const greenBand = basePrice * 12.5;
      const blueBand = basePrice * 6.25;
      const violetBand = basePrice * 3.125;
      
      // Actual BTC price with realistic volatility
      const priceMultiplier = year <= 2017 ? Math.random() * 50 + 10 :
                             year <= 2021 ? Math.random() * 30 + 20 :
                             Math.random() * 15 + 15;
      const btcPrice = basePrice * priceMultiplier;

      data.push({
        year: year.toString(),
        date: `${year}`,
        btcPrice: btcPrice,
        redBand: redBand,
        orangeBand: orangeBand,
        yellowBand: yellowBand,
        greenBand: greenBand,
        blueBand: blueBand,
        violetBand: violetBand,
        logPrice: Math.log10(btcPrice),
        marketCap: btcPrice * 19000000, // Approximate circulating supply
        realizedCap: btcPrice * 0.6 * 19000000,
        mvrv: btcPrice / (btcPrice * 0.6)
      });
    }
    
    return data;
  };

  // Pi Cycle Top data with moving averages
  const generatePiCycleData = () => {
    const data = generateRainbowData();
    return data.map((item, index) => {
      // 111-day moving average
      const ma111 = index >= 5 ? 
        data.slice(Math.max(0, index - 5), index + 1)
             .reduce((sum, d) => sum + d.btcPrice, 0) / Math.min(6, index + 1) : item.btcPrice;
      
      // 350-day moving average * 2
      const ma350x2 = index >= 10 ? 
        data.slice(Math.max(0, index - 10), index + 1)
             .reduce((sum, d) => sum + d.btcPrice, 0) / Math.min(11, index + 1) * 2 : item.btcPrice * 2;
      
      // Pi Cycle Top signal (when 111 DMA crosses above 350 DMA * 2)
      const piSignal = ma111 > ma350x2 ? item.btcPrice * 1.1 : null;
      
      return {
        ...item,
        ma111: ma111,
        ma350x2: ma350x2,
        piSignal: piSignal
      };
    });
  };

  // MVRV data
  const generateMVRVData = () => {
    const data = generateRainbowData();
    return data.map(item => ({
      ...item,
      mvrv: item.marketCap / item.realizedCap,
      mvrvBands: {
        high: 4,
        medium: 2.5,
        low: 1,
        bottom: 0.8
      }
    }));
  };

  const chartConfigs = {
    rainbow: {
      title: 'Bitcoin Logarithmic Regression Rainbow',
      description: 'The Cowen Corridor consists of upper and lower bands based on 20-week moving averages',
      data: generateRainbowData(),
      yScale: 'log'
    },
    piCycle: {
      title: 'Pi Cycle Top Indicator',
      description: 'Predicts Bitcoin tops when 111 DMA crosses above 350 DMA × 2',
      data: generatePiCycleData(),
      yScale: 'log'
    },
    mvrv: {
      title: 'Market Value to Realized Value (MVRV)',
      description: 'Ratio between market cap and realized cap to assess market profitability',
      data: generateMVRVData(),
      yScale: 'linear'
    }
  };

  const chartData = chartConfigs[selectedChart]?.data || [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl p-4 shadow-2xl">
          <p className="text-white font-semibold mb-2">{label}</p>
          {payload.slice(0, 3).map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-1">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-300 text-sm">{entry.name}</span>
              </div>
              <span className="text-white font-medium">
                {entry.name?.includes('Price') || entry.name?.includes('Cap') ? 
                  `$${Number(entry.value).toLocaleString()}` : 
                  Number(entry.value).toFixed(2)
                }
              </span>
            </div>
          ))}
          {selectedChart === 'mvrv' && payload[0] && (
            <div className="mt-2 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-blue-400 text-xs">
                MVRV: {(payload[0].payload.mvrv || 1).toFixed(2)}
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const ChartSelector = () => (
    <div className="flex flex-wrap gap-3 mb-6">
      {Object.entries(chartConfigs).map(([key, config]) => (
        <button
          key={key}
          onClick={() => setSelectedChart(key)}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            selectedChart === key
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          {config.title.split(' ')[0]} {/* Show first word only for buttons */}
        </button>
      ))}
    </div>
  );

  const renderChart = () => {
    const config = chartConfigs[selectedChart];
    if (!config) return null;

    switch (selectedChart) {
      case 'rainbow':
        return (
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="year" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 12 }} 
              />
              <YAxis 
                scale="log" 
                domain={['dataMin', 'dataMax']}
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              
              {/* Rainbow Bands */}
              <Line type="monotone" dataKey="redBand" stroke="#EF4444" strokeWidth={2} dot={false} name="Upper Band" />
              <Line type="monotone" dataKey="orangeBand" stroke="#F97316" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
              <Line type="monotone" dataKey="yellowBand" stroke="#EAB308" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
              <Line type="monotone" dataKey="greenBand" stroke="#22C55E" strokeWidth={2} dot={false} name="Lower Band" />
              <Line type="monotone" dataKey="blueBand" stroke="#3B82F6" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
              <Line type="monotone" dataKey="violetBand" stroke="#8B5CF6" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
              
              {/* BTC Price */}
              <Line 
                type="monotone" 
                dataKey="btcPrice" 
                stroke="#FFFFFF" 
                strokeWidth={3} 
                dot={{ fill: '#FFFFFF', strokeWidth: 2, r: 3 }}
                name="BTC Price"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'piCycle':
        return (
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="year" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 12 }} 
              />
              <YAxis 
                scale="log" 
                domain={['dataMin', 'dataMax']}
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              
              {/* Moving Averages */}
              <Line 
                type="monotone" 
                dataKey="ma111" 
                stroke="#EF4444" 
                strokeWidth={2} 
                dot={false} 
                name="111D SMA"
                strokeDasharray="8 4"
              />
              <Line 
                type="monotone" 
                dataKey="ma350x2" 
                stroke="#22C55E" 
                strokeWidth={2} 
                dot={false} 
                name="350D SMA × 2"
                strokeDasharray="8 4"
              />
              
              {/* Pi Cycle Top Signals */}
              <Line 
                type="monotone" 
                dataKey="piSignal" 
                stroke="#FBBF24" 
                strokeWidth={4} 
                dot={{ fill: '#FBBF24', strokeWidth: 2, r: 6 }}
                name="Pi Cycle Top Signal"
                connectNulls={false}
              />
              
              {/* BTC Price */}
              <Line 
                type="monotone" 
                dataKey="btcPrice" 
                stroke="#3B82F6" 
                strokeWidth={3} 
                dot={false}
                name="BTC Price"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'mvrv':
        return (
          <ResponsiveContainer width="100%" height={500}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="year" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 12 }} 
              />
              <YAxis 
                yAxisId="left"
                scale="log"
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickFormatter={(value) => `$${(value/1e9).toFixed(0)}B`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                domain={[0, 5]}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              
              {/* Market Cap and Realized Cap */}
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="marketCap" 
                stroke="#3B82F6" 
                strokeWidth={3} 
                dot={false}
                name="BTC Market Cap"
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="realizedCap" 
                stroke="#F97316" 
                strokeWidth={2} 
                dot={false}
                name="BTC Realized Cap"
              />
              
              {/* MVRV Ratio */}
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="mvrv" 
                stroke="#EF4444" 
                strokeWidth={3} 
                dot={false}
                name="MVRV"
              />
              
              {/* MVRV Reference Lines */}
              <ReferenceLine yAxisId="right" y={4} stroke="#EF4444" strokeDasharray="5 5" label="High" />
              <ReferenceLine yAxisId="right" y={2.5} stroke="#F59E0B" strokeDasharray="5 5" label="Medium" />
              <ReferenceLine yAxisId="right" y={1} stroke="#22C55E" strokeDasharray="5 5" label="Fair Value" />
            </ComposedChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  if (!mounted) return null;

  const currentConfig = chartConfigs[selectedChart];

  return (
    <div className="space-y-6">
      {/* Chart Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {currentConfig?.title}
          </h2>
          <p className="text-gray-400 text-sm max-w-2xl">
            {currentConfig?.description}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors">
            <Play size={16} />
          </button>
          <button className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors">
            <Info size={16} />
          </button>
        </div>
      </div>

      {/* Chart Selector */}
      <ChartSelector />

      {/* Main Chart */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
        {renderChart()}
      </div>

      {/* Watch Video Section */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-blue-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Play size={20} className="text-blue-400" />
              Watch Video
            </h3>
            <p className="text-gray-400 text-sm">
              Learn more about {currentConfig?.title.toLowerCase()} and Benjamin Cowen's analysis methodology
            </p>
          </div>
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
            Watch Now
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50">
        <h3 className="text-lg font-semibold text-white mb-4">Description</h3>
        <div className="text-gray-300 text-sm leading-relaxed space-y-4">
          {selectedChart === 'rainbow' && (
            <>
              <p>
                The Cowen Corridor consists of one upper band and one lower band, both being a function of the 20 week moving average. 
                The upper band is calculated by ((20WMA ÷ 16 × Pi^2) / sqrt(days)). The lower band is given by ((20WMA × sqrt(days) / 100)).
              </p>
              <p>
                "sqrt" stands for the square root, "Pi" equals 3.1415... and "days" is the time in days since the first Bitcoin Liquid Index 
                date: "2010-07-18".
              </p>
            </>
          )}
          
          {selectedChart === 'piCycle' && (
            <p>
              The Pi Cycle Top indicator was created by Philip Swift back in 2019 to predict Bitcoin's top within three days. It has gained 
              great popularity when it also predicted Bitcoin's local top within three days back in April 2021. The indicator signals a top 
              whenever the 111 DMA crosses above the 350 DMA × 2, these crossovers are shown as white dotted lines in the chart. The 
              name "Pi Cycle Top" comes from the fact that the fraction 350/111 is as close as one can get to Pi (3.1415...) when dividing 
              the integer 350 by another integer.
            </p>
          )}
          
          {selectedChart === 'mvrv' && (
            <p>
              The Market Value to Realized Value (MVRV) is the ratio between the market cap (asset price × supply) and the realized cap 
              (cost basis × supply). The realized cap values each coin based on the price it was last moved on-chain instead of its current 
              value. For example, The realized price today of 1 BTC that was last transferred on Jan 1, 2017 is $997.26. In this way it also 
              accounts for lost and dormant supply (roughly 15% of BTC). The ratio gives a sense of when the price is above or below its 
              fair value and can be used to assess market profitability.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedCryptoverseCharts;