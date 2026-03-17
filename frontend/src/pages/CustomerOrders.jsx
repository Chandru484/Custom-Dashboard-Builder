import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, PieChart, Pie, Cell, Tooltip, XAxis, YAxis,
    CartesianGrid, ResponsiveContainer, Legend
} from 'recharts';
import { orderServices } from '../services/api';
import OrderFormModal from '../components/CustomerOrder/OrderFormModal';
import { Plus, Edit2, Trash2, MoreVertical } from 'lucide-react';

const COLORS = ['#16a34a', '#eab308', '#2563eb', '#ef4444', '#8b5cf6'];

import { useToast } from '../context/ToastContext';

const CustomerOrders = () => {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

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
            showToast("Failed to load orders.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await orderServices.deleteOrder(id);
            showToast("Order deleted successfully!", "success");
            fetchOrders();
        } catch (e) {
            console.error(e);
            showToast("Failed to delete order.", "error");
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

    // ── Pagination/Filter State ──────────────────────────
    const [statusFilter, setStatusFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('All time');

    // ── Search filter ─────────────────────────────────
    const filteredOrders = orders.filter(o => {
        // Status Filter
        const matchesStatus = statusFilter === 'All' || (o.status || '').toLowerCase() === statusFilter.toLowerCase();
        if (!matchesStatus) return false;

        // Date Filter
        const matchesDate = (() => {
            if (dateFilter === 'All time') return true;
            let ds = o.created_at || o.order_date;
            if (!ds && o._id?.length === 24)
                ds = new Date(parseInt(o._id.substring(0, 8), 16) * 1000).toISOString();
            if (!ds) return false;
            
            const orderDate = new Date(ds);
            const now = new Date();
            const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24);

            if (dateFilter === 'Last 7 days') return diffDays <= 7;
            if (dateFilter === 'Last 30 days') return diffDays <= 30;
            if (dateFilter === 'This Month') return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
            if (dateFilter === 'This Year') return orderDate.getFullYear() === now.getFullYear();
            return true;
        })();
        if (!matchesDate) return false;

        // Search Query
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
        const s = (status || 'Unknown').toLowerCase();
        let className = 'status-pill';
        if (s === 'pending') className += ' status-pending';
        else if (s === 'delivered' || s === 'completed') className += ' status-delivered';
        else if (s === 'in progress' || s === 'processing' || s === 'shipped') className += ' status-processing';
        else if (s === 'cancelled') className += ' status-cancelled';
        else className += ' status-neutral';

        return (
            <span className={className}>
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
        <div style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 60px)', padding: '1.5rem' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid var(--border)' }}>

                {/* ── Filter & Utility Bar ────────────────── */}
                <div className="order-filter-bar">
                    <div className="order-filter-group">
                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '0.25rem 0.75rem', marginRight: '1rem', border: '1px solid var(--border)' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>Date</span>
                            <select 
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                style={{ border: 'none', background: 'none', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', cursor: 'pointer', outline: 'none' }}
                            >
                                <option>All time</option>
                                <option>Last 7 days</option>
                                <option>Last 30 days</option>
                                <option>This Month</option>
                                <option>This Year</option>
                            </select>
                        </div>

                        {['All', 'Pending', 'In Progress', 'Completed'].map(status => (
                            <button
                                key={status}
                                className={`btn-filter ${statusFilter === status ? 'active' : ''}`}
                                onClick={() => setStatusFilter(status)}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <div className="order-search-container">
                        <span className="order-search-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            className="order-search-input"
                            placeholder="Search orders, customer, product..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <button className="btn btn-primary" onClick={() => { setSelectedOrder(null); setIsModalOpen(true); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                        <Plus size={16} /> Create Order
                    </button>
                </div>

                <div className="table-responsive">
                    <table className="data-table orders-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Customer</th>
                                <th>Product</th>
                                <th className="mobile-hide">Qty</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th className="mobile-hide">Created By</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <div style={{ marginBottom: '1rem', opacity: 0.5 }}>
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                                <line x1="8" y1="21" x2="16" y2="21" />
                                                <line x1="12" y1="17" x2="12" y2="21" />
                                            </svg>
                                        </div>
                                        {searchQuery ? `No orders match "${searchQuery}"` : "No orders found for this status."}
                                    </td>
                                </tr>
                            ) : filteredOrders.map((o, i) => (
                                <tr key={o._id || i}>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{orderId(o, i)}</td>
                                    <td style={{ fontWeight: 500 }}>{o.customer_name || `${o.first_name || ''} ${o.last_name || ''}`.trim() || '-'}</td>
                                    <td>{o.product}</td>
                                    <td className="mobile-hide">{o.quantity}</td>
                                    <td style={{ fontWeight: 600 }}>{fmt(o.total_amount)}</td>
                                    <td>{statusBadge(o.status)}</td>
                                    <td className="mobile-hide" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{o.owner_email ? o.owner_email.split('@')[0] : 'admin'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button className="action-btn-circle" title="Edit" onClick={() => { setSelectedOrder(o); setIsModalOpen(true); }}>
                                                <Edit2 size={14} />
                                            </button>
                                            <button className="action-btn-circle" title="Delete" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(o._id)}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <OrderFormModal order={selectedOrder} onClose={handleModalClose} />
            )}
        </div>
    );
};

export default CustomerOrders;
