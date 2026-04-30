class RuleEngine {
    constructor(rules) { this.rules = rules; }
    classifySubscription(subscription) {
        let classification = 'pending';
        for (const rule of this.rules) {
            let match = false;
            if (rule.condition === 'cost_gt') match = subscription.cost > rule.threshold;
            else if (rule.condition === 'cost_lt') match = subscription.cost < rule.threshold;
            else if (rule.condition === 'usage_lt') match = subscription.usageFrequency < rule.threshold;
            else if (rule.condition === 'usage_gt') match = subscription.usageFrequency > rule.threshold;
            if (match) classification = rule.classification;
        }
        return { classification, isActionable: ['waste','expensive','infrequent'].includes(classification) };
    }
    getRecommendation(c) {
        const r = { waste: 'Cancel this subscription - you are not using it!', expensive: 'Consider a cheaper alternative', infrequent: 'Switch to pay-per-use or cancel', essential: 'Keep this - great value!', good_value: 'Good find! Excellent value' };
        return r[c] || 'Review this subscription';
    }
}
module.exports = RuleEngine;
