import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, PieChart, Pie, Cell, Tooltip, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend
} from 'recharts';
import { orderServices } from '../services/api';

const COLORS = ['#2563eb', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];

const Dashboard = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [dateFilter, setDateFilter] = useState('ALL');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await orderServices.getOrders();
            setOrders(res.data || []);
        } catch (error) {
            console.error('Error loading dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    // --- KPI Calculations ---
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);
    const totalCustomers = new Set(orders.map(o => o.customer_name)).size;
    const totalQuantity = orders.reduce((sum, o) => sum + (parseInt(o.quantity) || 0), 0);

    // --- Monthly Revenue (bar chart) ---
    const monthlyRevenue = (() => {
        const months = {};
        orders.forEach(o => {
            let dateStr = o.created_at || o.order_date;
            if (!dateStr && o._id && o._id.length === 24) {
                dateStr = new Date(parseInt(o._id.substring(0, 8), 16) * 1000).toISOString();
            }
            if (!dateStr) return;
            const d = new Date(dateStr);
            const label = d.toLocaleString('default', { month: 'short' });
            months[label] = (months[label] || 0) + (parseFloat(o.total_amount) || 0);
        });
        // Ensure at least some months appear if data exists
        if (Object.keys(months).length === 0 && orders.length > 0) {
            return [{ month: 'Jan', revenue: 0 }];
        }
        return Object.entries(months).map(([month, revenue]) => ({ month, revenue: Number(revenue.toFixed(2)) }));
    })();

    // --- Status Overview (pie chart) ---
    const statusData = (() => {
        const counts = {};
        orders.forEach(o => {
            const s = o.status || 'Unknown';
            counts[s] = (counts[s] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    })();

    // --- Pending Orders Table ---
    const pendingOrders = orders.filter(o => (o.status || '').toLowerCase() === 'pending').slice(0, 5);

    const isAdmin = true;

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)' }}>
                Loading dashboard...
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#f0f2f4', minHeight: 'calc(100vh - 60px)' }}>
            {/* Main white card */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>

                {/* Header */}
                <div className="page-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>Customer Orders</h1>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>View and manage customer orders and details</p>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div style={{ display: 'flex', gap: '0', marginTop: '1rem', borderBottom: '2px solid var(--border)' }}>
                        {['dashboard', 'table'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '0.5rem 1.25rem',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                                    marginBottom: '-2px',
                                    color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                                    fontWeight: activeTab === tab ? 600 : 400,
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tab === 'dashboard' ? '▦' : '☰'} {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === 'dashboard' && (
                    <div className="page-content">

                        {orders.length === 0 ? (
                            /* ── Empty state: no data ── */
                            <div style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                justifyContent: 'center', padding: '6rem 2rem', textAlign: 'center'
                            }}>
                                <div style={{
                                    width: '72px', height: '72px', border: '1.5px solid #d1d5db',
                                    borderRadius: '12px', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', marginBottom: '1.25rem', backgroundColor: '#f9fafb'
                                }}>
                                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                                        stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 0.4rem' }}>
                                    Dashboard Not Configured
                                </h3>
                                <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0 0 1.5rem', maxWidth: '300px', lineHeight: 1.5 }}>
                                    Configure your dashboard to start viewing analytics.
                                </p>
                                <button
                                    onClick={() => navigate('/configure')}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.5rem 1.2rem', border: '1px solid #2563eb',
                                        borderRadius: '6px', background: 'white', color: '#2563eb',
                                        fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
                                    }}
                                >
                                    ⚙️ Configure dashboard
                                </button>
                            </div>
                        ) : (
                        <>
                        {/* Date Filter (top right) */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                🗓
                                <select
                                    className="form-select"
                                    style={{ width: '150px', fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                                    value={dateFilter}
                                    onChange={e => setDateFilter(e.target.value)}
                                >
                                    <option value="ALL">All time</option>
                                    <option value="TODAY">Today</option>
                                    <option value="LAST_7_DAYS">Last 7 Days</option>
                                    <option value="LAST_30_DAYS">Last 30 Days</option>
                                    <option value="LAST_90_DAYS">Last 90 Days</option>
                                </select>
                            </div>
                        </div>

                        {/* KPI Cards */}
                        <div className="grid-kpi">
                            {[
                                { label: 'Total Orders', value: totalOrders },
                                { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
                                { label: 'Total Customers', value: totalCustomers },
                                { label: 'Total Sold Quantity', value: totalQuantity },
                            ].map(({ label, value }) => (
                                <div
                                    key={label}
                                    className="kpi-card"
                                >
                                    <p className="kpi-label">{label}</p>
                                    <p className="kpi-value">{value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Charts Row */}
                        <div className="grid-charts">
                            {/* Bar Chart - Monthly Revenue */}
                            <div style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '1.25rem' }}>
                                <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-dark)' }}>Monthly Revenue</p>
                                {monthlyRevenue.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={monthlyRevenue} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                            <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v.toLocaleString('en-IN')}`} />
                                            <Tooltip formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
                                            <Bar dataKey="revenue" fill="#2563eb" radius={[3, 3, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                        No data available
                                    </div>
                                )}
                            </div>

                            {/* Pie Chart - Status Overview */}
                            <div style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '1.25rem' }}>
                                <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-dark)' }}>Status overview</p>
                                {statusData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <PieChart>
                                            <Pie
                                                data={statusData}
                                                cx="40%"
                                                cy="50%"
                                                outerRadius={90}
                                                dataKey="value"
                                                nameKey="name"
                                            >
                                                {statusData.map((entry, index) => (
                                                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend layout="vertical" align="right" verticalAlign="middle" iconType="square" wrapperStyle={{ fontSize: '0.8rem' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                        No data available
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pending Orders Table */}
                        <div style={{ border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
                            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                                <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-dark)' }}>Pending orders</p>
                            </div>
                            <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        {['Order ID', 'Quantity', 'Product', 'Total amount'].map(col => (
                                            <th key={col}>{col}</th>
                                        ))}
                                        {isAdmin && <th>Owner</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingOrders.length > 0 ? pendingOrders.map((order, i) => (
                                        <tr
                                            key={order._id || i}
                                            onClick={() => navigate('/orders')}
                                            style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background-color 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <td style={{ padding: '0.75rem 1.25rem', color: 'var(--text-muted)' }}>{order.order_id || order._id?.slice(-8)?.toUpperCase() || `ORD-${String(i + 1).padStart(4, '0')}`}</td>
                                            <td style={{ padding: '0.75rem 1.25rem' }}>{order.quantity}</td>
                                            <td style={{ padding: '0.75rem 1.25rem' }}>{order.product}</td>
                                            <td style={{ padding: '0.75rem 1.25rem' }}>₹ {parseFloat(order.total_amount || 0).toFixed(2)}</td>
                                            {isAdmin && <td style={{ padding: '0.75rem 1.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.owner_email || '-'}</td>}
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={isAdmin ? 5 : 4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No pending orders</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            </div>
                        </div>
                        </>
                        )}
                    </div>
                )}


                {activeTab === 'table' && (
                    <div className="page-content">
                        <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8fafc' }}>
                                    {['Order ID', 'Customer', 'Product', 'Quantity', 'Total Amount', 'Status'].map(col => (
                                        <th key={col} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>{col}</th>
                                    ))}
                                    {isAdmin && <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>Owner</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order, i) => (
                                    <tr key={order._id || i} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{order.order_id || `ORD-${String(i + 1).padStart(4, '0')}`}</td>
                                        <td style={{ padding: '0.75rem 1rem' }}>{order.customer_name || '-'}</td>
                                        <td style={{ padding: '0.75rem 1rem' }}>{order.product}</td>
                                        <td style={{ padding: '0.75rem 1rem' }}>{order.quantity}</td>
                                        <td style={{ padding: '0.75rem 1rem' }}>₹ {parseFloat(order.total_amount || 0).toFixed(2)}</td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            <span style={{
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '99px',
                                                fontSize: '0.75rem',
                                                fontWeight: 500,
                                                backgroundColor: order.status === 'Completed' ? '#d1fae5' : order.status === 'Pending' ? '#fef3c7' : '#dbeafe',
                                                color: order.status === 'Completed' ? '#059669' : order.status === 'Pending' ? '#b45309' : '#2563eb',
                                            }}>
                                                {order.status || 'Unknown'}
                                            </span>
                                        </td>
                                        {isAdmin && <td style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.owner_email || '-'}</td>}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
