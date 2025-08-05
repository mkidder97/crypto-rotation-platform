import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Settings, 
  TrendingUp,
  Activity,
  BarChart3,
  Wallet,
  Globe,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import CryptoTradingDashboard from '@/components/crypto/CryptoTradingDashboard'

const ModernDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState('dashboard')
  const { theme, setTheme } = useTheme()

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, description: 'Main trading dashboard' },
    { id: 'portfolio', label: 'Portfolio', icon: Wallet, description: 'Portfolio management' },
    { id: 'markets', label: 'Markets', icon: TrendingUp, description: 'Market overview' },
    { id: 'analysis', label: 'Analysis', icon: Activity, description: 'Benjamin Cowen analysis' },
    { id: 'global', label: 'Global', icon: Globe, description: 'Global market data' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'Application settings' },
  ]

  const sidebarVariants = {
    open: { width: '280px', opacity: 1 },
    closed: { width: '80px', opacity: 0.8 },
  }

  const contentVariants = {
    open: { marginLeft: '280px' },
    closed: { marginLeft: '80px' },
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-crypto-primary via-crypto-secondary to-background">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={sidebarOpen ? 'open' : 'closed'}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-0 h-full glass-effect border-r border-crypto-glass-border z-50 flex flex-col"
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-crypto-glass-border">
          <div className="flex items-center justify-between">
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-crypto-accent flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-foreground">CryptoRotate</h1>
                    <p className="text-xs text-muted-foreground">Professional Trading</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="hover:bg-crypto-glass/50"
                >
                  {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item, index) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                      isActive
                        ? 'bg-crypto-accent text-white shadow-lg'
                        : 'text-muted-foreground hover:text-foreground hover:bg-crypto-glass/30'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'group-hover:text-crypto-accent'}`} />
                    <AnimatePresence>
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="font-medium"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </TooltipTrigger>
                {!sidebarOpen && (
                  <TooltipContent side="right">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-crypto-glass-border">
          <div className="flex items-center justify-between">
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-crypto-accent/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-crypto-accent">MK</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">mkidder97</p>
                    <p className="text-xs text-muted-foreground">Pro Trader</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="hover:bg-crypto-glass/50"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Switch to {theme === 'dark' ? 'light' : 'dark'} mode
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        initial={false}
        animate={sidebarOpen ? 'open' : 'closed'}
        variants={contentVariants}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex-1 flex flex-col min-h-screen"
      >
        {/* Top Bar */}
        <header className="h-16 glass-effect border-b border-crypto-glass-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-foreground capitalize">
              {activeSection === 'dashboard' ? 'Trading Dashboard' : activeSection}
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-crypto-success animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Live Market Data</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="glass-effect">
              <Activity className="w-4 h-4 mr-2" />
              Risk: 0.64
            </Button>
            <Button variant="crypto" size="sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              Bull Market
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {activeSection === 'dashboard' && <CryptoTradingDashboard />}
              {activeSection === 'portfolio' && (
                <Card variant="glass" className="p-8">
                  <h3 className="text-2xl font-bold text-foreground mb-4">Portfolio Management</h3>
                  <p className="text-muted-foreground">Portfolio management features coming soon...</p>
                </Card>
              )}
              {activeSection === 'markets' && (
                <Card variant="glass" className="p-8">
                  <h3 className="text-2xl font-bold text-foreground mb-4">Market Overview</h3>
                  <p className="text-muted-foreground">Market overview features coming soon...</p>
                </Card>
              )}
              {activeSection === 'analysis' && (
                <Card variant="glass" className="p-8">
                  <h3 className="text-2xl font-bold text-foreground mb-4">Benjamin Cowen Analysis</h3>
                  <p className="text-muted-foreground">Advanced analysis features coming soon...</p>
                </Card>
              )}
              {activeSection === 'global' && (
                <Card variant="glass" className="p-8">
                  <h3 className="text-2xl font-bold text-foreground mb-4">Global Market Data</h3>
                  <p className="text-muted-foreground">Global market data features coming soon...</p>
                </Card>
              )}
              {activeSection === 'settings' && (
                <Card variant="glass" className="p-8">
                  <h3 className="text-2xl font-bold text-foreground mb-4">Settings</h3>
                  <p className="text-muted-foreground">Settings panel coming soon...</p>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.main>
    </div>
  )
}

export default ModernDashboard