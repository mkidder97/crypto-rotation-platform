import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Activity, 
  Settings, 
  Bell, 
  History,
  Target,
  Zap,
  BookOpen,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Brain
} from 'lucide-react';
import { cn, button, glass, animations, colors } from '../utils/designSystem';

const Sidebar = ({ currentView, onViewChange, collapsed, onToggleCollapse }) => {
  const [isHovered, setIsHovered] = useState(false);

  const navigation = [
    {
      name: 'Dashboard',
      icon: BarChart3,
      view: 'dashboard',
      badge: null,
    },
    {
      name: 'Portfolio',
      icon: PieChart,
      view: 'portfolio',
      badge: null,
    },
    {
      name: 'Backtesting',
      icon: TrendingUp,
      view: 'backtesting',
      badge: 'Pro',
    },
    {
      name: 'Signals',
      icon: Zap,
      view: 'signals',
      badge: 'Live',
    },
    {
      name: 'Charts',
      icon: BarChart3,
      view: 'charts',
      badge: 'Pro',
    },
    {
      name: 'Cowen AI',
      icon: Brain,
      view: 'cowen',
      badge: 'New',
    },
    {
      name: 'Performance',
      icon: Activity,
      view: 'performance',
      badge: null,
    },
    {
      name: 'Alerts',
      icon: Bell,
      view: 'alerts',
      badge: '3',
    },
    {
      name: 'History',
      icon: History,
      view: 'history',
      badge: null,
    },
    {
      name: 'Strategy',
      icon: Target,
      view: 'strategy',
      badge: null,
    },
    {
      name: 'Learn',
      icon: BookOpen,
      view: 'learn',
      badge: 'New',
    },
    {
      name: 'Settings',
      icon: Settings,
      view: 'settings',
      badge: null,
    },
  ];

  const isExpanded = !collapsed || isHovered;

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onToggleCollapse}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: isExpanded ? 280 : 80,
          x: collapsed && window.innerWidth < 1024 ? -280 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 h-full z-50 flex flex-col"
        style={{
          background: `linear-gradient(180deg, ${colors.background.secondary} 0%, ${colors.background.tertiary} 100%)`,
          borderRight: `1px solid ${colors.border.primary}`,
          backdropFilter: 'blur(20px)',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.12)'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header */}
        <div className="p-8 border-b" style={{ borderColor: colors.border.primary }}>
          <div className="flex items-center justify-between">
            <AnimatePresence mode="wait">
              {isExpanded ? (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                      CryptoRotate
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Pro Trading Suite
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="collapsed"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto"
                >
                  <TrendingUp className="w-6 h-6 text-white" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toggle button for desktop */}
            <button
              onClick={onToggleCollapse}
              className={cn(
                "hidden lg:flex p-2 rounded-lg",
                "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
                "hover:bg-white/10 dark:hover:bg-white/5",
                "transition-all duration-200",
                !isExpanded && "mx-auto mt-2"
              )}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Close button for mobile */}
            <button
              onClick={onToggleCollapse}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.view;

            return (
              <motion.button
                key={item.name}
                onClick={() => onViewChange(item.view)}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-xl",
                  "transition-all duration-200 group relative",
                  isActive
                    ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-500/10"
                    : "text-gray-600 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive && "text-blue-500"
                )} />
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="flex items-center justify-between flex-1 min-w-0"
                    >
                      <span className="font-medium truncate">{item.name}</span>
                      {item.badge && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={cn(
                            "px-2 py-1 text-xs font-semibold rounded-full",
                            item.badge === 'Pro' && "bg-gradient-to-r from-yellow-400 to-orange-500 text-white",
                            item.badge === 'Live' && "bg-gradient-to-r from-green-400 to-emerald-500 text-white",
                            item.badge === 'New' && "bg-gradient-to-r from-purple-400 to-pink-500 text-white",
                            /^\d+$/.test(item.badge) && "bg-red-500 text-white"
                          )}
                        >
                          {item.badge}
                        </motion.span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tooltip for collapsed state */}
                {collapsed && !isHovered && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.name}
                    {item.badge && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-white/20 rounded">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 dark:border-gray-800/50">
          <AnimatePresence>
            {isExpanded ? (
              <motion.div
                key="footer-expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-green-700 dark:text-green-400">
                      System Status
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-500">
                      All systems operational
                    </p>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    © 2024 CryptoRotate Pro
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    v2.1.0
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="footer-collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;