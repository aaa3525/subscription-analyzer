import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

function Dashboard() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [analytics, setAnalytics] = useState([]);
    const [actionable, setActionable] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [filterBy, setFilterBy] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [newSub, setNewSub] = useState({ name: '', cost: '', billingCycle: 'monthly', usageFrequency: 50 });
    const [recommendation, setRecommendation] = useState('');
    const navigate = useNavigate();

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [subsRes, analyticsRes, actionableRes] = await Promise.all([
                API.get('/subscriptions'),
                API.get('/subscriptions/analytics/spending-by-classification'),
                API.get('/subscriptions/analytics/actionable')
            ]);
            setSubscriptions(subsRes.data);
            setAnalytics(analyticsRes.data);
            setActionable(actionableRes.data);
        } catch (err) {
            console.error('Failed to fetch data', err);
        }
    };

    const addSubscription = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post('/subscriptions', {
                ...newSub,
                cost: parseFloat(newSub.cost),
                usageFrequency: parseInt(newSub.usageFrequency)
            });
            setRecommendation(res.data.recommendation);
            setNewSub({ name: '', cost: '', billingCycle: 'monthly', usageFrequency: 50 });
            setShowAddForm(false);
            fetchData();
        } catch (err) {
            alert('Failed to add subscription');
        }
    };

    const deleteSubscription = async (id) => {
        if (window.confirm('Delete this subscription?')) {
            await API.delete(`/subscriptions/${id}`);
            fetchData();
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const getColor = (classification) => {
        const colors = {
            waste: '#dc3545',
            expensive: '#fd7e14',
            infrequent: '#ffc107',
            essential: '#28a745',
            good_value: '#17a2b8',
            pending: '#6c757d'
        };
        return colors[classification] || '#6c757d';
    };

    const filteredAndSorted = subscriptions
        .filter(sub => filterBy === 'all' || sub.classification === filterBy)
        .sort((a, b) => {
            if (sortBy === 'cost') return b.cost - a.cost;
            if (sortBy === 'usage') return b.usageFrequency - a.usageFrequency;
            return a.name.localeCompare(b.name);
        });

    const totalMonthly = subscriptions.reduce((sum, s) => sum + s.cost, 0);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <div className="dashboard">
            <header>
                <div>
                    <h1>Subscription Analyzer</h1>
                    <small style={{color:'#666'}}>Welcome, {user.name}</small>
                </div>
                <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
                    <Link to="/rules">
                        <button className="add-btn" style={{background:'#4299e1'}}>Manage Rules</button>
                    </Link>
                    <button className="add-btn" onClick={() => setShowAddForm(!showAddForm)}>+ Add Subscription</button>
                    <button className="add-btn" style={{background:'#e53e3e'}} onClick={handleLogout}>Logout</button>
                </div>
            </header>

            <div className="analytics-cards" style={{marginBottom:'20px'}}>
                <div className="analytic-card" style={{borderLeft:'4px solid #667eea', background:'white', padding:'15px', borderRadius:'8px'}}>
                    <h4 style={{color:'#888', fontSize:'13px'}}>TOTAL MONTHLY</h4>
                    <p style={{fontSize:'24px', fontWeight:'bold'}}>${totalMonthly.toFixed(2)}</p>
                </div>
                <div className="analytic-card" style={{borderLeft:'4px solid #48bb78', background:'white', padding:'15px', borderRadius:'8px'}}>
                    <h4 style={{color:'#888', fontSize:'13px'}}>TOTAL SUBSCRIPTIONS</h4>
                    <p style={{fontSize:'24px', fontWeight:'bold'}}>{subscriptions.length}</p>
                </div>
                <div className="analytic-card" style={{borderLeft:'4px solid #dc3545', background:'white', padding:'15px', borderRadius:'8px'}}>
                    <h4 style={{color:'#888', fontSize:'13px'}}>ACTION NEEDED</h4>
                    <p style={{fontSize:'24px', fontWeight:'bold'}}>{actionable.length}</p>
                </div>
            </div>

            {recommendation && (
                <div style={{background:'#ebf8ff', border:'1px solid #bee3f8', padding:'15px', borderRadius:'8px', marginBottom:'20px'}}>
                    <strong>Recommendation:</strong> {recommendation}
                    <button onClick={() => setRecommendation('')} style={{float:'right', background:'none', border:'none', cursor:'pointer', fontSize:'18px'}}>×</button>
                </div>
            )}

            {showAddForm && (
                <div className="analytics-section">
                    <h3>Add New Subscription</h3>
                    <form onSubmit={addSubscription} style={{marginTop:'15px'}}>
                        <input
                            placeholder="Name (e.g. Netflix, Spotify...)"
                            value={newSub.name}
                            onChange={(e) => setNewSub({...newSub, name: e.target.value})}
                            required
                            style={{width:'100%', padding:'10px', marginBottom:'10px', borderRadius:'5px', border:'1px solid #ddd'}}
                        />
                        <input
                            type="number"
                            placeholder="Monthly Cost ($)"
                            value={newSub.cost}
                            onChange={(e) => setNewSub({...newSub, cost: e.target.value})}
                            required
                            style={{width:'100%', padding:'10px', marginBottom:'10px', borderRadius:'5px', border:'1px solid #ddd'}}
                        />
                        <select
                            value={newSub.billingCycle}
                            onChange={(e) => setNewSub({...newSub, billingCycle: e.target.value})}
                            style={{width:'100%', padding:'10px', marginBottom:'10px', borderRadius:'5px', border:'1px solid #ddd'}}
                        >
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                            <option value="weekly">Weekly</option>
                        </select>
                        <label style={{display:'block', marginBottom:'5px'}}>
                            Usage Frequency: <strong>{newSub.usageFrequency}%</strong>
                        </label>
                        <input
                            type="range" min="0" max="100"
                            value={newSub.usageFrequency}
                            onChange={(e) => setNewSub({...newSub, usageFrequency: parseInt(e.target.value)})}
                            style={{width:'100%', marginBottom:'15px'}}
                        />
                        <div style={{display:'flex', gap:'10px'}}>
                            <button type="submit" style={{flex:1, padding:'10px', background:'#48bb78', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}>
                                Save and Classify
                            </button>
                            <button type="button" onClick={() => setShowAddForm(false)} style={{flex:1, padding:'10px', background:'#e53e3e', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="analytics-section">
                <h3>Spending by Classification</h3>
                {analytics.length === 0 && <p style={{color:'#888', marginTop:'10px'}}>No data yet.</p>}
                <div className="analytics-cards">
                    {analytics.map(a => (
                        <div key={a._id} className="analytic-card" style={{borderLeft:`4px solid ${getColor(a._id)}`}}>
                            <h4 style={{textTransform:'capitalize', color:'#555'}}>{a._id}</h4>
                            <p style={{fontSize:'20px', fontWeight:'bold'}}>${a.totalCost.toFixed(2)}/mo</p>
                            <small>{a.count} sub{a.count !== 1 ? 's' : ''} | Avg: ${a.avgCost.toFixed(2)}</small>
                        </div>
                    ))}
                </div>
            </div>

            {actionable.length > 0 && (
                <div className="actionable-section">
                    <h3>⚠️ Action Needed — {actionable.length} subscription{actionable.length !== 1 ? 's' : ''} to review</h3>
                    <div className="subscription-list">
                        {actionable.map(sub => (
                            <div key={sub._id} className="subscription-card actionable">
                                <h4>{sub.name}</h4>
                                <p style={{fontWeight:'bold'}}>${sub.cost.toFixed(2)}/month</p>
                                <span className="badge" style={{background: getColor(sub.classification)}}>{sub.classification}</span>
                                <p style={{fontSize:'13px', color:'#666', marginTop:'5px'}}>Usage: {sub.usageFrequency}%</p>
                                <button onClick={() => deleteSubscription(sub._id)}>Cancel Subscription</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="all-subscriptions">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'10px', marginBottom:'15px'}}>
                    <h3>All Subscriptions ({filteredAndSorted.length})</h3>
                    <div style={{display:'flex', gap:'10px'}}>
                        <select
                            value={filterBy}
                            onChange={(e) => setFilterBy(e.target.value)}
                            style={{padding:'8px', borderRadius:'5px', border:'1px solid #ddd'}}
                        >
                            <option value="all">All Classifications</option>
                            <option value="essential">Essential</option>
                            <option value="waste">Waste</option>
                            <option value="expensive">Expensive</option>
                            <option value="infrequent">Infrequent</option>
                            <option value="good_value">Good Value</option>
                            <option value="pending">Pending</option>
                        </select>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{padding:'8px', borderRadius:'5px', border:'1px solid #ddd'}}
                        >
                            <option value="name">Sort by Name</option>
                            <option value="cost">Sort by Cost</option>
                            <option value="usage">Sort by Usage</option>
                        </select>
                    </div>
                </div>
                {filteredAndSorted.length === 0 && <p style={{color:'#888'}}>No subscriptions found.</p>}
                <div className="subscription-list">
                    {filteredAndSorted.map(sub => (
                        <div key={sub._id} className="subscription-card">
                            <h4>{sub.name}</h4>
                            <p style={{fontWeight:'bold'}}>${sub.cost.toFixed(2)}/month</p>
                            <span className="badge" style={{background: getColor(sub.classification)}}>{sub.classification}</span>
                            <p style={{fontSize:'13px', color:'#666', marginTop:'5px'}}>Usage: {sub.usageFrequency}% | {sub.billingCycle}</p>
                            <button onClick={() => deleteSubscription(sub._id)}>Delete</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
