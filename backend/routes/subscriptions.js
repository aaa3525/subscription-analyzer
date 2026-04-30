const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Subscription = require('../models/Subscription');
const Rule = require('../models/Rule');
const RuleEngine = require('../utils/ruleEngine');
const router = express.Router();

router.get('/', auth, async (req, res) => {
    try { const s = await Subscription.find({ user: req.user.id }); res.json(s); }
    catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
    try {
        const { name, cost, billingCycle, usageFrequency } = req.body;
        const subscription = new Subscription({ user: req.user.id, name, cost, billingCycle: billingCycle || 'monthly', usageFrequency: usageFrequency || 50, classification: 'pending' });
        const userRules = await Rule.find({ user: req.user.id, isActive: true });
        const engine = new RuleEngine(userRules);
        const result = engine.classifySubscription(subscription);
        subscription.classification = result.classification;
        await subscription.save();
        res.status(201).json({ subscription, recommendation: engine.getRecommendation(result.classification) });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const subscription = await Subscription.findOne({ _id: req.params.id, user: req.user.id });
        if (!subscription) return res.status(404).json({ message: 'Not found' });
        Object.assign(subscription, req.body);
        const userRules = await Rule.find({ user: req.user.id, isActive: true });
        const engine = new RuleEngine(userRules);
        subscription.classification = engine.classifySubscription(subscription).classification;
        await subscription.save();
        res.json(subscription);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
    try { await Subscription.deleteOne({ _id: req.params.id, user: req.user.id }); res.json({ message: 'Deleted' }); }
    catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/analytics/spending-by-classification', auth, async (req, res) => {
    try {
        const result = await Subscription.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(req.user.id), isActive: true } },
            { $group: { _id: '$classification', totalCost: { $sum: '$cost' }, count: { $sum: 1 }, avgCost: { $avg: '$cost' } } },
            { $sort: { totalCost: -1 } }
        ]);
        res.json(result);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/analytics/actionable', auth, async (req, res) => {
    try {
        const subs = await Subscription.find({ user: req.user.id, classification: { $in: ['waste','expensive','infrequent'] }, isActive: true }).sort({ cost: -1 });
        res.json(subs);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
