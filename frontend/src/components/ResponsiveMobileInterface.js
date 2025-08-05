import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useQuery } from 'react-query';
import { 
  TrendingUp, 
  TrendingDown, 
  Menu,
  X,
  Home,
  BarChart3,
  Target,
  Bell,
  Settings,
  User,
  Search,
  Filter,
  RefreshCw,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Wifi,
  Battery,
  Signal as SignalIcon
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { phaseAPI, marketAPI } from '../services/api';
import { colors, animations, typography, glass } from '../utils/designSystem';

const ResponsiveMobileInterface = ({ isMobile = false }) => {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [cardStack, setCardStack] = useState([]);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'signal', message: 'BTC dominance approaching 68%', time: '2m ago' },
    { id: 2, type: 'phase', message: 'ETH rotation signal detected', time: '5m ago' },
    { id: 3, type: 'alert', message: 'Portfolio rebalancing suggested', time: '10m ago' }
  ]);

  const { data: metricsData, isLoading } = useQuery(
    'currentMetrics', 
    marketAPI.getCurrentMetrics,
    { refetchInterval: 5000 }
  );

  const { data: phaseData } = useQuery(
    'currentPhase', 
    phaseAPI.getCurrentPhase,
    { refetchInterval: 10000 }
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const metrics = metricsData?.data;
  const currentPhase = phaseData?.data?.phase || 'BTC_HEAVY';

  // Swipe gesture handler
  const handleSwipe = (info) => {
    const { offset, velocity } = info;
    
    if (Math.abs(offset.x) > Math.abs(offset.y)) {
      // Horizontal swipe
      if (offset.x > 100 && velocity.x > 0) {
        setSwipeDirection('right');
        // Navigate to previous tab
      } else if (offset.x < -100 && velocity.x < 0) {
        setSwipeDirection('left');
        // Navigate to next tab
      }
    } else {
      // Vertical swipe
      if (offset.y > 100 && velocity.y > 0) {
        setSwipeDirection('down');
        // Pull to refresh
      } else if (offset.y < -100 && velocity.y < 0) {
        setSwipeDirection('up');
        // Show more options
      }
    }
    
    setTimeout(() => setSwipeDirection(null), 300);
  };

  const generateMiniChartData = (baseValue) => {
    return Array.from({ length: 20 }, (_, i) => ({
      index: i,
      value: baseValue * (1 + (Math.random() - 0.5) * 0.1)
    }));
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Status Bar (Mobile) */}
      {isMobile && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-4 py-2 border-b"
          style={{
            background: glass('heavy'),
            borderColor: colors.border.primary
          }}
        >
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium" style={{ color: colors.text.primary }}>
              9:41
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <SignalIcon size={14} style={{ color: colors.text.primary }} />
            <Wifi size={14} style={{ color: colors.text.primary }} />
            <Battery size={14} style={{ color: colors.text.primary }} />
          </div>
        </motion.div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 border-b"
        style={{
          background: glass('heavy'),
          borderColor: colors.border.primary
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSideMenuOpen(!sideMenuOpen)}
            className="p-2 rounded-xl"
            style={{ background: colors.background.secondary }}
          >
            <Menu size={20} style={{ color: colors.text.primary }} />
          </button>
          
          <div>
            <h1 className="text-xl font-bold" style={{ color: colors.text.primary }}>
              CryptoRotate
            </h1>
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: colors.status.success }}
              />
              <span className={typography.caption} style={{ color: colors.text.muted }}>
                Live
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-xl"
            style={{ background: colors.background.secondary }}
          >
            <Search size={18} style={{ color: colors.text.tertiary }} />
          </button>
          
          <button
            className="p-2 rounded-xl relative"
            style={{ background: colors.background.secondary }}
          >
            <Bell size={18} style={{ color: colors.text.tertiary }} />
            {notifications.length > 0 && (
              <div 
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: colors.status.danger }}
              >
                {notifications.length}
              </div>
            )}
          </button>
        </div>
      </motion.div>

      {/* Side Menu Overlay */}
      <AnimatePresence>
        {sideMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setSideMenuOpen(false)}
            />
            
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed left-0 top-0 bottom-0 w-80 z-50 p-6"
              style={{
                background: glass('heavy'),
                borderRight: `1px solid ${colors.border.primary}`
              }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className={typography.h3} style={{ color: colors.text.primary }}>
                  Menu
                </h2>
                <button
                  onClick={() => setSideMenuOpen(false)}
                  className="p-2 rounded-xl"
                  style={{ background: colors.background.secondary }}
                >
                  <X size={18} style={{ color: colors.text.tertiary }} />
                </button>
              </div>

              <div className="space-y-2">
                {[
                  { id: 'dashboard', icon: Home, label: 'Dashboard' },
                  { id: 'portfolio', icon: Target, label: 'Portfolio' },
                  { id: 'signals', icon: BarChart3, label: 'Signals' },
                  { id: 'alerts', icon: Bell, label: 'Alerts' },
                  { id: 'settings', icon: Settings, label: 'Settings' }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSideMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                        activeTab === item.id ? 'scale-[0.98]' : ''
                      }`}
                      style={{
                        background: activeTab === item.id ? `${colors.accent.primary}20` : 'transparent',
                        color: activeTab === item.id ? colors.accent.primary : colors.text.secondary
                      }}
                    >
                      <Icon size={20} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content - Swipe Enabled */}
      <motion.div
        className="flex-1 p-4 pb-20"
        drag={isMobile ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(event, info) => handleSwipe(info)}
        animate={{
          x: swipeDirection === 'left' ? -10 : swipeDirection === 'right' ? 10 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="max-w-md mx-auto space-y-4">
          
          {/* Quick Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                label: 'Bitcoin',
                value: `$${metrics?.btc_price?.toLocaleString() || '65,000'}`,
                change: metrics?.btc_24h_change || 2.34,
                chart: generateMiniChartData(metrics?.btc_price || 65000)
              },
              {
                label: 'Ethereum',
                value: `$${metrics?.eth_price?.toLocaleString() || '3,200'}`,
                change: metrics?.eth_24h_change || -1.45,
                chart: generateMiniChartData(metrics?.eth_price || 3200)
              }
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-2xl border"
                style={{
                  background: glass('medium'),
                  borderColor: colors.border.primary
                }}
              >
                <div className={typography.caption} style={{ color: colors.text.muted }}>
                  {item.label.toUpperCase()}
                </div>
                
                <div className="text-lg font-bold my-2" style={{ color: colors.text.primary }}>
                  {item.value}
                </div>
                
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center gap-1 text-sm font-medium"
                    style={{ color: item.change >= 0 ? colors.status.success : colors.status.danger }}
                  >
                    {item.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                  </div>
                  
                  <div className="w-16 h-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={item.chart}>
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={item.change >= 0 ? colors.status.success : colors.status.danger}
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Current Phase Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-2xl border"
            style={{
              background: glass('medium'),
              borderColor: colors.border.primary
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className={typography.caption} style={{ color: colors.text.muted }}>
                  CURRENT PHASE
                </div>
                <div className="text-xl font-bold" style={{ color: colors.text.primary }}>
                  {currentPhase.replace('_', ' ')}
                </div>
              </div>
              
              <div className="text-4xl">
                {currentPhase === 'BTC_HEAVY' ? '₿' :
                 currentPhase === 'ETH_ROTATION' ? '⟠' :
                 currentPhase === 'ALT_SEASON' ? '🚀' : '💰'}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span style={{ color: colors.text.secondary }}>Confidence</span>
                <span className="font-semibold" style={{ color: colors.status.success }}>
                  85%
                </span>
              </div>
              
              <div className="w-full h-2 rounded-full" style={{ background: colors.background.tertiary }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full rounded-full"
                  style={{ background: colors.status.success }}
                />
              </div>
            </div>
          </motion.div>

          {/* Portfolio Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl border"
            style={{
              background: glass('medium'),
              borderColor: colors.border.primary
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className={typography.caption} style={{ color: colors.text.muted }}>
                  PORTFOLIO VALUE
                </div>
                <div className="text-2xl font-bold" style={{ color: colors.text.primary }}>
                  $125,430
                </div>
              </div>
              
              <div className="text-right">
                <div 
                  className="text-lg font-semibold flex items-center gap-1"
                  style={{ color: colors.status.success }}
                >
                  <TrendingUp size={16} />
                  +$5,230
                </div>
                <div className={typography.caption} style={{ color: colors.text.muted }}>
                  +4.35% today
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { asset: 'BTC', percent: 40, color: colors.accent.primary },
                { asset: 'ETH', percent: 35, color: colors.accent.secondary },
                { asset: 'ALTS', percent: 20, color: colors.status.warning },
                { asset: 'CASH', percent: 5, color: colors.text.tertiary }
              ].map((item) => (
                <div key={item.asset} className="text-center">
                  <div 
                    className="h-2 rounded-full mb-2"
                    style={{ background: item.color }}
                  />
                  <div className={typography.caption} style={{ color: colors.text.muted }}>
                    {item.asset}
                  </div>
                  <div className="text-sm font-semibold" style={{ color: colors.text.primary }}>
                    {item.percent}%
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Signals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl border"
            style={{
              background: glass('medium'),
              borderColor: colors.border.primary
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={typography.h4} style={{ color: colors.text.primary }}>
                Recent Signals
              </h3>
              <button className="text-sm" style={{ color: colors.accent.primary }}>
                View All
              </button>
            </div>

            <div className="space-y-3">
              {[
                { signal: 'BTC dominance rising', type: 'bullish', time: '5m ago' },
                { signal: 'ETH/BTC breaking resistance', type: 'neutral', time: '12m ago' },
                { signal: 'Alt volume decreasing', type: 'bearish', time: '18m ago' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl"
                     style={{ background: colors.background.secondary }}>
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-2 h-2 rounded-full ${
                        item.type === 'bullish' ? 'bg-green-400' :
                        item.type === 'bearish' ? 'bg-red-400' : 'bg-yellow-400'
                      }`}
                    />
                    <span style={{ color: colors.text.primary }}>{item.signal}</span>
                  </div>
                  <span className={typography.caption} style={{ color: colors.text.muted }}>
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-0 left-0 right-0 border-t"
        style={{
          background: glass('heavy'),
          borderColor: colors.border.primary
        }}
      >
        <div className="flex items-center justify-around py-3">
          {[
            { id: 'dashboard', icon: Home, label: 'Home' },
            { id: 'portfolio', icon: Target, label: 'Portfolio' },
            { id: 'signals', icon: BarChart3, label: 'Signals' },
            { id: 'alerts', icon: Bell, label: 'Alerts' }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                  isActive ? 'scale-110' : ''
                }`}
                style={{
                  color: isActive ? colors.accent.primary : colors.text.tertiary
                }}
              >
                <Icon size={20} />
                <span className="text-xs">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 w-8 h-0.5 rounded-full"
                    style={{ background: colors.accent.primary }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default ResponsiveMobileInterface;