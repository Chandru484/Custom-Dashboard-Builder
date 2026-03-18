import React from 'react';
import {
    ScatterChart, Scatter, XAxis, YAxis, ZAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Label
} from 'recharts';
import { ScatterChart as ScatterIcon } from 'lucide-react';

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

const CustomTooltip = ({ active, payload, fontSize = 12 }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
        <div style={{
            background: '#fff', border: '1px solid var(--border)',
            borderRadius: '8px', padding: '0.6rem 0.9rem',
            boxShadow: 'var(--shadow-md)', fontSize: `${fontSize}px`, color: 'var(--text-dark)'
        }}>
            {d?.name && <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{d.name}</div>}
            {payload.map((p, i) => (
                <div key={i}>{p.name}: <strong>{p.value}</strong></div>
            ))}
        </div>
    );
};

const ScatterPlotWidget = ({ config = {}, data = [], style = {} }) => {
    const fontSize = style.fontSize || 12;
    const xField = config.xAxis || 'quantity';
    const yField = config.yAxis || 'total_amount';
    const color  = 'var(--primary)';

    const scatterData = buildScatterData(data, xField, yField);

    if (scatterData.length === 0) {
        return (
            <div style={{
                height: '100%', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)', fontSize: `${fontSize}px`, gap: '1rem'
            }}>
                <ScatterIcon size={48} strokeWidth={1} opacity={0.5} />
                <span style={{ fontSize: '0.9rem' }}>Configure Scatter Plot Settings</span>
                {(!config.xAxis || !config.yAxis) && (
                    <span style={{ fontSize: `${fontSize * 0.8}px`, color: 'var(--text-light)', opacity: 0.8 }}>
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
                    tick={{ fontSize, fill: 'var(--text-muted)' }}
                    tickLine={false}
                >
                    <Label
                        value={FIELD_LABELS[xField] || xField}
                        offset={-10}
                        position="insideBottom"
                        style={{ fontSize: fontSize, fill: 'var(--text-muted)' }}
                    />
                </XAxis>
                <YAxis
                    type="number"
                    dataKey="y"
                    name={FIELD_LABELS[yField] || yField}
                    tick={{ fontSize, fill: 'var(--text-muted)' }}
                    tickLine={false}
                    width={55}
                />
                <ZAxis range={[40, 40]} />
                <Tooltip content={<CustomTooltip fontSize={fontSize} />} />
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
