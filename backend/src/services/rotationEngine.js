import db from '../models/database.js';
import marketDataService from './marketDataService.js';

class RotationEngine {
    constructor() {
        // Phase definitions
        this.phases = {
            BTC_HEAVY: 'BTC_HEAVY',
            ETH_ROTATION: 'ETH_ROTATION',
            ALT_SEASON: 'ALT_SEASON',
            CASH_HEAVY: 'CASH_HEAVY'
        };

        // Thresholds based on PRD
        this.thresholds = {
            btc_dominance_high: 68,
            btc_dominance_climbing: 52,
            btc_dominance_low: 50,
            eth_btc_bounce_zone: [0.05, 0.053],
            min_consecutive_candles: 2
        };

        // Default allocations by phase
        this.defaultAllocations = {
            [this.phases.BTC_HEAVY]: {
                btc: 80,
                eth: 10,
                alt: 5,
                cash: 5
            },
            [this.phases.ETH_ROTATION]: {
                btc: 20,
                eth: 65,
                alt: 10,
                cash: 5
            },
            [this.phases.ALT_SEASON]: {
                btc: 10,
                eth: 20,
                alt: 65,
                cash: 5
            },
            [this.phases.CASH_HEAVY]: {
                btc: 25,
                eth: 25,
                alt: 0,
                cash: 50
            }
        };
    }

    // Get current phase from database or calculate if none exists
    async getCurrentPhase() {
        const latestPhase = db.getLatestPhase();
        if (latestPhase) {
            return latestPhase.phase;
        }
        
        // If no phase recorded, determine from current metrics
        const metrics = await marketDataService.fetchCurrentMetrics();
        return this.determinePhaseFromMetrics(metrics);
    }

    // Determine phase from market metrics
    determinePhaseFromMetrics(metrics) {
        const { btc_dominance, eth_btc_ratio, total3_eth_ratio } = metrics;

        // Cash heavy conditions (any 2 of these)
        const cashConditions = [
            btc_dominance < this.thresholds.btc_dominance_low && metrics.btc_dominance_trend === 'up',
            eth_btc_ratio < this.thresholds.eth_btc_bounce_zone[0],
            total3_eth_ratio < 0.5 && metrics.total3_eth_trend === 'down'
        ];
        const cashConditionsMet = cashConditions.filter(c => c).length >= 2;

        if (cashConditionsMet) {
            return this.phases.CASH_HEAVY;
        }

        // Alt season conditions (must meet all)
        if (
            btc_dominance < this.thresholds.btc_dominance_high &&
            eth_btc_ratio > this.thresholds.eth_btc_bounce_zone[1] &&
            total3_eth_ratio > 0.8 &&
            metrics.total3_eth_trend === 'up'
        ) {
            return this.phases.ALT_SEASON;
        }

        // ETH rotation conditions
        if (
            btc_dominance > this.thresholds.btc_dominance_high &&
            eth_btc_ratio >= this.thresholds.eth_btc_bounce_zone[0] &&
            eth_btc_ratio <= this.thresholds.eth_btc_bounce_zone[1]
        ) {
            return this.phases.ETH_ROTATION;
        }

        // Default to BTC heavy
        return this.phases.BTC_HEAVY;
    }

    // Check if phase transition should occur
    async checkPhaseTransition() {
        try {
            const currentPhase = await this.getCurrentPhase();
            const metrics = await marketDataService.fetchCurrentMetrics();
            const patterns = await marketDataService.checkCandlePatterns();
            
            let newPhase = null;
            let triggerConditions = {};

            // Phase-specific transition logic
            switch (currentPhase) {
                case this.phases.BTC_HEAVY:
                    newPhase = await this.checkBTCHeavyTransition(metrics, patterns);
                    break;
                case this.phases.ETH_ROTATION:
                    newPhase = await this.checkETHRotationTransition(metrics, patterns);
                    break;
                case this.phases.ALT_SEASON:
                    newPhase = await this.checkAltSeasonTransition(metrics, patterns);
                    break;
                case this.phases.CASH_HEAVY:
                    newPhase = await this.checkCashHeavyTransition(metrics, patterns);
                    break;
            }

            if (newPhase && newPhase !== currentPhase) {
                // Record phase transition
                const transition = {
                    from_phase: currentPhase,
                    to_phase: newPhase,
                    transition_timestamp: new Date().toISOString(),
                    btc_dominance_at_transition: metrics.btc_dominance,
                    eth_btc_ratio_at_transition: metrics.eth_btc_ratio,
                    total3_eth_ratio_at_transition: metrics.total3_eth_ratio,
                    trigger_conditions: this.getTransitionTriggers(currentPhase, newPhase, metrics, patterns)
                };

                db.recordPhaseTransition(transition);
                
                // Create alert
                db.createAlert({
                    alert_type: 'PHASE_TRANSITION',
                    phase: newPhase,
                    message: `Phase transition from ${currentPhase} to ${newPhase}`,
                    trigger_value: metrics.btc_dominance,
                    threshold_value: this.thresholds.btc_dominance_high
                });

                return {
                    transitioned: true,
                    from: currentPhase,
                    to: newPhase,
                    transition
                };
            }

            return {
                transitioned: false,
                currentPhase,
                metrics
            };
        } catch (error) {
            console.error('Error checking phase transition:', error);
            throw error;
        }
    }

    // Check transition from BTC Heavy
    async checkBTCHeavyTransition(metrics, patterns) {
        // Transition to ETH Rotation
        if (
            metrics.btc_dominance > this.thresholds.btc_dominance_high &&
            metrics.eth_btc_ratio >= this.thresholds.eth_btc_bounce_zone[0] &&
            patterns.eth_btc.trend !== 'bearish'
        ) {
            return this.phases.ETH_ROTATION;
        }

        // Direct transition to Cash Heavy if market turns bearish
        if (
            metrics.btc_24h_change < -10 &&
            metrics.eth_24h_change < -10 &&
            patterns.btc_usd.trend === 'bearish'
        ) {
            return this.phases.CASH_HEAVY;
        }

        return null;
    }

    // Check transition from ETH Rotation
    async checkETHRotationTransition(metrics, patterns) {
        // Transition to Alt Season
        if (
            metrics.btc_dominance < this.thresholds.btc_dominance_high &&
            metrics.eth_btc_ratio > this.thresholds.eth_btc_bounce_zone[1] &&
            metrics.total3_eth_ratio > 0.8 &&
            patterns.eth_btc.consecutive_candles >= this.thresholds.min_consecutive_candles &&
            patterns.eth_btc.latest_color === 'green'
        ) {
            return this.phases.ALT_SEASON;
        }

        // Transition back to BTC Heavy
        if (
            metrics.eth_btc_ratio < this.thresholds.eth_btc_bounce_zone[0] ||
            patterns.eth_btc.trend === 'bearish'
        ) {
            return this.phases.BTC_HEAVY;
        }

        return null;
    }

    // Check transition from Alt Season
    async checkAltSeasonTransition(metrics, patterns) {
        // Exit conditions for alt season (any 2 of these)
        const exitConditions = [
            metrics.btc_dominance > this.thresholds.btc_dominance_low && metrics.btc_dominance_trend === 'up',
            metrics.eth_btc_ratio < this.thresholds.eth_btc_bounce_zone[1],
            metrics.total3_eth_ratio < 0.7 && metrics.total3_eth_trend === 'down',
            patterns.eth_btc.consecutive_candles >= 2 && patterns.eth_btc.latest_color === 'red'
        ];

        const exitConditionsMet = exitConditions.filter(c => c).length >= 2;

        if (exitConditionsMet) {
            // Check if we should go to cash or back to ETH/BTC
            const altMetrics = await marketDataService.getAltcoinMetrics();
            
            if (altMetrics.avg_24h_change < -5 || metrics.total_market_cap_change < -3) {
                return this.phases.CASH_HEAVY;
            } else {
                return this.phases.ETH_ROTATION;
            }
        }

        return null;
    }

    // Check transition from Cash Heavy
    async checkCashHeavyTransition(metrics, patterns) {
        // Re-entry conditions
        if (
            metrics.btc_dominance > this.thresholds.btc_dominance_climbing &&
            patterns.btc_usd.trend === 'bullish' &&
            metrics.btc_24h_change > 2
        ) {
            return this.phases.BTC_HEAVY;
        }

        return null;
    }

    // Get recommended portfolio allocation
    async getRecommendedAllocation() {
        const currentPhase = await this.getCurrentPhase();
        const baseAllocation = this.defaultAllocations[currentPhase];
        
        // Get current metrics for fine-tuning
        const metrics = await marketDataService.fetchCurrentMetrics();
        
        // Fine-tune allocations based on market conditions
        const adjustedAllocation = this.adjustAllocation(baseAllocation, metrics, currentPhase);
        
        // Save allocation to database
        const allocation = {
            timestamp: new Date().toISOString(),
            phase: currentPhase,
            btc_allocation: adjustedAllocation.btc,
            eth_allocation: adjustedAllocation.eth,
            alt_allocation: adjustedAllocation.alt,
            cash_allocation: adjustedAllocation.cash,
            total_portfolio_value: null // To be calculated based on actual holdings
        };
        
        db.savePortfolioAllocation(allocation);
        
        return {
            phase: currentPhase,
            allocations: adjustedAllocation,
            metrics: metrics
        };
    }

    // Fine-tune allocations based on market conditions
    adjustAllocation(baseAllocation, metrics, phase) {
        const adjusted = { ...baseAllocation };
        
        // Increase cash allocation if market is very volatile
        if (Math.abs(metrics.btc_24h_change) > 10 || Math.abs(metrics.eth_24h_change) > 10) {
            adjusted.cash += 10;
            adjusted.alt -= 5;
            adjusted.eth -= 3;
            adjusted.btc -= 2;
        }
        
        // Adjust based on momentum
        if (phase === this.phases.ALT_SEASON && metrics.total3_eth_ratio > 1.0) {
            // Strong alt momentum
            adjusted.alt += 5;
            adjusted.eth -= 5;
        }
        
        // Ensure allocations sum to 100
        const total = adjusted.btc + adjusted.eth + adjusted.alt + adjusted.cash;
        if (total !== 100) {
            const factor = 100 / total;
            adjusted.btc *= factor;
            adjusted.eth *= factor;
            adjusted.alt *= factor;
            adjusted.cash *= factor;
        }
        
        return adjusted;
    }

    // Get transition triggers for logging
    getTransitionTriggers(fromPhase, toPhase, metrics, patterns) {
        return {
            from_phase: fromPhase,
            to_phase: toPhase,
            btc_dominance: metrics.btc_dominance,
            eth_btc_ratio: metrics.eth_btc_ratio,
            total3_eth_ratio: metrics.total3_eth_ratio,
            eth_btc_trend: patterns.eth_btc.trend,
            consecutive_candles: patterns.eth_btc.consecutive_candles,
            market_conditions: {
                btc_24h_change: metrics.btc_24h_change,
                eth_24h_change: metrics.eth_24h_change,
                total_market_cap_change: metrics.total_market_cap_change
            }
        };
    }

    // Get phase analysis with detailed reasoning
    async getPhaseAnalysis() {
        const currentPhase = await this.getCurrentPhase();
        const metrics = await marketDataService.fetchCurrentMetrics();
        const patterns = await marketDataService.checkCandlePatterns();
        const altMetrics = await marketDataService.getAltcoinMetrics();
        
        const analysis = {
            current_phase: currentPhase,
            phase_confidence: this.calculatePhaseConfidence(currentPhase, metrics, patterns),
            market_conditions: {
                btc_dominance: {
                    value: metrics.btc_dominance,
                    threshold: this.thresholds.btc_dominance_high,
                    status: metrics.btc_dominance > this.thresholds.btc_dominance_high ? 'high' : 'normal'
                },
                eth_btc_ratio: {
                    value: metrics.eth_btc_ratio,
                    bounce_zone: this.thresholds.eth_btc_bounce_zone,
                    in_bounce_zone: metrics.eth_btc_ratio >= this.thresholds.eth_btc_bounce_zone[0] && 
                                   metrics.eth_btc_ratio <= this.thresholds.eth_btc_bounce_zone[1]
                },
                altcoin_strength: {
                    total3_eth_ratio: metrics.total3_eth_ratio,
                    avg_performance: altMetrics.avg_7d_change,
                    top_performers: altMetrics.top_performers.slice(0, 5)
                }
            },
            technical_signals: {
                eth_btc_candles: patterns.eth_btc,
                btc_usd_candles: patterns.btc_usd
            },
            next_phase_probability: this.calculateNextPhaseProbability(currentPhase, metrics, patterns),
            recommended_actions: this.getRecommendedActions(currentPhase, metrics)
        };
        
        return analysis;
    }

    // Calculate confidence in current phase
    calculatePhaseConfidence(phase, metrics, patterns) {
        let confidence = 50; // Base confidence
        
        switch (phase) {
            case this.phases.BTC_HEAVY:
                if (metrics.btc_dominance > this.thresholds.btc_dominance_climbing) confidence += 20;
                if (patterns.btc_usd.trend === 'bullish') confidence += 15;
                if (metrics.eth_btc_ratio < this.thresholds.eth_btc_bounce_zone[0]) confidence += 15;
                break;
                
            case this.phases.ETH_ROTATION:
                if (metrics.eth_btc_ratio >= this.thresholds.eth_btc_bounce_zone[0] &&
                    metrics.eth_btc_ratio <= this.thresholds.eth_btc_bounce_zone[1]) confidence += 25;
                if (patterns.eth_btc.trend === 'bullish') confidence += 25;
                break;
                
            case this.phases.ALT_SEASON:
                if (metrics.total3_eth_ratio > 0.8) confidence += 20;
                if (metrics.btc_dominance < this.thresholds.btc_dominance_high) confidence += 20;
                if (patterns.eth_btc.trend === 'bullish') confidence += 10;
                break;
                
            case this.phases.CASH_HEAVY:
                if (metrics.btc_24h_change < -5 && metrics.eth_24h_change < -5) confidence += 30;
                if (patterns.btc_usd.trend === 'bearish') confidence += 20;
                break;
        }
        
        return Math.min(confidence, 100);
    }

    // Calculate probability of transitioning to next phase
    calculateNextPhaseProbability(currentPhase, metrics, patterns) {
        const probabilities = {};
        
        // Initialize all phases with 0 probability
        Object.values(this.phases).forEach(phase => {
            if (phase !== currentPhase) {
                probabilities[phase] = 0;
            }
        });
        
        // Calculate based on current phase and conditions
        switch (currentPhase) {
            case this.phases.BTC_HEAVY:
                if (metrics.btc_dominance > 65) probabilities[this.phases.ETH_ROTATION] += 40;
                if (metrics.eth_btc_ratio > 0.048) probabilities[this.phases.ETH_ROTATION] += 30;
                if (metrics.btc_24h_change < -5) probabilities[this.phases.CASH_HEAVY] += 20;
                break;
                
            case this.phases.ETH_ROTATION:
                if (metrics.total3_eth_ratio > 0.7) probabilities[this.phases.ALT_SEASON] += 30;
                if (patterns.eth_btc.consecutive_candles >= 2) probabilities[this.phases.ALT_SEASON] += 30;
                if (metrics.eth_btc_ratio < 0.05) probabilities[this.phases.BTC_HEAVY] += 40;
                break;
                
            case this.phases.ALT_SEASON:
                if (metrics.btc_dominance > 50) probabilities[this.phases.CASH_HEAVY] += 30;
                if (patterns.eth_btc.trend === 'bearish') probabilities[this.phases.ETH_ROTATION] += 40;
                break;
                
            case this.phases.CASH_HEAVY:
                if (patterns.btc_usd.trend === 'bullish') probabilities[this.phases.BTC_HEAVY] += 50;
                if (metrics.btc_24h_change > 3) probabilities[this.phases.BTC_HEAVY] += 30;
                break;
        }
        
        return probabilities;
    }

    // Get recommended actions based on current phase and metrics
    getRecommendedActions(phase, metrics) {
        const actions = [];
        
        switch (phase) {
            case this.phases.BTC_HEAVY:
                actions.push('Maintain high BTC allocation (70-90%)');
                actions.push('Monitor ETH/BTC ratio for bounce signals');
                if (metrics.btc_dominance > 65) {
                    actions.push('Prepare for potential ETH rotation');
                }
                break;
                
            case this.phases.ETH_ROTATION:
                actions.push('Shift allocation to ETH (60-70%)');
                actions.push('Begin researching strong altcoin candidates');
                actions.push('Watch for TOTAL3/ETH breakout');
                break;
                
            case this.phases.ALT_SEASON:
                actions.push('Maximize altcoin exposure (60-80%)');
                actions.push('Focus on mid and low-cap alts with strong ETH pairs');
                actions.push('Set stop-losses to protect gains');
                actions.push('Monitor exit signals closely');
                break;
                
            case this.phases.CASH_HEAVY:
                actions.push('Maintain high cash/stablecoin allocation (50%)');
                actions.push('Wait for clear re-entry signals');
                actions.push('Consider DCA into BTC if trend reverses');
                break;
        }
        
        return actions;
    }
}

export default new RotationEngine();