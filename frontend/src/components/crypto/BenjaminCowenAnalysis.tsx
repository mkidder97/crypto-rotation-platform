import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { 
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  BarChart3,
  Gauge,
  Activity,
  Clock,
  DollarSign,
  Zap,
  Eye,
  Lightbulb,
  RefreshCw,
  X
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  ResponsiveContainer, 
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn, getRiskColor } from '@/lib/utils'

// Type definitions
interface RiskData {
  riskScore: number
  zone: string
  interpretation: string
  recommendation: string
}

interface BTCDominanceData {
  currentDominance: number
  trend: 'RISING' | 'FALLING' | 'STABLE'
  cyclePhase: string
  altseasonProbability: number
}

interface MarketCycleData {
  currentStep: number
  stepDescription: string
  confidence: number
  timeline?: string
}

interface CowenAnalysisData {
  cowenInsights: Record<string, any>
  metadata: {
    confidence: number
    analyzer: string
  }
  timestamp: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
}

const BenjaminCowenAnalysis: React.FC = () => {
  const [mounted, setMounted] = useState(false)
  const [portfolioImage, setPortfolioImage] = useState<File | null>(null)
  const [portfolioPreview, setPortfolioPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch Benjamin Cowen analysis data
  const { data: cowenAnalysis, isLoading: analysisLoading, refetch: refetchAnalysis } = useQuery({
    queryKey: ['cowenAnalysis'],
    queryFn: () => fetch('/api/cowen/analysis').then(res => res.json() as Promise<ApiResponse<CowenAnalysisData>>),
    refetchInterval: 30000,
  })

  const { data: riskIndicator, isLoading: riskLoading } = useQuery({
    queryKey: ['cowenRisk'],
    queryFn: () => fetch('/api/cowen/risk-indicator').then(res => res.json() as Promise<ApiResponse<RiskData>>),
    refetchInterval: 15000,
  })

  const { data: btcDominance, isLoading: btcdLoading } = useQuery({
    queryKey: ['cowenBTCD'],
    queryFn: () => fetch('/api/cowen/btc-dominance').then(res => res.json() as Promise<ApiResponse<BTCDominanceData>>),
    refetchInterval: 20000,
  })

  const { data: marketCycle, isLoading: cycleLoading } = useQuery({
    queryKey: ['cowenCycle'],
    queryFn: () => fetch('/api/cowen/market-cycle').then(res => res.json() as Promise<ApiResponse<MarketCycleData>>),
    refetchInterval: 25000,
  })

  // Handle portfolio image upload
  const handleImageUpload = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      setPortfolioImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPortfolioPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      
      // Simulate upload progress
      setUploadProgress(0)
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 10
        })
      }, 100)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0 && files[0]) {
      handleImageUpload(files[0])
    }
  }, [handleImageUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  // Submit portfolio for analysis
  const analyzePortfolio = async () => {
    if (!portfolioImage) return

    try {
      const formData = new FormData()
      formData.append('portfolio', portfolioImage)
      
      const response = await fetch('/api/cowen/portfolio-analysis', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      console.log('Portfolio analysis result:', result)
      
      // Refresh main analysis
      refetchAnalysis()
      setShowUploadModal(false)
      
    } catch (error) {
      console.error('Error analyzing portfolio:', error)
    }
  }

  const getRiskZoneLabel = (riskScore: number): string => {
    if (riskScore <= 0.3) return 'ACCUMULATION'
    if (riskScore <= 0.6) return 'MODERATE'
    return 'SPECULATION'
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-crypto-accent/20 flex items-center justify-center animate-spin">
            <RefreshCw className="w-6 h-6 text-crypto-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Loading Benjamin Cowen Analysis</h3>
            <p className="text-sm text-muted-foreground">Preparing quantitative market analysis</p>
          </div>
        </div>
      </div>
    )
  }

  const risk = riskIndicator?.data
  const btcd = btcDominance?.data
  const cycle = marketCycle?.data
  const analysis = cowenAnalysis?.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-crypto-accent to-primary flex items-center justify-center shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Benjamin Cowen Analysis
            </h2>
            <p className="text-sm text-muted-foreground">
              Quantitative market analysis with mathematical precision
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Portfolio
          </Button>
          
          <Button variant="outline" size="icon" onClick={() => refetchAnalysis()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Risk Indicator Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Gauge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="glass">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Gauge className="w-5 h-5 text-crypto-accent" />
                <div>
                  <CardTitle>Risk Indicator</CardTitle>
                  <CardDescription>Cowen's 0-1 scale analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {risk && (
                <div className="text-center space-y-4">
                  <div className="relative">
                    <ResponsiveContainer width="100%" height={120}>
                      <RadialBarChart 
                        cx="50%" 
                        cy="90%" 
                        innerRadius="60%" 
                        outerRadius="90%" 
                        startAngle={180} 
                        endAngle={0} 
                        data={[{ value: risk.riskScore * 100 }]}
                      >
                        <RadialBar
                          dataKey="value"
                          cornerRadius={10}
                          fill={getRiskColor(risk.riskScore)}
                        />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                      <div className="text-3xl font-bold text-foreground mb-1">
                        {risk.riskScore.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                       style={{
                         backgroundColor: `${getRiskColor(risk.riskScore)}20`,
                         color: getRiskColor(risk.riskScore)
                       }}>
                    {getRiskZoneLabel(risk.riskScore)}
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {risk.interpretation}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* BTC Dominance Analysis */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="glass">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-phase-btc/20 flex items-center justify-center text-sm font-bold text-phase-btc">
                  ₿
                </div>
                <div>
                  <CardTitle>BTC Dominance</CardTitle>
                  <CardDescription>Market cycle positioning</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {btcd && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Current</span>
                    <span className="text-2xl font-bold text-foreground">
                      {btcd.currentDominance.toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Trend</span>
                    <div className="flex items-center gap-1">
                      {btcd.trend === 'RISING' ? (
                        <TrendingUp className="w-4 h-4 text-crypto-success" />
                      ) : btcd.trend === 'FALLING' ? (
                        <TrendingDown className="w-4 h-4 text-crypto-danger" />
                      ) : (
                        <Activity className="w-4 h-4 text-crypto-warning" />
                      )}
                      <span className={cn(
                        "text-sm font-medium",
                        btcd.trend === 'RISING' ? 'text-crypto-success' :
                        btcd.trend === 'FALLING' ? 'text-crypto-danger' :
                        'text-crypto-warning'
                      )}>
                        {btcd.trend}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Phase</span>
                    <span className="text-sm font-medium text-crypto-accent">
                      {btcd.cyclePhase}
                    </span>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        Altseason Probability
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {(btcd.altseasonProbability * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={btcd.altseasonProbability * 100} className="h-2" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Market Cycle Step */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="glass">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-crypto-accent" />
                <div>
                  <CardTitle>Market Cycle</CardTitle>
                  <CardDescription>2025 roadmap progress</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {cycle && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-crypto-accent mb-2">
                      {cycle.currentStep}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Step {cycle.currentStep} of 6
                    </div>
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-center text-foreground">
                      {cycle.stepDescription}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Confidence</span>
                    <div className="flex items-center gap-2">
                      <Progress value={(cycle.confidence || 0) * 100} className="w-16 h-2" />
                      <span className="text-sm font-medium text-foreground">
                        {((cycle.confidence || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {cycle.timeline && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Timeline</span>
                      <span className="text-sm font-medium text-foreground">
                        {cycle.timeline}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Analysis Insights */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="glass">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Lightbulb className="w-5 h-5 text-crypto-accent" />
                <div>
                  <CardTitle>Cowen Insights</CardTitle>
                  <CardDescription>
                    AI-powered analysis based on Benjamin Cowen's methodologies
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recommendations */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-foreground">
                    Portfolio Recommendations
                  </h4>
                  
                  {risk?.recommendation && (
                    <div className="p-4 rounded-lg mb-4 border"
                         style={{
                           backgroundColor: `${getRiskColor(risk.riskScore)}10`,
                           borderColor: `${getRiskColor(risk.riskScore)}30`
                         }}>
                      <div className="flex items-start gap-3">
                        <Target className="w-4 h-4 mt-1" style={{ color: getRiskColor(risk.riskScore) }} />
                        <div>
                          <div className="font-medium mb-1 text-foreground">
                            Risk-Based Allocation
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {risk.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {analysis.cowenInsights && (
                    <div className="space-y-3">
                      {Object.entries(analysis.cowenInsights).slice(0, 3).map(([key, value]) => (
                        <div key={key} className="p-3 bg-muted rounded-lg">
                          <div className="text-sm font-medium mb-1 text-foreground">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {typeof value === 'string' ? value : JSON.stringify(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Key Metrics */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-foreground">
                    Key Metrics
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-muted-foreground">Overall Confidence</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(analysis.metadata?.confidence || 0) * 100} className="w-16 h-2" />
                        <span className="text-sm font-medium text-foreground">
                          {((analysis.metadata?.confidence || 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-muted-foreground">Analysis Time</span>
                      <span className="text-sm font-medium text-foreground">
                        {new Date(analysis.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-muted-foreground">Methodology</span>
                      <span className="text-sm font-medium text-foreground">
                        {analysis.metadata?.analyzer || 'Benjamin Cowen'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Portfolio Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="max-w-md glass-effect">
          <DialogHeader>
            <DialogTitle>Upload Portfolio</DialogTitle>
            <DialogDescription>
              Upload a screenshot of your portfolio for AI analysis
            </DialogDescription>
          </DialogHeader>

          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-all",
              dragOver ? "border-crypto-accent bg-crypto-accent/10 scale-105" : "border-border"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {portfolioPreview ? (
              <div className="space-y-4">
                <img
                  src={portfolioPreview}
                  alt="Portfolio preview"
                  className="max-w-full h-32 object-contain mx-auto rounded-lg"
                />
                {uploadProgress < 100 && (
                  <Progress value={uploadProgress} className="w-full" />
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto" />
                <div>
                  <p className="text-foreground">
                    Drop your portfolio screenshot here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse files
                  </p>
                </div>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {portfolioPreview && (
            <Button onClick={analyzePortfolio} className="w-full">
              Analyze with Benjamin Cowen AI
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BenjaminCowenAnalysis