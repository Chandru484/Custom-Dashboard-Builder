import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, PieChart, Pie, Cell, Tooltip, XAxis, YAxis,
    CartesianGrid, ResponsiveContainer, Legend
} from 'recharts';
import { orderServices } from '../services/api';
import OrderFormModal from '../components/CustomerOrder/OrderFormModal';
import { Plus, Edit2, Trash2, MoreVertical } from 'lucide-react';

const COLORS = ['#2563eb', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];

const CustomerOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [dateFilter, setDateFilter] = useState('ALL');

    // Modal / context menu state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await orderServices.getOrders();
            setOrders(res.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await orderServices.deleteOrder(id);
            fetchOrders();
        } catch (e) {
            console.error(e);
        }
        setActiveMenuId(null);
    };

    const handleModalClose = (wasSaved) => {
        setIsModalOpen(false);
        if (wasSaved) fetchOrders();
    };

    // ── KPI ──────────────────────────────────────────────
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((s, o) => s + (parseFloat(o.total_amount) || 0), 0);
    const totalCustomers = new Set(orders.map(o => o.customer_name)).size;
    const totalQuantity = orders.reduce((s, o) => s + (parseInt(o.quantity) || 0), 0);

    // ── Monthly Revenue ───────────────────────────────────
    const monthlyRevenue = (() => {
        const m = {};
        orders.forEach(o => {
            let ds = o.created_at || o.order_date;
            if (!ds && o._id?.length === 24)
                ds = new Date(parseInt(o._id.substring(0, 8), 16) * 1000).toISOString();
            if (!ds) return;
            const label = new Date(ds).toLocaleString('default', { month: 'short' });
            m[label] = (m[label] || 0) + (parseFloat(o.total_amount) || 0);
        });
        return Object.entries(m).map(([month, revenue]) => ({ month, revenue: +revenue.toFixed(2) }));
    })();

    // ── Status Overview ───────────────────────────────────
    const statusData = (() => {
        const c = {};
        orders.forEach(o => { const s = o.status || 'Unknown'; c[s] = (c[s] || 0) + 1; });
        return Object.entries(c).map(([name, value]) => ({ name, value }));
    })();

    // ── Pending orders ────────────────────────────────────
    const pendingOrders = orders.filter(o => (o.status || '').toLowerCase() === 'pending').slice(0, 5);

    // ── Search filter ─────────────────────────────────
    const filteredOrders = orders.filter(o => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            (o.order_id || '').toLowerCase().includes(q) ||
            (o.customer_name || `${o.first_name || ''} ${o.last_name || ''}`).toLowerCase().includes(q) ||
            (o.product || '').toLowerCase().includes(q) ||
            (o.status || '').toLowerCase().includes(q)
        );
    });

    // ── Helpers ───────────────────────────────────────────
    const fmt = (v) => `₹${parseFloat(v || 0).toFixed(2)}`;
    const orderId = (o, i) => o.order_id || `ORD-${String(i + 1).padStart(4, '0')}`;
    const statusBadge = (status) => {
        const map = {
            Completed: { bg: '#d1fae5', color: '#059669' },
            Pending:   { bg: '#fef3c7', color: '#b45309' },
            'In progress': { bg: '#dbeafe', color: '#2563eb' },
        };
        const s = map[status] || { bg: '#f1f5f9', color: '#64748b' };
        return (
            <span style={{ padding: '0.2rem 0.6rem', borderRadius: 99, fontSize: '0.75rem', fontWeight: 500, backgroundColor: s.bg, color: s.color }}>
                {status || 'Unknown'}
            </span>
        );
    };

    const isAdmin = true;

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)' }}>
            Loading...
        </div>
    );

    return (
        <div style={{ backgroundColor: '#f0f2f4', minHeight: 'calc(100vh - 60px)' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>

                {/* ── Header ─────────────────────────────── */}
                <div className="page-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>Customer Orders</h1>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>View and manage customer orders and details</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', marginTop: '1rem', borderBottom: '2px solid var(--border)' }}>
                        {['dashboard', 'table'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} style={{
                                padding: '0.5rem 1.25rem', background: 'none', border: 'none',
                                borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                                marginBottom: '-2px',
                                color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                                fontWeight: activeTab === tab ? 600 : 400, fontSize: '0.875rem', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s'
                            }}>
                                {tab === 'dashboard' ? '▦' : '☰'} {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Dashboard Tab ───────────────────────── */}
                {activeTab === 'dashboard' && (
                    <div className="page-content">

                        {/* Date filter */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                🗓
                                <select className="form-select" style={{ width: '150px', fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                                    value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
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
                                <div key={label} className="kpi-card">
                                    <p className="kpi-label">{label}</p>
                                    <p className="kpi-value">{value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Charts */}
                        <div className="grid-charts">
                            {/* Bar – Monthly Revenue */}
                            <div style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '1.25rem' }}>
                                <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-dark)' }}>Monthly Revenue</p>
                                {monthlyRevenue.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={monthlyRevenue}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                            <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v.toLocaleString('en-IN')}`} />
                                            <Tooltip formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
                                            <Bar dataKey="revenue" fill="#2563eb" radius={[3, 3, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No data available</div>
                                )}
                            </div>

                            {/* Pie – Status Overview */}
                            <div style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '1.25rem' }}>
                                <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-dark)' }}>Status overview</p>
                                {statusData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <PieChart>
                                            <Pie data={statusData} cx="40%" cy="50%" outerRadius={90} dataKey="value" nameKey="name">
                                                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip />
                                            <Legend layout="vertical" align="right" verticalAlign="middle" iconType="square" wrapperStyle={{ fontSize: '0.8rem' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No data available</div>
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
                                    {pendingOrders.length > 0 ? pendingOrders.map((o, i) => (
                                        <tr key={o._id || i} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                            <td style={{ padding: '0.75rem 1.25rem', color: 'var(--text-muted)' }}>{orderId(o, i)}</td>
                                            <td style={{ padding: '0.75rem 1.25rem' }}>{o.quantity}</td>
                                            <td style={{ padding: '0.75rem 1.25rem' }}>{o.product}</td>
                                            <td style={{ padding: '0.75rem 1.25rem' }}>{fmt(o.total_amount)}</td>
                                            {isAdmin && <td style={{ padding: '0.75rem 1.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.owner_email || '-'}</td>}
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={isAdmin ? 5 : 4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No pending orders</td></tr>
                                    )}
                                </tbody>
                            </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Table Tab ───────────────────────────── */}
                {activeTab === 'table' && (
                    <div className="page-content">
                        {/* Header row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-dark)' }}>All Orders</h3>
                            <button className="btn btn-primary" onClick={() => { setSelectedOrder(null); setIsModalOpen(true); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                                <Plus size={15} /> Create Order
                            </button>
                        </div>

                        {/* Search bar */}
                        <div style={{ position: 'relative', marginBottom: '1rem' }}>
                            <span style={{
                                position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                                color: 'var(--text-muted)', pointerEvents: 'none', display: 'flex', alignItems: 'center'
                            }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search by customer, product, order ID or status…"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{ paddingLeft: '2.25rem', paddingRight: searchQuery ? '2.25rem' : '0.75rem' }}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    style={{
                                        position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                                        fontSize: '1rem', lineHeight: 1, padding: '0.1rem 0.3rem', borderRadius: '50%'
                                    }}
                                    aria-label="Clear search"
                                >×</button>
                            )}
                        </div>
                        {orders.length === 0 ? (
                            /* ── Empty State ── */
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem', textAlign: 'center' }}>
                                <div style={{ width: '72px', height: '72px', backgroundColor: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                                        <rect x="9" y="3" width="6" height="4" rx="1" />
                                        <path d="M9 12h6M9 16h4" />
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: '0 0 0.5rem' }}>No orders yet</h3>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 1.5rem', maxWidth: '340px' }}>
                                    You haven't created any orders yet. Click below to get started.
                                </p>
                                <button
                                    onClick={() => { setSelectedOrder(null); setIsModalOpen(true); }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.4rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    <Plus size={15} /> Create Order
                                </button>
                            </div>
                        ) : (
                            <div className="table-responsive" style={{ border: '1px solid var(--border)', borderRadius: '6px' }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            {['Order ID', 'Customer', 'Product', 'Quantity', 'Total Amount', 'Status'].map((col, i) => (
                                                <th key={i}>{col}</th>
                                            ))}
                                            {isAdmin && <th>Owner</th>}
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.length === 0 ? (
                                            <tr>
                                                <td colSpan={isAdmin ? 8 : 7} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                    No orders match &ldquo;{searchQuery}&rdquo;
                                                </td>
                                            </tr>
                                        ) : filteredOrders.map((o, i) => (
                                            <tr key={o._id || i} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{orderId(o, i)}</td>
                                                <td style={{ padding: '0.75rem 1rem' }}>{o.customer_name || `${o.first_name || ''} ${o.last_name || ''}`.trim() || '-'}</td>
                                                <td style={{ padding: '0.75rem 1rem' }}>{o.product}</td>
                                                <td style={{ padding: '0.75rem 1rem' }}>{o.quantity}</td>
                                                <td style={{ padding: '0.75rem 1rem' }}>{fmt(o.total_amount)}</td>
                                                <td style={{ padding: '0.75rem 1rem' }}>{statusBadge(o.status)}</td>
                                                {isAdmin && <td style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.owner_email || '-'}</td>}
                                                <td style={{ padding: '0.75rem 1rem', position: 'relative' }}>
                                                    <button className="btn-icon" onClick={() => setActiveMenuId(activeMenuId === o._id ? null : o._id)}>
                                                        <MoreVertical size={15} />
                                                    </button>
                                                    {activeMenuId === o._id && (
                                                        <div style={{ position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, minWidth: '120px', padding: '0.25rem 0' }}>
                                                            <button style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dark)', fontSize: '0.85rem' }}
                                                                onClick={() => { setSelectedOrder(o); setIsModalOpen(true); setActiveMenuId(null); }}>
                                                                 <Edit2 size={13} /> Edit
                                                            </button>
                                                            <button style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: '0.85rem' }}
                                                                onClick={() => handleDelete(o._id)}>
                                                                <Trash2 size={13} /> Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <OrderFormModal order={selectedOrder} onClose={handleModalClose} />
            )}
        </div>
    );
};

export default CustomerOrders;
