import { query } from '@anthropic-ai/claude-code';
import fs from 'fs/promises';
import path from 'path';

class BenjaminCowenAnalyzer {
    constructor() {
        this.riskThresholds = {
            ACCUMULATION: 0.3,    // Blue zone - Low risk
            MODERATE: 0.6,        // Yellow zone - Moderate risk  
            SPECULATION: 1.0      // Red zone - High risk
        };

        // Cowen's 2025 Market Cycle Steps
        this.marketCycleSteps = {
            STEP_1: 'BTC Dominance > 60%',
            STEP_2: 'Market Correction with ETH Decline', 
            STEP_3: 'Fed Policy Shift (End QT)',
            STEP_4: 'Bullish Phase Begin',
            STEP_5: 'Macro Deterioration',
            STEP_6: 'Recession & Bear Market'
        };

        this.systemPrompt = `You are Benjamin Cowen, a crypto analyst with a PhD in Nuclear Engineering and expertise in quantitative market analysis. You use data-driven, long-term analysis with these core methodologies:

1. RISK INDICATORS: Calculate risk on 0-1 scale (0=accumulation, 1=speculation)
2. BITCOIN DOMINANCE THEORY: Track BTC.D cycles and market phases  
3. LOGARITHMIC REGRESSION: Long-term trend analysis
4. MARKET CYCLE THEORY: Your 2025 6-step roadmap
5. ETH/BTC RATIO: Predict altcoin season timing
6. ON-CHAIN METRICS: Identify major market shifts

Your analysis style is:
- Mathematical and data-driven
- Long-term focused (months, not days)
- Risk-conscious and conservative
- Uses scientific metaphors and analogies
- Focuses on probabilities, not certainties

Always provide:
- Current risk assessment (0-1 scale)
- Market cycle step identification
- BTC dominance analysis
- Actionable insights for portfolio allocation
- Risk management recommendations`;
    }

    /**
     * Calculate Benjamin Cowen's Risk Indicator (0-1 scale)
     * Blue (0-0.3): Low risk accumulation zone
     * Yellow (0.3-0.6): Moderate risk zone  
     * Red (0.6-1): High risk speculation zone
     */
    calculateRiskIndicator(currentPrice, logarithmicRegression, historicalData) {
        try {
            // Simplified risk calculation based on distance from log regression
            const logRegValue = logarithmicRegression.currentValue;
            const priceRatio = currentPrice / logRegValue;
            
            // Historical volatility factor
            const volatility = this.calculateVolatility(historicalData);
            
            // Market cycle adjustment
            const cycleMultiplier = this.getMarketCycleMultiplier(historicalData);
            
            // Risk calculation (Cowen's methodology approximation)
            let risk = Math.min(Math.max((priceRatio - 1) * 2 + volatility * 0.3 + cycleMultiplier, 0), 1);
            
            return {
                riskScore: risk,
                zone: this.getRiskZone(risk),
                interpretation: this.interpretRisk(risk),
                recommendation: this.getRiskRecommendation(risk)
            };
        } catch (error) {
            console.error('Error calculating risk indicator:', error);
            return {
                riskScore: 0.5,
                zone: 'MODERATE',
                interpretation: 'Unable to calculate risk - use caution',
                recommendation: 'Wait for clearer signals'
            };
        }
    }

    /**
     * Analyze Bitcoin Dominance and determine market cycle phase
     */
    analyzeBTCDominance(btcDominance, historicalBTCD, ethBtcRatio) {
        const analysis = {
            currentDominance: btcDominance,
            trend: this.calculateTrend(historicalBTCD),
            cyclePhase: this.identifyBTCDCycle(btcDominance, ethBtcRatio),
            altseasonProbability: this.calculateAltseasonProbability(btcDominance, ethBtcRatio),
            nextTarget: this.getBTCDTarget(btcDominance, historicalBTCD)
        };

        return analysis;
    }

    /**
     * Determine current market cycle step based on Cowen's 2025 framework
     */
    identifyMarketCycleStep(marketData) {
        const { btc_dominance, eth_btc_ratio, fed_policy, market_trend } = marketData;
        
        let currentStep = 1;
        let confidence = 0;

        // Step 1: BTC Dominance > 60%
        if (btc_dominance > 60) {
            currentStep = Math.max(currentStep, 1);
            confidence += 0.2;
        }

        // Step 2: Market correction with ETH decline
        if (eth_btc_ratio && eth_btc_ratio < 0.05) {
            currentStep = Math.max(currentStep, 2);
            confidence += 0.15;
        }

        // Additional steps would require more economic data
        // This is a simplified implementation

        return {
            currentStep,
            stepDescription: Object.values(this.marketCycleSteps)[currentStep - 1],
            confidence: Math.min(confidence, 1),
            nextStep: currentStep < 6 ? currentStep + 1 : null,
            timeline: this.estimateStepTimeline(currentStep)
        };
    }

    /**
     * Generate comprehensive Benjamin Cowen style analysis
     */
    async generateCowenAnalysis(marketData, portfolioData = null) {
        try {
            const prompt = `
            Analyze the current crypto market using Benjamin Cowen's methodology:

            MARKET DATA:
            - BTC Price: $${marketData.btc_price}
            - BTC Dominance: ${marketData.btc_dominance}%
            - ETH/BTC Ratio: ${marketData.eth_btc_ratio}
            - Total Market Cap: $${marketData.total_market_cap}
            - 24h Changes: BTC ${marketData.btc_24h_change}%, ETH ${marketData.eth_24h_change}%

            ${portfolioData ? `
            PORTFOLIO DATA:
            - BTC Allocation: ${portfolioData.btc_allocation}%
            - ETH Allocation: ${portfolioData.eth_allocation}%
            - Alt Allocation: ${portfolioData.alt_allocation}%
            - Cash Allocation: ${portfolioData.cash_allocation}%
            ` : ''}

            Provide analysis including:
            1. Current Risk Assessment (0-1 scale with zone classification)
            2. Bitcoin Dominance Analysis and cycle implications
            3. Market Cycle Step identification (your 2025 framework)
            4. ETH/BTC ratio analysis for altseason timing
            5. Portfolio allocation recommendations
            6. Risk management insights
            7. Timeline expectations for major moves

            Format as structured JSON with clear actionable insights.
            `;

            const analysisResponse = await query({
                prompt: this.systemPrompt + '\n\n' + prompt,
                options: { 
                    maxTurns: 1,
                    outputFormat: 'json'
                }
            });

            // Process the response
            let analysis = {};
            for await (const message of analysisResponse) {
                if (message.content) {
                    try {
                        analysis = JSON.parse(message.content);
                    } catch (e) {
                        analysis = { rawResponse: message.content };
                    }
                }
            }

            // Add calculated metrics
            const riskIndicator = this.calculateRiskIndicator(
                marketData.btc_price,
                { currentValue: marketData.btc_price * 0.8 }, // Simplified log regression
                []
            );

            const btcdAnalysis = this.analyzeBTCDominance(
                marketData.btc_dominance,
                [],
                marketData.eth_btc_ratio
            );

            const marketCycle = this.identifyMarketCycleStep(marketData);

            return {
                timestamp: new Date().toISOString(),
                riskIndicator,
                btcdAnalysis,
                marketCycle,
                cowenInsights: analysis,
                metadata: {
                    analyzer: 'Benjamin Cowen Methodology',
                    confidence: this.calculateOverallConfidence(riskIndicator, btcdAnalysis, marketCycle)
                }
            };

        } catch (error) {
            console.error('Error generating Cowen analysis:', error);
            throw new Error('Failed to generate Benjamin Cowen analysis');
        }
    }

    /**
     * Analyze portfolio image using Claude's vision capabilities
     */
    async analyzePortfolioImage(imagePath, marketData) {
        try {
            // Read image file
            const imageBuffer = await fs.readFile(imagePath);
            const imageBase64 = imageBuffer.toString('base64');

            const prompt = `
            As Benjamin Cowen, analyze this portfolio screenshot and provide insights:

            Given current market conditions:
            - BTC Dominance: ${marketData.btc_dominance}%
            - Market Cycle: ${this.identifyMarketCycleStep(marketData).stepDescription}
            - Risk Level: ${this.calculateRiskIndicator(marketData.btc_price, {currentValue: marketData.btc_price * 0.8}, []).zone}

            Please:
            1. Extract portfolio allocation percentages
            2. Assess alignment with current market cycle
            3. Identify over/under-exposures
            4. Recommend rebalancing based on my methodology
            5. Provide risk assessment for current allocation
            6. Suggest timeline for adjustments

            Be specific about percentages and actionable steps.
            `;

            const response = await query({
                prompt: this.systemPrompt + '\n\n' + prompt,
                options: { 
                    maxTurns: 1,
                    images: [{ data: imageBase64, mediaType: 'image/png' }]
                }
            });

            let portfolioAnalysis = {};
            for await (const message of response) {
                if (message.content) {
                    portfolioAnalysis.analysis = message.content;
                }
            }

            return {
                timestamp: new Date().toISOString(),
                imageAnalysis: portfolioAnalysis,
                recommendations: this.generatePortfolioRecommendations(marketData),
                riskAssessment: this.assessPortfolioRisk(marketData)
            };

        } catch (error) {
            console.error('Error analyzing portfolio image:', error);
            throw new Error('Failed to analyze portfolio image');
        }
    }

    // Helper methods
    getRiskZone(riskScore) {
        if (riskScore <= this.riskThresholds.ACCUMULATION) return 'ACCUMULATION';
        if (riskScore <= this.riskThresholds.MODERATE) return 'MODERATE';
        return 'SPECULATION';
    }

    interpretRisk(riskScore) {
        const zone = this.getRiskZone(riskScore);
        const interpretations = {
            ACCUMULATION: 'Low risk accumulation zone - favorable for building positions',
            MODERATE: 'Moderate risk zone - selective accumulation with caution',
            SPECULATION: 'High risk speculation zone - consider profit taking'
        };
        return interpretations[zone];
    }

    getRiskRecommendation(riskScore) {
        const zone = this.getRiskZone(riskScore);
        const recommendations = {
            ACCUMULATION: 'Increase BTC allocation, DCA strategy recommended',
            MODERATE: 'Maintain current allocation, monitor for breakouts',
            SPECULATION: 'Reduce risk, increase cash position, consider stops'
        };
        return recommendations[zone];
    }

    calculateVolatility(historicalData) {
        if (!historicalData || historicalData.length < 2) return 0.1;
        
        const returns = [];
        for (let i = 1; i < historicalData.length; i++) {
            returns.push((historicalData[i] - historicalData[i-1]) / historicalData[i-1]);
        }
        
        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
        
        return Math.sqrt(variance);
    }

    getMarketCycleMultiplier(historicalData) {
        // Simplified cycle detection - would need more sophisticated analysis
        return 0.1;
    }

    calculateTrend(historicalData) {
        if (!historicalData || historicalData.length < 2) return 'UNKNOWN';
        
        const recent = historicalData.slice(-5);
        const older = historicalData.slice(-10, -5);
        
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
        
        if (recentAvg > olderAvg * 1.02) return 'RISING';
        if (recentAvg < olderAvg * 0.98) return 'FALLING';
        return 'SIDEWAYS';
    }

    identifyBTCDCycle(btcDominance, ethBtcRatio) {
        if (btcDominance > 65) return 'BTC_DOMINANCE_PEAK';
        if (btcDominance > 55 && ethBtcRatio < 0.05) return 'BTC_ACCUMULATION';
        if (btcDominance < 45) return 'ALT_SEASON';
        return 'TRANSITION';
    }

    calculateAltseasonProbability(btcDominance, ethBtcRatio) {
        let probability = 0;
        
        if (btcDominance < 50) probability += 0.4;
        if (btcDominance < 45) probability += 0.3;
        if (ethBtcRatio > 0.06) probability += 0.2;
        if (ethBtcRatio > 0.08) probability += 0.1;
        
        return Math.min(probability, 0.95);
    }

    getBTCDTarget(currentDominance, historicalData) {
        // Simplified target calculation
        if (currentDominance > 60) return { target: 65, direction: 'UP' };
        if (currentDominance < 45) return { target: 50, direction: 'UP' };
        return { target: currentDominance, direction: 'SIDEWAYS' };
    }

    estimateStepTimeline(currentStep) {
        const timelines = {
            1: '3-6 months',
            2: '2-4 months', 
            3: '6-12 months',
            4: '4-8 months',
            5: '3-6 months',
            6: '12+ months'
        };
        return timelines[currentStep] || 'Unknown';
    }

    generatePortfolioRecommendations(marketData) {
        const riskLevel = this.calculateRiskIndicator(marketData.btc_price, {currentValue: marketData.btc_price * 0.8}, []);
        const cycle = this.identifyMarketCycleStep(marketData);
        
        const recommendations = {
            btc_allocation: 0,
            eth_allocation: 0,
            alt_allocation: 0,
            cash_allocation: 0,
            reasoning: ''
        };

        // Cowen's typical allocation based on risk and cycle
        if (riskLevel.zone === 'ACCUMULATION') {
            recommendations.btc_allocation = 70;
            recommendations.eth_allocation = 20;
            recommendations.alt_allocation = 5;
            recommendations.cash_allocation = 5;
            recommendations.reasoning = 'Low risk accumulation phase favors BTC heavy allocation';
        } else if (riskLevel.zone === 'MODERATE') {
            recommendations.btc_allocation = 50;
            recommendations.eth_allocation = 30;
            recommendations.alt_allocation = 15;
            recommendations.cash_allocation = 5;
            recommendations.reasoning = 'Moderate risk allows for diversified crypto exposure';
        } else {
            recommendations.btc_allocation = 30;
            recommendations.eth_allocation = 20;
            recommendations.alt_allocation = 10;
            recommendations.cash_allocation = 40;
            recommendations.reasoning = 'High risk speculation zone requires defensive positioning';
        }

        return recommendations;
    }

    assessPortfolioRisk(marketData) {
        const riskIndicator = this.calculateRiskIndicator(marketData.btc_price, {currentValue: marketData.btc_price * 0.8}, []);
        return {
            overallRisk: riskIndicator.riskScore,
            zone: riskIndicator.zone,
            factors: [
                'Current price level vs historical regression',
                'Market cycle positioning', 
                'BTC dominance trend',
                'Macro economic environment'
            ]
        };
    }

    calculateOverallConfidence(riskIndicator, btcdAnalysis, marketCycle) {
        let confidence = 0.5; // Base confidence
        
        if (riskIndicator.riskScore >= 0 && riskIndicator.riskScore <= 1) confidence += 0.2;
        if (btcdAnalysis.trend !== 'UNKNOWN') confidence += 0.15;
        if (marketCycle.confidence > 0.5) confidence += 0.15;
        
        return Math.min(confidence, 0.95);
    }
}

export default new BenjaminCowenAnalyzer();