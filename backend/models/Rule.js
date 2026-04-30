const mongoose = require('mongoose');
const RuleSchema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, name: { type: String, required: true }, condition: { type: String, enum: ['cost_gt','cost_lt','usage_lt','usage_gt','cycle_eq'], required: true }, threshold: { type: Number, required: true }, classification: { type: String, required: true }, isActive: { type: Boolean, default: true } });
module.exports = mongoose.model('Rule', RuleSchema);
