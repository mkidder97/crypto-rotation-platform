import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  AlertTriangle,
  Info,
  RefreshCw,
  Eye,
  Zap
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  RadialBarChart,
  RadialBar
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn, formatCurrency, getRiskColor } from '@/lib/utils'

interface MarketData {
  btc_price?: number
  eth_price?: number
  total3_market_cap?: number
}

interface RiskData {
  data?: {
    riskScore: number
    zone: string
    interpretation: string
  }
}

const CryptoTradingDashboard: React.FC = () => {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('TOTAL')
  const [selectedTimeframe, setSelectedTimeframe] = useState('1Y')

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch real market data with modern React Query
  const { data: marketData, isLoading: marketLoading } = useQuery({
    queryKey: ['marketData'],
    queryFn: () => fetch('/api/metrics/current').then(res => res.json()),
    refetchInterval: 15000,
    enabled: mounted,
  })

  const { data: riskData } = useQuery({
    queryKey: ['riskIndicator'],
    queryFn: () => fetch('/api/cowen/risk-indicator').then(res => res.json()),
    refetchInterval: 20000,
    enabled: mounted,
  })

  const { data: btcDominance } = useQuery({
    queryKey: ['btcDominance'],
    queryFn: () => fetch('/api/cowen/btc-dominance').then(res => res.json()),
    refetchInterval: 25000,
    enabled: mounted,
  })

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-crypto-accent/20 flex items-center justify-center animate-spin">
            <RefreshCw className="w-6 h-6 text-crypto-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Loading Advanced Analytics</h3>
            <p className="text-sm text-muted-foreground">Preparing Benjamin Cowen style dashboard</p>
          </div>
        </div>
      </div>
    )
  }

  const tabs = ['TOTAL', 'BTC', 'ETH', 'ALTCOINS']
  const timeframes = ['1D', '1W', '1M', '3M', '1Y', 'ALL']

  // Enhanced mock data with trend analysis
  const chartData = [
    { date: '2021', btc: 15000, eth: 800, total: 0.6, resistance: 20000, support: 14000 },
    { date: '2022', btc: 20000, eth: 1200, total: 0.8, resistance: 28000, support: 18000 },
    { date: '2023', btc: 30000, eth: 1800, total: 1.2, resistance: 38000, support: 28000 },
    { date: '2024', btc: 45000, eth: 2500, total: 1.8, resistance: 52000, support: 42000 },
    { date: '2025', btc: 42000, eth: 2200, total: 1.6, resistance: 50000, support: 40000 },
  ]

  const cryptoAssets = [
    { symbol: 'BTC', name: 'Bitcoin', price: marketData?.data?.btc_price || 45234, change: 2.1, color: 'hsl(var(--phase-btc))', marketCap: '850B', dominance: '59.5%' },
    { symbol: 'ETH', name: 'Ethereum', price: marketData?.data?.eth_price || 2876, change: -1.2, color: 'hsl(var(--phase-eth))', marketCap: '350B', dominance: '18.2%' },
    { symbol: 'ADA', name: 'Cardano', price: 0.58, change: 4.7, color: '#0033AD', marketCap: '20B', dominance: '1.2%' },
    { symbol: 'SOL', name: 'Solana', price: 102.34, change: 8.9, color: '#9945FF', marketCap: '45B', dominance: '2.8%' },
  ]

  const RiskGauge: React.FC<{ title: string; value: number; trend?: number; subtitle?: string }> = ({ 
    title, 
    value, 
    trend, 
    subtitle 
  }) => {
    const riskColor = getRiskColor(value)
    
    return (
      <Card variant="glass" className="p-6">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              {subtitle && <CardDescription>{subtitle}</CardDescription>}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Benjamin Cowen's risk indicator uses logarithmic regression and market cycle analysis
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="relative mb-6">
            <ResponsiveContainer width="100%" height={160}>
              <RadialBarChart
                cx="50%"
                cy="85%"
                innerRadius="60%"
                outerRadius="90%"
                startAngle={180}
                endAngle={0}
                data={[{ value: value * 100 }]}
              >
                <RadialBar
                  dataKey="value"
                  cornerRadius={10}
                  fill={riskColor}
                  stroke="none"
                />
              </RadialBarChart>
            </ResponsiveContainer>
            
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
              <div className="text-2xl font-bold text-foreground mb-1">
                {value.toFixed(2)}
              </div>
              {trend !== undefined && (
                <div className="flex items-center justify-center gap-1 text-sm">
                  <span className="text-muted-foreground">Trend:</span>
                  <span className={cn(
                    "flex items-center gap-1",
                    trend > 0 ? "text-crypto-success" : trend < 0 ? "text-crypto-danger" : "text-muted-foreground"
                  )}>
                    {trend > 0 ? <TrendingUp className="h-3 w-3" /> : trend < 0 ? <TrendingDown className="h-3 w-3" /> : <Activity className="h-3 w-3" />}
                    {Math.abs(trend).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Zone: </span>
            <span className="font-semibold" style={{ color: riskColor }}>
              {value <= 0.3 ? 'Low Risk' : value <= 0.6 ? 'Medium Risk' : 'High Risk'}
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-4 w-full sm:w-auto">
            {tabs.map((tab) => (
              <TabsTrigger key={tab} value={tab} className="text-xs sm:text-sm">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-1 overflow-x-auto">
          {timeframes.map((tf) => (
            <Button
              key={tf}
              variant={selectedTimeframe === tf ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedTimeframe(tf)}
              className="text-xs whitespace-nowrap"
            >
              {tf}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column - Risk Indicators & Charts */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Risk Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RiskGauge
              title="Crypto Risk Indicators"
              value={riskData?.data?.riskScore || 0.64}
              trend={4.16}
              subtitle="Market risk assessment"
            />
            
            <RiskGauge
              title="Macro Recession Risk"
              value={0.015}
              trend={0}
              subtitle="Economic indicators"
            />
          </div>

          {/* Main Chart */}
          <Card variant="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {activeTab}: {formatCurrency(activeTab === 'BTC' ? (marketData?.data?.btc_price || 45234) : activeTab === 'ETH' ? (marketData?.data?.eth_price || 2876) : 48110)}
                  </CardTitle>
                  <CardDescription>
                    Price analysis with support/resistance levels
                  </CardDescription>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Advanced technical analysis with trend channels and key levels
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--crypto-accent))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--crypto-accent))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                  />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--card-foreground))'
                    }} 
                  />
                  
                  {/* Support/Resistance Lines */}
                  <Line
                    type="monotone"
                    dataKey="resistance"
                    stroke="hsl(var(--crypto-danger))"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    dot={false}
                    name="Resistance"
                  />
                  <Line
                    type="monotone"
                    dataKey="support"
                    stroke="hsl(var(--crypto-success))"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    dot={false}
                    name="Support"
                  />
                  
                  {/* Main Price Line */}
                  <Line
                    type="monotone"
                    dataKey={activeTab === 'ETH' ? 'eth' : activeTab === 'ALTCOINS' ? 'total' : 'btc'}
                    stroke="hsl(var(--crypto-accent))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--crypto-accent))', strokeWidth: 2, r: 4 }}
                    fill="url(#priceGradient)"
                    name={`${activeTab} Price`}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* BTC Dominance Chart */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>
                BTC Dominance: {btcDominance?.data?.currentDominance?.toFixed(1) || '59.5'}%
              </CardTitle>
              <CardDescription>
                Market dominance analysis for altseason timing
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                  />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--card-foreground))'
                    }} 
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--crypto-accent))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--crypto-accent))', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Asset List & Status */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Crypto Assets */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Top Assets</CardTitle>
              <CardDescription>Market leaders by dominance</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {cryptoAssets.map((crypto, index) => (
                <motion.div
                  key={crypto.symbol}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: crypto.color }}
                    >
                      {crypto.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{crypto.symbol}</div>
                      <div className="text-xs text-muted-foreground">{crypto.name}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold text-foreground">
                      {formatCurrency(crypto.price)}
                    </div>
                    <div className={cn(
                      "text-xs",
                      crypto.change > 0 ? "text-crypto-success" : "text-crypto-danger"
                    )}>
                      {crypto.change > 0 ? '+' : ''}{crypto.change}%
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Market Status */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Market Status</CardTitle>
              <CardDescription>Current market conditions</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-crypto-success/10 rounded-lg border border-crypto-success/20">
                <span className="font-medium text-crypto-success">Market Trend</span>
                <span className="text-foreground">Bullish</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-crypto-warning/10 rounded-lg border border-crypto-warning/20">
                <span className="font-medium text-crypto-warning">Risk Level</span>
                <span className="text-foreground">Moderate</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-crypto-accent/10 rounded-lg border border-crypto-accent/20">
                <span className="font-medium text-crypto-accent">Phase</span>
                <span className="text-foreground">{btcDominance?.data?.cyclePhase || 'Accumulation'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CryptoTradingDashboard