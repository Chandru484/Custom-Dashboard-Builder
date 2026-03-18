import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AreaChart as AreaIcon } from 'lucide-react';
import { aggregateData } from '../../services/dataEngine';

const AreaChartWidget = ({ config, data = [], style = {} }) => {
    const fontSize = style.fontSize || 12;

    if (!config?.xAxis || !config?.yAxis) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: '1rem' }}>
                <AreaIcon size={48} strokeWidth={1} opacity={0.5} />
                <span style={{ fontSize: '0.9rem' }}>Configure Area Chart Settings</span>
            </div>
        );
    }

    const renderData = data.length > 0 ? aggregateData(data, config) : [];

    const xKey = config.xAxis || 'name';
    const yKey = config.yAxis || 'value';
    const color = config.chartColor || 'var(--primary)';

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={renderData} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
                <defs>
                    <linearGradient id={`color${yKey}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                    dataKey={xKey} 
                    tick={{ fontSize, fill: 'var(--text-muted)' }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    tickFormatter={(val) => val.length > 15 ? `${val.substring(0, 12)}...` : val}
                />
                <YAxis 
                    tick={{ fontSize, fill: 'var(--text-muted)' }} 
                    tickFormatter={val => (yKey === 'total_amount' || yKey === 'unit_price') ? `₹${val.toLocaleString('en-IN')}` : val}
                />
                <Tooltip
                    contentStyle={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', fontSize: `${fontSize}px` }}
                    formatter={(val) => (yKey === 'total_amount' || yKey === 'unit_price') ? [`₹${val.toLocaleString('en-IN')}`, config.title || yKey] : [val, config.title || yKey]}
                />
                <Area type="monotone" dataKey={yKey} stroke={color} fillOpacity={1} fill={`url(#color${yKey})`} />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default AreaChartWidget;
