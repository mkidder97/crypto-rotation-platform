import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'react-query';
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
  PieChart,
  Gauge,
  Activity,
  Clock,
  DollarSign,
  Percent,
  Zap,
  Shield,
  Eye,
  Lightbulb,
  Cpu,
  RefreshCw,
  X,
  FileText,
  Camera,
  Download
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  RadialBarChart,
  RadialBar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import { colors, animations, typography, glass } from '../utils/designSystem';

const BenjaminCowenAnalysis = () => {
  const [mounted, setMounted] = useState(false);
  const [portfolioImage, setPortfolioImage] = useState(null);
  const [portfolioPreview, setPortfolioPreview] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [analysisType, setAnalysisType] = useState('full');
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Fetch Benjamin Cowen analysis
  const { data: cowenAnalysis, isLoading: analysisLoading, refetch: refetchAnalysis } = useQuery(
    'cowenAnalysis',
    () => fetch('/api/cowen/analysis').then(res => res.json()),
    { refetchInterval: 30000 }
  );

  const { data: riskIndicator, isLoading: riskLoading } = useQuery(
    'cowenRisk',
    () => fetch('/api/cowen/risk-indicator').then(res => res.json()),
    { refetchInterval: 15000 }
  );

  const { data: btcDominance, isLoading: btcdLoading } = useQuery(
    'cowenBTCD',
    () => fetch('/api/cowen/btc-dominance').then(res => res.json()),
    { refetchInterval: 20000 }
  );

  const { data: marketCycle, isLoading: cycleLoading } = useQuery(
    'cowenCycle',
    () => fetch('/api/cowen/market-cycle').then(res => res.json()),
    { refetchInterval: 25000 }
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle portfolio image upload
  const handleImageUpload = useCallback((file) => {
    if (file && file.type.startsWith('image/')) {
      setPortfolioImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPortfolioPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  }, [handleImageUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  // Submit portfolio for analysis
  const analyzePortfolio = async () => {
    if (!portfolioImage) return;

    try {
      const formData = new FormData();
      formData.append('portfolio', portfolioImage);
      
      const response = await fetch('/api/cowen/portfolio-analysis', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      console.log('Portfolio analysis result:', result);
      
      // Refresh main analysis
      refetchAnalysis();
      setShowUploadModal(false);
      
    } catch (error) {
      console.error('Error analyzing portfolio:', error);
    }
  };

  const getRiskColor = (riskScore) => {
    if (riskScore <= 0.3) return colors.status.success; // Blue/Green zone
    if (riskScore <= 0.6) return colors.status.warning; // Yellow zone
    return colors.status.danger; // Red zone
  };

  const getRiskZoneLabel = (riskScore) => {
    if (riskScore <= 0.3) return 'ACCUMULATION';
    if (riskScore <= 0.6) return 'MODERATE';
    return 'SPECULATION';
  };

  if (!mounted) return null;

  const risk = riskIndicator?.data;
  const btcd = btcDominance?.data;
  const cycle = marketCycle?.data;
  const analysis = cowenAnalysis?.data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        {...animations.fadeIn}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${colors.crypto.bitcoin} 0%, ${colors.accent.primary} 100%)`,
              boxShadow: `0 0 20px ${colors.crypto.bitcoin}30`
            }}
          >
            <Brain size={24} style={{ color: 'white' }} />
          </div>
          
          <div>
            <h2 className={typography.h2} style={{ color: colors.text.primary }}>
              Benjamin Cowen Analysis
            </h2>
            <p className={typography.caption} style={{ color: colors.text.tertiary }}>
              Quantitative market analysis with mathematical precision
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all"
            style={{
              background: colors.accent.primary,
              color: 'white'
            }}
          >
            <Upload size={16} />
            Upload Portfolio
          </button>
          
          <button
            onClick={() => refetchAnalysis()}
            className="p-2 rounded-xl transition-all"
            style={{
              background: colors.background.secondary,
              color: colors.text.tertiary
            }}
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </motion.div>

      {/* Risk Indicator Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Gauge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-2xl border"
          style={{
            background: glass('medium'),
            borderColor: colors.border.primary
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Gauge size={20} style={{ color: colors.accent.primary }} />
            <div>
              <h3 className={typography.h4} style={{ color: colors.text.primary }}>
                Risk Indicator
              </h3>
              <p className={typography.caption} style={{ color: colors.text.tertiary }}>
                Cowen's 0-1 scale analysis
              </p>
            </div>
          </div>

          {risk && (
            <div className="text-center">
              <div className="mb-4">
                <ResponsiveContainer width="100%" height={120}>
                  <RadialBarChart cx="50%" cy="90%" innerRadius="60%" outerRadius="90%" 
                                startAngle={180} endAngle={0} data={[{ value: risk.riskScore * 100 }]}>
                    <RadialBar
                      dataKey="value"
                      cornerRadius={10}
                      fill={getRiskColor(risk.riskScore)}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="text-3xl font-bold mb-2" style={{ color: colors.text.primary }}>
                {risk.riskScore?.toFixed(2) || '0.00'}
              </div>
              
              <div 
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  background: `${getRiskColor(risk.riskScore)}20`,
                  color: getRiskColor(risk.riskScore)
                }}
              >
                {getRiskZoneLabel(risk.riskScore)}
              </div>

              <div className="mt-4 p-3 rounded-xl" style={{ background: colors.background.secondary }}>
                <p className="text-sm" style={{ color: colors.text.secondary }}>
                  {risk.interpretation}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* BTC Dominance Analysis */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl border"
          style={{
            background: glass('medium'),
            borderColor: colors.border.primary
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ 
                background: `${colors.crypto.bitcoin}20`,
                color: colors.crypto.bitcoin
              }}
            >
              ₿
            </div>
            <div>
              <h3 className={typography.h4} style={{ color: colors.text.primary }}>
                BTC Dominance
              </h3>
              <p className={typography.caption} style={{ color: colors.text.tertiary }}>
                Market cycle positioning
              </p>
            </div>
          </div>

          {btcd && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span style={{ color: colors.text.secondary }}>Current</span>
                <span className="text-2xl font-bold" style={{ color: colors.text.primary }}>
                  {btcd.currentDominance?.toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span style={{ color: colors.text.secondary }}>Trend</span>
                <div className="flex items-center gap-1">
                  {btcd.trend === 'RISING' ? (
                    <TrendingUp size={16} style={{ color: colors.status.success }} />
                  ) : btcd.trend === 'FALLING' ? (
                    <TrendingDown size={16} style={{ color: colors.status.danger }} />
                  ) : (
                    <Activity size={16} style={{ color: colors.status.warning }} />
                  )}
                  <span style={{ 
                    color: btcd.trend === 'RISING' ? colors.status.success :
                           btcd.trend === 'FALLING' ? colors.status.danger :
                           colors.status.warning
                  }}>
                    {btcd.trend}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span style={{ color: colors.text.secondary }}>Phase</span>
                <span className="text-sm font-medium" style={{ color: colors.accent.primary }}>
                  {btcd.cyclePhase}
                </span>
              </div>

              <div className="pt-4 border-t" style={{ borderColor: colors.border.primary }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm" style={{ color: colors.text.muted }}>
                    Altseason Probability
                  </span>
                  <span className="text-sm font-semibold" style={{ color: colors.text.primary }}>
                    {(btcd.altseasonProbability * 100)?.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ background: colors.background.tertiary }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${btcd.altseasonProbability * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full rounded-full"
                    style={{ background: colors.status.success }}
                  />
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Market Cycle Step */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl border"
          style={{
            background: glass('medium'),
            borderColor: colors.border.primary
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Clock size={20} style={{ color: colors.accent.secondary }} />
            <div>
              <h3 className={typography.h4} style={{ color: colors.text.primary }}>
                Market Cycle
              </h3>
              <p className={typography.caption} style={{ color: colors.text.tertiary }}>
                2025 roadmap progress
              </p>
            </div>
          </div>

          {cycle && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2" style={{ color: colors.accent.primary }}>
                  {cycle.currentStep}
                </div>
                <div className="text-sm" style={{ color: colors.text.secondary }}>
                  Step {cycle.currentStep} of 6
                </div>
              </div>

              <div className="p-3 rounded-xl" style={{ background: colors.background.secondary }}>
                <p className="text-sm text-center" style={{ color: colors.text.primary }}>
                  {cycle.stepDescription}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span style={{ color: colors.text.secondary }}>Confidence</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 rounded-full" style={{ background: colors.background.tertiary }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(cycle.confidence || 0) * 100}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="h-full rounded-full"
                      style={{ background: colors.accent.secondary }}
                    />
                  </div>
                  <span className="text-sm font-medium" style={{ color: colors.text.primary }}>
                    {((cycle.confidence || 0) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {cycle.timeline && (
                <div className="flex items-center justify-between">
                  <span style={{ color: colors.text.secondary }}>Timeline</span>
                  <span className="text-sm font-medium" style={{ color: colors.text.primary }}>
                    {cycle.timeline}
                  </span>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Analysis Insights */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl border"
          style={{
            background: glass('medium'),
            borderColor: colors.border.primary
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb size={20} style={{ color: colors.accent.primary }} />
            <div>
              <h3 className={typography.h3} style={{ color: colors.text.primary }}>
                Cowen Insights
              </h3>
              <p className={typography.caption} style={{ color: colors.text.tertiary }}>
                AI-powered analysis based on Benjamin Cowen's methodologies
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recommendations */}
            <div>
              <h4 className="text-lg font-semibold mb-4" style={{ color: colors.text.primary }}>
                Portfolio Recommendations
              </h4>
              
              {risk?.recommendation && (
                <div className="p-4 rounded-xl mb-4" style={{ 
                  background: `${getRiskColor(risk.riskScore)}10`,
                  border: `1px solid ${getRiskColor(risk.riskScore)}30`
                }}>
                  <div className="flex items-start gap-3">
                    <Target size={16} style={{ color: getRiskColor(risk.riskScore), marginTop: '2px' }} />
                    <div>
                      <div className="font-medium mb-1" style={{ color: colors.text.primary }}>
                        Risk-Based Allocation
                      </div>
                      <p className="text-sm" style={{ color: colors.text.secondary }}>
                        {risk.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {analysis.cowenInsights && (
                <div className="space-y-3">
                  {Object.entries(analysis.cowenInsights).slice(0, 3).map(([key, value], index) => (
                    <div key={key} className="p-3 rounded-xl" style={{ background: colors.background.secondary }}>
                      <div className="text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </div>
                      <p className="text-xs" style={{ color: colors.text.secondary }}>
                        {typeof value === 'string' ? value : JSON.stringify(value)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Key Metrics */}
            <div>
              <h4 className="text-lg font-semibold mb-4" style={{ color: colors.text.primary }}>
                Key Metrics
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl" 
                     style={{ background: colors.background.secondary }}>
                  <span style={{ color: colors.text.secondary }}>Overall Confidence</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 rounded-full" style={{ background: colors.background.tertiary }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(analysis.metadata?.confidence || 0) * 100}%` }}
                        transition={{ duration: 1, delay: 0.7 }}
                        className="h-full rounded-full"
                        style={{ background: colors.accent.primary }}
                      />
                    </div>
                    <span className="text-sm font-medium" style={{ color: colors.text.primary }}>
                      {((analysis.metadata?.confidence || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl" 
                     style={{ background: colors.background.secondary }}>
                  <span style={{ color: colors.text.secondary }}>Analysis Time</span>
                  <span className="text-sm font-medium" style={{ color: colors.text.primary }}>
                    {new Date(analysis.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl" 
                     style={{ background: colors.background.secondary }}>
                  <span style={{ color: colors.text.secondary }}>Methodology</span>
                  <span className="text-sm font-medium" style={{ color: colors.text.primary }}>
                    {analysis.metadata?.analyzer || 'Benjamin Cowen'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Portfolio Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full p-6 rounded-2xl border"
              style={{
                background: glass('heavy'),
                borderColor: colors.border.primary
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className={typography.h3} style={{ color: colors.text.primary }}>
                  Upload Portfolio
                </h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 rounded-lg"
                  style={{ background: colors.background.secondary }}
                >
                  <X size={16} style={{ color: colors.text.tertiary }} />
                </button>
              </div>

              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  dragOver ? 'scale-105' : ''
                }`}
                style={{
                  borderColor: dragOver ? colors.accent.primary : colors.border.primary,
                  background: dragOver ? `${colors.accent.primary}10` : colors.background.secondary
                }}
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
                      <div className="w-full h-2 rounded-full" style={{ background: colors.background.tertiary }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          className="h-full rounded-full"
                          style={{ background: colors.accent.primary }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <ImageIcon size={32} style={{ color: colors.text.tertiary }} className="mx-auto" />
                    <div>
                      <p style={{ color: colors.text.primary }}>
                        Drop your portfolio screenshot here
                      </p>
                      <p className={typography.caption} style={{ color: colors.text.tertiary }}>
                        or click to browse files
                      </p>
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {portfolioPreview && (
                <button
                  onClick={analyzePortfolio}
                  className="w-full mt-6 px-4 py-3 rounded-xl font-medium transition-all"
                  style={{
                    background: colors.accent.primary,
                    color: 'white'
                  }}
                >
                  Analyze with Benjamin Cowen AI
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BenjaminCowenAnalysis;