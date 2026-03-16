import React from 'react';
import {
    ScatterChart, Scatter, XAxis, YAxis, ZAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Label
} from 'recharts';

// Build scatter-friendly {x, y} pairs from raw order data
const buildScatterData = (data = [], xField, yField) => {
    const results = [];
    data.forEach((row) => {
        const x = parseFloat(row[xField]);
        const y = parseFloat(row[yField]);
        if (!isNaN(x) && !isNaN(y)) {
            results.push({ x, y, name: row.product || row.first_name || '' });
        }
    });
    return results;
};

// Friendly labels for order fields
const FIELD_LABELS = {
    quantity:     'Quantity',
    unit_price:   'Unit Price (₹)',
    total_amount: 'Total Amount (₹)',
};

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
        <div style={{
            background: '#fff', border: '1px solid var(--border)',
            borderRadius: '8px', padding: '0.6rem 0.9rem',
            boxShadow: 'var(--shadow-md)', fontSize: '0.8rem', color: 'var(--text-dark)'
        }}>
            {d?.name && <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{d.name}</div>}
            {payload.map((p, i) => (
                <div key={i}>{p.name}: <strong>{p.value}</strong></div>
            ))}
        </div>
    );
};

const ScatterPlotWidget = ({ config = {}, data = [] }) => {
    const xField = config.xAxis || 'quantity';
    const yField = config.yAxis || 'total_amount';
    const color  = '#2563eb';

    const scatterData = buildScatterData(data, xField, yField);

    if (scatterData.length === 0) {
        return (
            <div style={{
                height: '100%', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)', fontSize: '0.825rem', gap: '0.35rem'
            }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="7.5" cy="15.5" r="1.5"/><circle cx="18.5" cy="5.5" r="1.5"/>
                    <circle cx="11.5" cy="11.5" r="1.5"/><circle cx="15.5" cy="17.5" r="1.5"/>
                </svg>
                <span>No data available</span>
                {(!config.xAxis || !config.yAxis) && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>
                        Set X & Y axes in the Data tab
                    </span>
                )}
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 12, right: 20, bottom: 28, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                    type="number"
                    dataKey="x"
                    name={FIELD_LABELS[xField] || xField}
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    tickLine={false}
                >
                    <Label
                        value={FIELD_LABELS[xField] || xField}
                        offset={-10}
                        position="insideBottom"
                        style={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    />
                </XAxis>
                <YAxis
                    type="number"
                    dataKey="y"
                    name={FIELD_LABELS[yField] || yField}
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    tickLine={false}
                    width={55}
                />
                <ZAxis range={[40, 40]} />
                <Tooltip content={<CustomTooltip />} />
                <Scatter
                    name="Orders"
                    data={scatterData}
                    fill={color}
                    fillOpacity={0.75}
                />
            </ScatterChart>
        </ResponsiveContainer>
    );
};

export default ScatterPlotWidget;
