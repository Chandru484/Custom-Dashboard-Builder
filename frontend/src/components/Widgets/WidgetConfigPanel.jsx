import React, { useState, useEffect } from 'react';

// ─── Constants ─────────────────────────────────────────────────────────────
const ALL_COLUMNS = [
    { value: 'order_id',       label: 'Customer ID' },
    { value: 'customer_name',  label: 'Customer name' },
    { value: 'email',          label: 'Email id' },
    { value: 'street_address', label: 'Address' },
    { value: 'created_at',     label: 'Order date' },
    { value: 'product',        label: 'Product' },
    { value: 'created_by',     label: 'Created by' },
    { value: 'status',         label: 'Status' },
    { value: 'total_amount',   label: 'Total amount' },
    { value: 'unit_price',     label: 'Unit price' },
    { value: 'quantity',       label: 'Quantity' },
];

const FILTER_ATTRIBUTES = ['Product', 'Quantity', 'Status'];
const OPERATORS = ['=', '!=', '>', '<', '>=', '<=', 'Contains'];
const PAGINATION_OPTIONS = [5, 10, 15];
const WIDTH_OPTIONS  = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const HEIGHT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// ─── Styles ────────────────────────────────────────────────────────────────
const s = {
    label:    { display:'block', fontSize:'0.75rem', fontWeight:600, color:'#374151', marginBottom:'0.3rem' },
    input:    { width:'100%', padding:'0.45rem 0.65rem', border:'1px solid #d1d5db', borderRadius:'6px', fontSize:'0.8rem', outline:'none', boxSizing:'border-box', color:'#111827', backgroundColor:'white' },
    select:   { width:'100%', padding:'0.45rem 0.65rem', border:'1px solid #d1d5db', borderRadius:'6px', fontSize:'0.8rem', outline:'none', boxSizing:'border-box', color:'#111827', backgroundColor:'white' },
    group:    { marginBottom:'0.85rem' },
    section:  { fontSize:'0.7rem', fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.5rem', marginTop:'1rem' },
    chip:     { display:'inline-flex', alignItems:'center', gap:'0.3rem', padding:'0.2rem 0.55rem', backgroundColor:'#e0f2ed', color:'#059669', borderRadius:'99px', fontSize:'0.72rem', fontWeight:500 },
    chipX:    { cursor:'pointer', fontSize:'0.85rem', lineHeight:1, color:'#059669' },
    row:      { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' },
};

// ─── Multiselect chip input ─────────────────────────────────────────────────
const MultiSelect = ({ options, value = [], onChange }) => {
    const [open, setOpen] = useState(false);
    const selected = new Set(value);

    const toggle = (v) => {
        const next = selected.has(v) ? value.filter(x => x !== v) : [...value, v];
        onChange(next);
    };

    return (
        <div style={{ position:'relative' }}>
            <div
                onClick={() => setOpen(p => !p)}
                style={{ ...s.input, minHeight:'36px', display:'flex', flexWrap:'wrap', gap:'0.3rem', cursor:'pointer', alignItems:'center' }}
            >
                {value.length === 0 && <span style={{ color:'#9ca3af' }}>Choose columns</span>}
                {value.map(v => {
                    const lbl = options.find(o => o.value === v)?.label || v;
                    return (
                        <span key={v} style={s.chip}>
                            {lbl}
                            <span style={s.chipX} onMouseDown={e => { e.stopPropagation(); toggle(v); }}>×</span>
                        </span>
                    );
                })}
            </div>
            {open && (
                <div style={{ position:'absolute', top:'100%', left:0, right:0, backgroundColor:'white', border:'1px solid #d1d5db', borderRadius:'6px', zIndex:50, boxShadow:'0 4px 12px rgba(0,0,0,0.1)', maxHeight:'180px', overflowY:'auto' }}>
                    {options.map(opt => (
                        <label key={opt.value} style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.4rem 0.75rem', cursor:'pointer', fontSize:'0.8rem', backgroundColor: selected.has(opt.value) ? '#f0fdf4' : 'transparent' }}>
                            <input type="checkbox" checked={selected.has(opt.value)} onChange={() => toggle(opt.value)} style={{ accentColor:'#2563eb' }} />
                            {opt.label}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Filter rows ────────────────────────────────────────────────────────────
const FilterSection = ({ filters = [], onChange }) => {
    const add = () => onChange([...filters, { attribute:'', operator:'=', value:'' }]);
    const remove = (i) => onChange(filters.filter((_, idx) => idx !== i));
    const update = (i, field, val) => {
        const next = [...filters];
        next[i] = { ...next[i], [field]: val };
        onChange(next);
    };

    return (
        <div style={{ marginTop:'0.5rem' }}>
            {filters.map((f, i) => (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr auto', gap:'0.4rem', alignItems:'center', marginBottom:'0.5rem' }}>
                    <select style={s.select} value={f.attribute} onChange={e => update(i,'attribute',e.target.value)}>
                        <option value="">Choose attribute</option>
                        {FILTER_ATTRIBUTES.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <select style={{ ...s.select, width:'80px' }} value={f.operator} onChange={e => update(i,'operator',e.target.value)}>
                        {OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
                    </select>
                    <input style={s.input} placeholder="Value" value={f.value} onChange={e => update(i,'value',e.target.value)} />
                    <button onClick={() => remove(i)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444', fontSize:'1rem', padding:'0 0.25rem' }}>×</button>
                </div>
            ))}
            <button
                onClick={add}
                style={{ fontSize:'0.78rem', color:'#2563eb', background:'none', border:'none', cursor:'pointer', padding:0, fontWeight:600 }}
            >
                + Add filter
            </button>
        </div>
    );
};

// ─── Main Panel ─────────────────────────────────────────────────────────────
const WidgetConfigPanel = ({ widget, onUpdate, onClose, hideHeader = false }) => {
    const [tab, setTab] = useState('data');
    const [local, setLocal] = useState(widget);

    useEffect(() => { setLocal(widget); }, [widget]);

    const set = (path, value) => {
        const updated = { ...local };
        if (path.startsWith('config.')) {
            const key = path.replace('config.', '');
            updated.config = { ...local.config, [key]: value };
        } else if (path.startsWith('grid.')) {
            const key = path.replace('grid.', '');
            updated.grid = { ...local.grid, [key]: Number(value) };
        } else if (path.startsWith('style.')) {
            const key = path.replace('style.', '');
            updated.style = { ...local.style, [key]: value };
        } else {
            updated[path] = value;
        }
        setLocal(updated);
        onUpdate(updated);
    };

    const tabBtn = (id, label) => (
        <button
            onClick={() => setTab(id)}
            style={{
                flex:1, padding:'0.5rem', border:'none', cursor:'pointer', fontSize:'0.8rem', fontWeight:600, borderRadius:'4px',
                backgroundColor: tab === id ? '#2563eb' : 'transparent',
                color: tab === id ? 'white' : '#6b7280',
                transition:'all 0.15s'
            }}
        >
            {label}
        </button>
    );

    const isTable = widget.type === 'TABLE';

    return (
        <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
            {/* Header — hidden when shown inside modal (hideHeader=true) */}
            {!hideHeader && (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
                <h3 style={{ fontSize:'0.95rem', margin:0, color:'#111827', fontWeight:700 }}>Widget configuration</h3>
                <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280', fontSize:'1.1rem' }}>✕</button>
            </div>
            )}

            {/* Tab toggle */}
            <div style={{ display:'flex', backgroundColor:'#f3f4f6', borderRadius:'6px', padding:'3px', gap:'3px', marginBottom:'1rem', flexShrink:0 }}>
                {tabBtn('data', 'Data')}
                {tabBtn('styling', 'Styling')}
            </div>

            {/* Scrollable body */}
            <div style={{ flex:1, overflowY:'auto', paddingRight:'2px' }}>

                {/* ════ DATA TAB ════ */}
                {tab === 'data' && (
                    <>
                        <div style={s.group}>
                            <label style={s.label}>Widget title <span style={{ color:'#ef4444' }}>*</span></label>
                            <input style={s.input} value={local.title || ''} onChange={e => set('title', e.target.value)} placeholder="Untitled" />
                        </div>

                        <div style={s.group}>
                            <label style={s.label}>Widget type <span style={{ color:'#ef4444' }}>*</span></label>
                            <input style={{ ...s.input, backgroundColor:'#f9fafb', color:'#6b7280' }} value={local.type} disabled />
                        </div>

                        <div style={s.group}>
                            <label style={s.label}>Description</label>
                            <textarea
                                style={{ ...s.input, minHeight:'60px', resize:'vertical' }}
                                value={local.description || ''}
                                onChange={e => set('description', e.target.value)}
                                placeholder="Optional description..."
                            />
                        </div>

                        {/* Widget Size */}
                        <div style={s.section}>Widget size</div>
                        <div style={s.row}>
                            <div style={s.group}>
                                <label style={s.label}>Width (Columns) <span style={{ color:'#ef4444' }}>*</span></label>
                                <select style={s.select} value={local.grid?.w || 6} onChange={e => set('grid.w', e.target.value)}>
                                    {WIDTH_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                            <div style={s.group}>
                                <label style={s.label}>Height (Rows) <span style={{ color:'#ef4444' }}>*</span></label>
                                <select style={s.select} value={local.grid?.h || 4} onChange={e => set('grid.h', e.target.value)}>
                                    {HEIGHT_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                        </div>
                        {/* Responsive grid info */}
                        <div style={{ fontSize: '0.7rem', color: '#6b7280', backgroundColor: '#f3f4f6', borderRadius: '6px', padding: '0.5rem 0.65rem', marginBottom: '0.85rem', lineHeight: 1.5 }}>
                            🖥 <strong>Desktop</strong> 12 cols &nbsp;·&nbsp;
                            📱 <strong>Tablet</strong> 8 cols &nbsp;·&nbsp;
                            📲 <strong>Mobile</strong> 4 cols<br />
                            <span style={{ color: '#9ca3af' }}>Widgets wider than the breakpoint auto-wrap to the next row.</span>
                        </div>

                        {/* Data Setting — TABLE specific */}
                        {isTable && (
                            <>
                                <div style={s.section}>Data setting</div>

                                <div style={s.group}>
                                    <label style={s.label}>Choose columns <span style={{ color:'#ef4444' }}>*</span></label>
                                    <MultiSelect
                                        options={ALL_COLUMNS}
                                        value={local.config?.columns || []}
                                        onChange={v => set('config.columns', v)}
                                    />
                                </div>

                                <div style={s.group}>
                                    <label style={s.label}>Sort by</label>
                                    <select style={s.select} value={local.config?.sortBy || 'Ascending'} onChange={e => set('config.sortBy', e.target.value)}>
                                        <option value="Ascending">Ascending</option>
                                        <option value="Descending">Descending</option>
                                    </select>
                                </div>

                                <div style={s.group}>
                                    <label style={s.label}>Pagination</label>
                                    <select style={s.select} value={local.config?.pagination || 5} onChange={e => set('config.pagination', Number(e.target.value))}>
                                        {PAGINATION_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>

                                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.5rem' }}>
                                    <input
                                        type="checkbox"
                                        id="applyFilter"
                                        checked={!!local.config?.applyFilter}
                                        onChange={e => set('config.applyFilter', e.target.checked)}
                                        style={{ accentColor:'#2563eb', width:'14px', height:'14px' }}
                                    />
                                    <label htmlFor="applyFilter" style={{ fontSize:'0.8rem', color:'#374151', fontWeight:500, cursor:'pointer' }}>Apply filter</label>
                                </div>

                                {local.config?.applyFilter && (
                                    <FilterSection
                                        filters={local.config?.filters || []}
                                        onChange={v => set('config.filters', v)}
                                    />
                                )}
                            </>
                        )}

                        {/* Data Setting — Charts */}
                        {['BAR_CHART','LINE_CHART','AREA_CHART','SCATTER_PLOT'].includes(widget.type) && (
                            <>
                                <div style={s.section}>Data setting</div>
                                <div style={s.group}>
                                    <label style={s.label}>X-Axis (Dimension)</label>
                                    <select style={s.select} value={local.config?.xAxis || ''} onChange={e => set('config.xAxis', e.target.value)}>
                                        <option value="">Select...</option>
                                        <option value="product">Product</option>
                                        <option value="city">City</option>
                                        <option value="country">Country</option>
                                        <option value="status">Status</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {['PIE_CHART'].includes(widget.type) && (
                            <>
                                <div style={s.section}>Data setting</div>
                                <div style={s.group}>
                                    <label style={s.label}>Category</label>
                                    <select style={s.select} value={local.config?.xAxis || ''} onChange={e => set('config.xAxis', e.target.value)}>
                                        <option value="">Select...</option>
                                        <option value="product">Product</option>
                                        <option value="city">City</option>
                                        <option value="status">Status</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {['BAR_CHART','LINE_CHART','AREA_CHART','SCATTER_PLOT','PIE_CHART','KPI'].includes(widget.type) && (
                            <>
                                <div style={s.group}>
                                    <label style={s.label}>Metric (Y-Axis)</label>
                                    <select style={s.select} value={local.config?.yAxis || ''} onChange={e => set('config.yAxis', e.target.value)}>
                                        <option value="">Select...</option>
                                        <option value="total_amount">Total Amount</option>
                                        <option value="quantity">Quantity</option>
                                        <option value="unit_price">Unit Price</option>
                                    </select>
                                </div>
                                <div style={s.group}>
                                    <label style={s.label}>Aggregation</label>
                                    <select style={s.select} value={local.config?.aggregation || 'SUM'} onChange={e => set('config.aggregation', e.target.value)}>
                                        <option value="SUM">Sum</option>
                                        <option value="AVG">Average</option>
                                        <option value="COUNT">Count</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* ════ STYLING TAB ════ */}
                {tab === 'styling' && (
                    <>
                        <div style={s.group}>
                            <label style={s.label}>Font size <span style={{ color:'#ef4444' }}>*</span></label>
                            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                                <input
                                    type="number" min={12} max={20}
                                    style={{ ...s.input }}
                                    value={local.style?.fontSize || 14}
                                    onChange={e => set('style.fontSize', Math.min(20, Math.max(12, Number(e.target.value))))}
                                />
                                <span style={{ fontSize:'0.78rem', color:'#6b7280', whiteSpace:'nowrap' }}>px</span>
                            </div>
                            <p style={{ fontSize:'0.68rem', color:'#9ca3af', margin:'0.2rem 0 0' }}>Min: 12px · Max: 20px · Default: 14px</p>
                        </div>

                        <div style={s.group}>
                            <label style={s.label}>Header background</label>
                            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                                <input
                                    type="color"
                                    value={local.style?.headerBg || '#D8D8D8'}
                                    onChange={e => set('style.headerBg', e.target.value)}
                                    style={{ width:'36px', height:'36px', padding:'2px', border:'1px solid #d1d5db', borderRadius:'6px', cursor:'pointer' }}
                                />
                                <input
                                    type="text"
                                    style={{ ...s.input }}
                                    value={local.style?.headerBg || '#D8D8D8'}
                                    onChange={e => set('style.headerBg', e.target.value)}
                                    placeholder="#D8D8D8"
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default WidgetConfigPanel;
