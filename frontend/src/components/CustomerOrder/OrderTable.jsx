import React, { useState, useEffect } from 'react';
import { orderServices } from '../../services/api';
import OrderFormModal from './OrderFormModal';
import { MoreVertical, Edit2, Trash2, Plus } from 'lucide-react';

const OrderTable = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null); // null means "Create new"

    // Context menu state
    const [activeMenuId, setActiveMenuId] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await orderServices.getOrders();
            setOrders(res.data);
        } catch (error) {
            console.error("Failed to load orders", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        setSelectedOrder(null);
        setIsModalOpen(true);
        setActiveMenuId(null);
    };

    const handleEdit = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
        setActiveMenuId(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this order?")) {
            try {
                await orderServices.deleteOrder(id);
                fetchOrders(); // refresh table
            } catch (error) {
                console.error("Failed to delete order", error);
            }
        }
        setActiveMenuId(null);
    };

    const handleModalClose = (wasSaved) => {
        setIsModalOpen(false);
        if (wasSaved) fetchOrders();
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-dark)' }}>All Orders</h3>
                <button className="btn btn-primary" onClick={handleCreateNew}>
                    <Plus size={16} style={{ marginRight: '0.5rem' }} />
                    Create Order
                </button>
            </div>

            <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                    <thead style={{ backgroundColor: '#f1f5f9' }}>
                        <tr>
                            <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Order ID</th>
                            <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Customer</th>
                            <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Product</th>
                            <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Date</th>
                            <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Total (₹)</th>
                            <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
                            <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', width: '50px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading orders...</td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No orders found</td>
                            </tr>
                        ) : (
                            orders.map(order => (
                                <tr key={order._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }}>
                                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>...{order._id.substring(order._id.length - 6)}</td>
                                    <td style={{ padding: '0.75rem 1rem' }}>{order.first_name} {order.last_name}</td>
                                    <td style={{ padding: '0.75rem 1rem' }}>{order.product}</td>
                                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                                        {/* Fallback to _id hex string creation time roughly if no date provided */}
                                        {new Date().toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>₹{order.total_amount?.toFixed(2)}</td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            backgroundColor: order.status === 'Completed' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                            color: order.status === 'Completed' ? 'var(--primary)' : '#f59e0b'
                                        }}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem', position: 'relative' }}>
                                        <button
                                            className="btn-icon"
                                            onClick={() => setActiveMenuId(activeMenuId === order._id ? null : order._id)}
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {activeMenuId === order._id && (
                                            <div style={{
                                                position: 'absolute',
                                                right: '100%',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                backgroundColor: 'var(--bg-surface)',
                                                border: '1px solid var(--border)',
                                                borderRadius: 'var(--radius-md)',
                                                boxShadow: 'var(--shadow-md)',
                                                zIndex: 10,
                                                minWidth: '120px',
                                                padding: '0.25rem 0'
                                            }}>
                                                <button
                                                    style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--text-dark)' }}
                                                    onClick={() => handleEdit(order)}
                                                >
                                                    <Edit2 size={14} /> Edit
                                                </button>
                                                <button
                                                    style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--danger)' }}
                                                    onClick={() => handleDelete(order._id)}
                                                >
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <OrderFormModal
                    order={selectedOrder}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
};

export default OrderTable;
