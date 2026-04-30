import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function Rules() {
    const [rules, setRules] = useState([]);
    const [newRule, setNewRule] = useState({ name: '', condition: 'cost_gt', threshold: '', classification: 'waste' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => { fetchRules(); }, []);

    const fetchRules = async () => {
        try {
            const res = await API.get('/rules');
            setRules(res.data);
        } catch (err) {
            setError('Failed to load rules');
        }
    };

    const addRule = async (e) => {
        e.preventDefault();
        try {
            await API.post('/rules', { ...newRule, threshold: parseFloat(newRule.threshold) });
            setNewRule({ name: '', condition: 'cost_gt', threshold: '', classification: 'waste' });
            fetchRules();
        } catch (err) {
            setError('Failed to add rule');
        }
    };

    const deleteRule = async (id) => {
        await API.delete(`/rules/${id}`);
        fetchRules();
    };

    return (
        <div className="dashboard">
            <header>
                <h1>Classification Rules</h1>
                <button className="add-btn" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
            </header>

            {error && <p style={{color:'red'}}>{error}</p>}

            <div className="analytics-section">
                <h3>Add New Rule</h3>
                <form onSubmit={addRule} style={{display:'flex', flexWrap:'wrap', gap:'10px', marginTop:'15px'}}>
                    <input
                        placeholder="Rule Name (e.g. High Cost)"
                        value={newRule.name}
                        onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                        required
                        style={{flex:'1', minWidth:'150px', padding:'10px', borderRadius:'5px', border:'1px solid #ddd'}}
                    />
                    <select
                        value={newRule.condition}
                        onChange={(e) => setNewRule({...newRule, condition: e.target.value})}
                        style={{padding:'10px', borderRadius:'5px', border:'1px solid #ddd'}}
                    >
                        <option value="cost_gt">Cost greater than</option>
                        <option value="cost_lt">Cost less than</option>
                        <option value="usage_gt">Usage greater than</option>
                        <option value="usage_lt">Usage less than</option>
                    </select>
                    <input
                        type="number"
                        placeholder="Threshold"
                        value={newRule.threshold}
                        onChange={(e) => setNewRule({...newRule, threshold: e.target.value})}
                        required
                        style={{width:'120px', padding:'10px', borderRadius:'5px', border:'1px solid #ddd'}}
                    />
                    <select
                        value={newRule.classification}
                        onChange={(e) => setNewRule({...newRule, classification: e.target.value})}
                        style={{padding:'10px', borderRadius:'5px', border:'1px solid #ddd'}}
                    >
                        <option value="waste">Waste</option>
                        <option value="expensive">Expensive</option>
                        <option value="infrequent">Infrequent</option>
                        <option value="essential">Essential</option>
                        <option value="good_value">Good Value</option>
                    </select>
                    <button type="submit" style={{padding:'10px 20px', background:'#48bb78', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}>
                        Add Rule
                    </button>
                </form>
            </div>

            <div className="all-subscriptions">
                <h3>Your Rules ({rules.length})</h3>
                {rules.length === 0 && <p style={{color:'#888', marginTop:'10px'}}>No rules yet. Add rules above to classify your subscriptions.</p>}
                <div className="subscription-list">
                    {rules.map(rule => (
                        <div key={rule._id} className="subscription-card">
                            <h4>{rule.name}</h4>
                            <p style={{color:'#666', fontSize:'14px'}}>
                                If <strong>{rule.condition.replace('_', ' ')}</strong> {rule.threshold} → <strong>{rule.classification}</strong>
                            </p>
                            <button onClick={() => deleteRule(rule._id)}>Delete</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Rules;
