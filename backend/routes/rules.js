const express = require('express');
const auth = require('../middleware/auth');
const Rule = require('../models/Rule');
const router = express.Router();
router.get('/', auth, async (req, res) => {
    try { res.json(await Rule.find({ user: req.user.id })); } catch (err) { res.status(500).json({ message: err.message }); }
});
router.post('/', auth, async (req, res) => {
    try { const rule = new Rule({ ...req.body, user: req.user.id }); await rule.save(); res.status(201).json(rule); }
    catch (err) { res.status(500).json({ message: err.message }); }
});
router.delete('/:id', auth, async (req, res) => {
    try { await Rule.deleteOne({ _id: req.params.id, user: req.user.id }); res.json({ message: 'Deleted' }); }
    catch (err) { res.status(500).json({ message: err.message }); }
});
module.exports = router;
