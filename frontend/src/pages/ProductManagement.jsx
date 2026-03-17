import React, { useState, useEffect } from 'react';
import { productServices } from '../services/api';
import { Package, Plus, Trash2, Edit2, AlertCircle, CheckCircle, X } from 'lucide-react';

import { useToast } from '../context/ToastContext';

const ProductManagement = () => {
    const { showToast } = useToast();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form State (for Add and Edit)
    const [formData, setFormData] = useState({ name: '', price: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await productServices.getProducts();
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({ name: '', price: '' });
        setEditingId(null);
        setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        setActionLoading(true);
        setMessage({ type: '', text: '' });

        try {
            if (editingId) {
                await productServices.updateProduct(editingId, {
                    name: formData.name.trim(),
                    price: parseFloat(formData.price) || 0
                });
                showToast('Product updated successfully!', 'success');
            } else {
                await productServices.addProduct({
                    name: formData.name.trim(),
                    price: parseFloat(formData.price) || 0
                });
                showToast('Product added successfully!', 'success');
            }
            handleReset();
            fetchProducts();
        } catch (err) {
            showToast(err.response?.data?.error || 'Failed to save product', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleEditClick = (p) => {
        setEditingId(p._id);
        setFormData({ name: p.name, price: p.price || '' });
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to remove this product?')) return;

        try {
            await productServices.deleteProduct(id);
            showToast('Product deleted successfully!', 'success');
            fetchProducts();
        } catch (err) {
            showToast('Failed to delete product', 'error');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)' }}>
                Loading products...
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-dark)' }}>Product Management</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Manage products available for selection in orders</p>
            </div>

            <div style={{ display: 'grid', gap: '2rem' }}>
                {/* Add/Edit Product Form */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ padding: '0.5rem', backgroundColor: editingId ? 'var(--primary-light)' : 'var(--primary-light)', borderRadius: '8px', color: editingId ? 'var(--primary)' : 'var(--primary)' }}>
                                {editingId ? <Edit2 size={20} /> : <Plus size={20} />}
                            </div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
                                {editingId ? 'Edit Product' : 'Add New Product'}
                            </h2>
                        </div>
                        {editingId && (
                            <button 
                                onClick={handleReset}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                                <X size={16} /> Cancel
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label className="form-label" style={{ fontSize: '0.75rem' }}>Product Name</label>
                                <input 
                                    className="form-input" 
                                    value={formData.name} 
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="e.g. Fiber Internet 1 Gbps"
                                    required
                                    disabled={actionLoading}
                                />
                            </div>
                            <div>
                                <label className="form-label" style={{ fontSize: '0.75rem' }}>Standard Price (₹)</label>
                                <input 
                                    className="form-input" 
                                    type="number"
                                    step="0.01"
                                    value={formData.price} 
                                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                                    placeholder="0.00"
                                    required
                                    disabled={actionLoading}
                                />
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            disabled={actionLoading}
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            {actionLoading ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
                        </button>
                    </form>

                    {message.text && (
                        <div style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.5rem', 
                            padding: '0.75rem', borderRadius: '6px', marginTop: '1rem',
                            backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                            color: message.type === 'success' ? '#166534' : '#991b1b',
                            fontSize: '0.875rem'
                        }}>
                            {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            {message.text}
                        </div>
                    )}
                </div>

                {/* Product List */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.5rem', backgroundColor: '#f3f4f6', borderRadius: '8px', color: '#4b5563' }}>
                            <Package size={20} />
                        </div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Current Products</h2>
                    </div>

                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {products.length > 0 ? products.map((product) => (
                            <div 
                                key={product._id} 
                                style={{ 
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                                    padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px',
                                    backgroundColor: 'white',
                                    transition: 'border-color 0.2s'
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.9rem' }}>{product.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                                        ₹{parseFloat(product.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button 
                                        onClick={() => handleEditClick(product)}
                                        style={{ 
                                            padding: '0.45rem', color: 'var(--primary)', background: 'none', 
                                            border: '1px solid var(--primary-mid)', cursor: 'pointer', borderRadius: '6px',
                                            display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 500
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <Edit2 size={16} /> Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteProduct(product._id)}
                                        style={{ 
                                            padding: '0.45rem', color: '#ef4444', background: 'none', 
                                            border: '1px solid #fee2e2', cursor: 'pointer', borderRadius: '6px',
                                            display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 500
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
                                No products added yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductManagement;
