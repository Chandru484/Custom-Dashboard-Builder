import React, { useState, useEffect, useRef } from 'react';
import { orderServices, productServices } from '../../services/api';

// ─── Static data ──────────────────────────────────────────────────────────────
const COUNTRIES = ['United States', 'Canada', 'Australia', 'Singapore', 'Hong Kong', 'India'];

const STATUSES = ['Pending', 'In Progress', 'Completed'];

const CREATED_BY = [
    'Mr. Michael Harris',
    'Mr. Ryan Cooper',
    'Ms. Olivia Carter',
    'Mr. Lucas Martin',
];

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, type = 'success', onDone }) => {
    useEffect(() => {
        const t = setTimeout(onDone, 3000);
        return () => clearTimeout(t);
    }, [onDone]);

    return (
        <div style={{
            position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
            backgroundColor: type === 'success' ? '#059669' : '#dc2626',
            color: 'white', padding: '0.85rem 1.4rem', borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)', fontSize: '0.875rem',
            fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.6rem',
            animation: 'slideUp 0.25s ease',
        }}>
            {type === 'success' ? '✓' : '✕'} {message}
        </div>
    );
};

// ─── Initial form state ───────────────────────────────────────────────────────
const blank = {
    first_name: '', last_name: '', email: '', phone: '',
    street_address: '', city: '', state: '', postal_code: '', country: '',
    product: '', quantity: 1, unit_price: '', status: 'Pending', created_by: 'Guest',
};

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
const inp = (err) => ({
    width: '100%', padding: '0.5rem 0.75rem', boxSizing: 'border-box',
    border: `1px solid ${err ? '#ef4444' : '#d1d5db'}`, borderRadius: '6px',
    fontSize: '0.875rem', outline: 'none', backgroundColor: 'white', color: '#111827',
});

const label = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' };
const err   = { fontSize: '0.72rem', color: '#ef4444', marginTop: '0.2rem' };
const col2  = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' };

const Field = ({ lbl, required, error, children }) => (
    <div style={{ marginBottom: '0.75rem' }}>
        <label style={label}>
            {lbl} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
        {children}
        {error && <div style={err}>{error}</div>}
    </div>
);

const GroupHeader = ({ title }) => (
    <div style={{
        fontSize: '0.75rem', fontWeight: 700, color: '#2563eb',
        textTransform: 'uppercase', letterSpacing: '0.06em',
        borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem',
        marginTop: '1.25rem', marginBottom: '1rem',
    }}>
        {title}
    </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const OrderFormModal = ({ order, onClose }) => {
    const [form, setForm]       = useState(blank);
    const [errors, setErrors]   = useState({});
    const [saving, setSaving]   = useState(false);
    const [toast, setToast]     = useState(null);
    const [dynamicProducts, setDynamicProducts] = useState([]);
    const isEdit                = !!order;

    useEffect(() => {
        const fetchProds = async () => {
            try {
                const res = await productServices.getProducts();
                setDynamicProducts(res.data);
            } catch (err) {
                console.error("Error fetching products:", err);
            }
        };
        fetchProds();
    }, []);

    // Derived
    const qty   = parseFloat(form.quantity) || 0;
    const price = parseFloat(form.unit_price) || 0;
    const total = (qty * price).toFixed(2);

    useEffect(() => {
        if (order) setForm({ ...blank, ...order, quantity: order.quantity ?? 1 });
    }, [order]);

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        let v = value;

        if (name === 'quantity') {
            const n = parseInt(value);
            v = isNaN(n) ? 1 : Math.max(1, n);
        }

        if (name === 'unit_price') {
            // Allow only numeric and one decimal point
            if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
        }

        setForm(p => ({ ...p, [name]: v }));
        if (errors[name]) setErrors(p => ({ ...p, [name]: undefined }));
    };

    // ── Validation ─────────────────────────────────────────────────────────────
    const validate = () => {
        const e = {};
        const required = [
            'first_name','last_name','email','phone',
            'street_address','city','state','postal_code','country',
            'product','unit_price','status','created_by',
        ];
        required.forEach(f => { if (!String(form[f] ?? '').trim()) e[f] = 'Please fill the field'; });

        if (form.email && !/\S+@\S+\.\S+/.test(form.email))
            e.email = 'Enter a valid email address';

        if (Number(form.quantity) < 1)
            e.quantity = 'Quantity must be at least 1';

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // ── Submit ─────────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const payload = { ...form, total_amount: parseFloat(total) };
        setSaving(true);
        try {
            if (isEdit) {
                await orderServices.updateOrder(order._id, payload);
                setToast({ message: 'Order updated successfully', type: 'success' });
            } else {
                await orderServices.createOrder(payload);
                setToast({ message: 'Order created successfully', type: 'success' });
            }
            setTimeout(() => onClose(true), 1800);
        } catch (err) {
            console.error(err);
            setToast({ message: 'Failed to save order', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onDone={() => setToast(null)}
                />
            )}

            <div className="modal-overlay" onClick={() => onClose(false)}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    {/* Header */}
                    <div className="modal-header">
                        <div>
                            <h3>{isEdit ? 'Edit Order' : 'Create Order'}</h3>
                            <p className="text-muted text-xs">Fill in all required fields and click Submit</p>
                        </div>
                        <button onClick={() => onClose(false)} className="btn-icon">✕</button>
                    </div>

                    {/* Scrollable form body */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                        <div className="modal-body">

                            {/* ── Customer Information ── */}
                            <GroupHeader title="Customer Information" />

                            <div style={col2}>
                                <Field lbl="First name" required error={errors.first_name}>
                                    <input name="first_name" type="text" style={inp(errors.first_name)} value={form.first_name} onChange={handleChange} placeholder="Enter first name" />
                                </Field>
                                <Field lbl="Last name" required error={errors.last_name}>
                                    <input name="last_name" type="text" style={inp(errors.last_name)} value={form.last_name} onChange={handleChange} placeholder="Enter last name" />
                                </Field>
                            </div>

                            <div style={col2}>
                                <Field lbl="Email ID" required error={errors.email}>
                                    <input name="email" type="text" style={inp(errors.email)} value={form.email} onChange={handleChange} placeholder="Enter email address" />
                                </Field>
                                <Field lbl="Phone number" required error={errors.phone}>
                                    <input name="phone" type="tel" style={inp(errors.phone)} value={form.phone} onChange={handleChange} placeholder="Enter phone number" />
                                </Field>
                            </div>

                            <Field lbl="Street Address" required error={errors.street_address}>
                                <input name="street_address" type="text" style={inp(errors.street_address)} value={form.street_address} onChange={handleChange} placeholder="Enter street address" />
                            </Field>

                            <div style={col2}>
                                <Field lbl="City" required error={errors.city}>
                                    <input name="city" type="text" style={inp(errors.city)} value={form.city} onChange={handleChange} placeholder="Enter city" />
                                </Field>
                                <Field lbl="State / Province" required error={errors.state}>
                                    <input name="state" type="text" style={inp(errors.state)} value={form.state} onChange={handleChange} placeholder="Enter state / province" />
                                </Field>
                            </div>

                            <div style={col2}>
                                <Field lbl="Postal code" required error={errors.postal_code}>
                                    <input name="postal_code" type="text" style={inp(errors.postal_code)} value={form.postal_code} onChange={handleChange} placeholder="Enter postal code" />
                                </Field>
                                <Field lbl="Country" required error={errors.country}>
                                    <select name="country" style={inp(errors.country)} value={form.country} onChange={handleChange}>
                                        <option value="">Select country</option>
                                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </Field>
                            </div>

                            {/* ── Order Information ── */}
                            <GroupHeader title="Order Information" />

                            <Field lbl="Choose product" required error={errors.product}>
                                <select name="product" style={inp(errors.product)} value={form.product} onChange={handleChange}>
                                    <option value="">Select product</option>
                                    {dynamicProducts.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
                                </select>
                            </Field>

                            <div style={col2}>
                                <Field lbl="Quantity" required error={errors.quantity}>
                                    <input
                                        name="quantity" type="number" min="1"
                                        style={inp(errors.quantity)}
                                        value={form.quantity}
                                        onChange={handleChange}
                                    />
                                </Field>

                                {/* Unit Price with $ prefix */}
                                <Field lbl="Unit price" required error={errors.unit_price}>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '0.875rem', userSelect: 'none' }}>₹</span>
                                        <input
                                            name="unit_price"
                                            type="text"
                                            inputMode="decimal"
                                            style={{ ...inp(errors.unit_price), paddingLeft: '1.6rem' }}
                                            value={form.unit_price}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </Field>
                            </div>

                            {/* Total Amount – read-only */}
                            <Field lbl="Total amount" required>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '0.875rem', userSelect: 'none' }}>₹</span>
                                    <div style={{ ...inp(false), paddingLeft: '1.6rem', backgroundColor: '#f9fafb', color: '#059669', fontWeight: 600, cursor: 'default' }}>
                                        {total}
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.2rem' }}>Auto-calculated: Quantity × Unit price</div>
                            </Field>

                            <div style={col2}>
                                <Field lbl="Status" required error={errors.status}>
                                    <select name="status" style={inp(errors.status)} value={form.status} onChange={handleChange}>
                                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </Field>
                                <Field lbl="Created by" required error={errors.created_by}>
                                    <input
                                        name="created_by"
                                        type="text"
                                        style={inp(errors.created_by)}
                                        value={form.created_by}
                                        onChange={handleChange}
                                        placeholder="Enter name"
                                    />
                                </Field>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="modal-footer">
                            <button type="button" onClick={() => onClose(false)} className="btn btn-outline">
                                Cancel
                            </button>
                            <button type="submit" disabled={saving} className="btn btn-primary">
                                {saving ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default OrderFormModal;
