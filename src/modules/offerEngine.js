/**
 * Offer Engine — Generates personalized loan offers based on
 * risk assessment, income, and policy parameters
 */
import { logger, LOG_CATEGORIES } from '../utils/logger.js';
import { calculateEMI } from '../utils/helpers.js';

class OfferEngine {
  constructor() {
    this.offers = [];
  }

  generate(riskResult, applicationData, llmResult) {
    const income = applicationData.income || 30000;
    const employment = applicationData.employment || 'Salaried';
    const decision = riskResult.decision;
    const bureauScore = riskResult.bureauScore.score;
    const riskBand = llmResult?.riskBand?.band || 'Medium Risk';

    logger.log(LOG_CATEGORIES.OFFER, 'Generating loan offers', {
      income,
      bureau: bureauScore,
      decision,
      riskBand,
    });

    if (decision === 'declined') {
      this.offers = [];
      logger.log(LOG_CATEGORIES.OFFER, 'No offers — application declined');
      return this.offers;
    }

    // Calculate multipliers based on risk
    const multipliers = this._getMultipliers(bureauScore, employment, riskBand);
    const defaultTenure = 36;

    // Generate 3 tiered offers
    this.offers = [
      this._createOffer('Basic', {
        amount: Math.round(income * multipliers.basic / 10000) * 10000,
        rate: this._getRate(bureauScore, 'basic'),
        tenure: defaultTenure,
        processingFee: 2.0,
        tier: 1,
      }),
      this._createOffer('Recommended', {
        amount: Math.round(income * multipliers.recommended / 10000) * 10000,
        rate: this._getRate(bureauScore, 'recommended'),
        tenure: defaultTenure,
        processingFee: 1.5,
        tier: 2,
        recommended: true,
      }),
      this._createOffer('Premium', {
        amount: Math.round(income * multipliers.premium / 10000) * 10000,
        rate: this._getRate(bureauScore, 'premium'),
        tenure: defaultTenure,
        processingFee: 1.0,
        tier: 3,
      }),
    ];

    // Cap amounts for conditional approvals
    if (decision === 'conditionally-approved') {
      this.offers = this.offers.map(offer => ({
        ...offer,
        amount: Math.round(offer.amount * 0.7 / 10000) * 10000,
        conditions: ['Subject to additional documentation', 'Physical verification may be required'],
      }));
    }

    logger.log(LOG_CATEGORIES.OFFER, `Generated ${this.offers.length} offers`, {
      amounts: this.offers.map(o => o.amount),
      rates: this.offers.map(o => o.rate),
    });

    return this.offers;
  }

  _getMultipliers(bureau, employment, riskBand) {
    let base = { basic: 8, recommended: 15, premium: 24 };

    if (bureau >= 750) {
      base = { basic: 12, recommended: 20, premium: 30 };
    } else if (bureau >= 700) {
      base = { basic: 10, recommended: 18, premium: 25 };
    } else if (bureau < 650) {
      base = { basic: 5, recommended: 10, premium: 15 };
    }

    // Self-employed penalty
    if (employment === 'Self-Employed') {
      base.basic *= 0.8;
      base.recommended *= 0.8;
      base.premium *= 0.8;
    }

    return base;
  }

  _getRate(bureau, tier) {
    let baseRate;
    if (bureau >= 750) baseRate = 10.49;
    else if (bureau >= 700) baseRate = 12.49;
    else if (bureau >= 650) baseRate = 14.49;
    else baseRate = 16.99;

    // Tier adjustments
    if (tier === 'basic') return baseRate + 1.5;
    if (tier === 'premium') return Math.max(10.49, baseRate - 1.0);
    return baseRate;
  }

  _createOffer(name, config) {
    const tenureOptions = [12, 24, 36, 48, 60];
    const emiBreakdown = {};

    tenureOptions.forEach(months => {
      emiBreakdown[months] = calculateEMI(config.amount, config.rate, months);
    });

    return {
      id: `OFFER-${name.toUpperCase()}-${Date.now()}`,
      name,
      amount: config.amount,
      rate: config.rate,
      defaultTenure: config.tenure,
      tenureOptions,
      emiBreakdown,
      defaultEMI: emiBreakdown[config.tenure],
      processingFee: config.processingFee,
      processingFeeAmount: Math.round(config.amount * config.processingFee / 100),
      tier: config.tier,
      recommended: config.recommended || false,
      conditions: config.conditions || [],
      validity: '48 hours',
      createdAt: new Date().toISOString(),
    };
  }

  recalculateEMI(offerIndex, tenure) {
    if (this.offers[offerIndex]) {
      const offer = this.offers[offerIndex];
      return calculateEMI(offer.amount, offer.rate, tenure);
    }
    return 0;
  }

  getOffers() {
    return [...this.offers];
  }
}

export const offerEngine = new OfferEngine();
