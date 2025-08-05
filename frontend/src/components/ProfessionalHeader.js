import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Settings, 
  User, 
  Moon, 
  Sun, 
  Search,
  Menu,
  Maximize,
  RefreshCw,
  Download,
  Share,
  HelpCircle
} from 'lucide-react';
import { cn, glass, button, status, animations, colors } from '../utils/designSystem';

const ProfessionalHeader = ({ 
  darkMode, 
  setDarkMode, 
  onToggleSidebar,
  sidebarCollapsed 
}) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 1,
      type: 'phase',
      title: 'Phase Transition Alert',
      message: 'BTC dominance approaching 68% threshold',
      time: '2 min ago',
      unread: true,
    },
    {
      id: 2,
      type: 'profit',
      title: 'Portfolio Performance',
      message: 'Up 12.5% this month',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: 3,
      type: 'system',
      title: 'Data Update',
      message: 'Market data refreshed',
      time: '5 min ago',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <motion.header
      {...animations.slideIn}
      className="sticky top-0 z-40 transition-all duration-300"
      style={{
        background: `linear-gradient(180deg, ${colors.background.secondary} 0%, ${colors.background.tertiary} 100%)`,
        borderBottom: `1px solid ${colors.border.primary}`,
        backdropFilter: 'blur(20px)'
      }}
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={onToggleSidebar}
              className={cn(
                "lg:hidden p-2 rounded-xl",
                "text-gray-600 dark:text-gray-400",
                "hover:bg-white/10 dark:hover:bg-white/5",
                "transition-all duration-200"
              )}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search */}
            <div className="relative">
              <motion.div
                animate={{
                  width: searchFocused ? 320 : 240,
                }}
                className={cn(
                  "relative",
                  glass('medium'),
                  "border border-white/20 dark:border-gray-700/50 rounded-xl",
                  "transition-all duration-200",
                  searchFocused && "shadow-lg shadow-blue-500/10"
                )}
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search markets, strategies..."
                  className={cn(
                    "w-full pl-10 pr-4 py-2.5 bg-transparent",
                    "text-sm text-gray-900 dark:text-white",
                    "placeholder-gray-500 dark:placeholder-gray-400",
                    "focus:outline-none"
                  )}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
              </motion.div>
            </div>

            {/* Market Status */}
            <div className={cn(
              "hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg",
              glass('light'),
              status.online
            )}>
              <div className={status.dot('bg-green-500')} />
              <span className="text-sm font-medium">Markets Open</span>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Quick Actions */}
            <div className="hidden md:flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "p-2 rounded-lg",
                  "text-gray-600 dark:text-gray-400",
                  "hover:bg-white/10 dark:hover:bg-white/5",
                  "transition-all duration-200"
                )}
                title="Refresh Data"
              >
                <RefreshCw className="w-4 h-4" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "p-2 rounded-lg",
                  "text-gray-600 dark:text-gray-400",
                  "hover:bg-white/10 dark:hover:bg-white/5",
                  "transition-all duration-200"
                )}
                title="Export Data"
              >
                <Download className="w-4 h-4" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "p-2 rounded-lg",
                  "text-gray-600 dark:text-gray-400",
                  "hover:bg-white/10 dark:hover:bg-white/5",
                  "transition-all duration-200"
                )}
                title="Fullscreen"
              >
                <Maximize className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDarkMode(!darkMode)}
              className={cn(
                "p-2 rounded-lg",
                "text-gray-600 dark:text-gray-400",
                "hover:bg-white/10 dark:hover:bg-white/5",
                "transition-all duration-200"
              )}
            >
              <AnimatePresence mode="wait">
                {darkMode ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Notifications */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className={cn(
                  "relative p-2 rounded-lg",
                  "text-gray-600 dark:text-gray-400",
                  "hover:bg-white/10 dark:hover:bg-white/5",
                  "transition-all duration-200"
                )}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold"
                  >
                    {unreadCount}
                  </motion.div>
                )}
              </motion.button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={cn(
                      "absolute right-0 mt-2 w-80",
                      glass('strong'),
                      "border border-white/20 dark:border-gray-700/50 rounded-2xl",
                      "shadow-2xl shadow-black/10 dark:shadow-black/30"
                    )}
                  >
                    <div className="p-4 border-b border-white/10 dark:border-gray-700/50">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            "p-4 border-b border-white/5 dark:border-gray-700/30 last:border-b-0",
                            "hover:bg-white/5 dark:hover:bg-white/5 transition-colors cursor-pointer",
                            notification.unread && "bg-blue-50/50 dark:bg-blue-900/10"
                          )}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={cn(
                              "w-2 h-2 rounded-full mt-2",
                              notification.unread ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                            )} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t border-white/10 dark:border-gray-700/50">
                      <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                        Mark all as read
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowProfile(!showProfile)}
                className={cn(
                  "flex items-center space-x-2 p-2 rounded-lg",
                  "text-gray-600 dark:text-gray-400",
                  "hover:bg-white/10 dark:hover:bg-white/5",
                  "transition-all duration-200"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    John Trader
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Pro Plan
                  </p>
                </div>
              </motion.button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={cn(
                      "absolute right-0 mt-2 w-64",
                      glass('strong'),
                      "border border-white/20 dark:border-gray-700/50 rounded-2xl",
                      "shadow-2xl shadow-black/10 dark:shadow-black/30"
                    )}
                  >
                    <div className="p-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            John Trader
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            john@trader.com
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-white/5 rounded-lg transition-colors">
                          Profile Settings
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-white/5 rounded-lg transition-colors">
                          Billing & Plans
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-white/5 rounded-lg transition-colors">
                          API Keys
                        </button>
                        <hr className="border-white/10 dark:border-gray-700/50 my-2" />
                        <button className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default ProfessionalHeader;