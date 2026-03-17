import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { aggregateData } from '../../services/dataEngine';

const BarChartWidget = ({ config, data = [], style = {} }) => {
    const fontSize = style.fontSize || 12;

    // ... lines 7-21

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={renderData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey={xKey} tick={{ fontSize, fill: 'var(--text-muted)' }} />
                <YAxis 
                    tick={{ fontSize, fill: 'var(--text-muted)' }} 
                    tickFormatter={val => (yKey === 'total_amount' || yKey === 'unit_price') ? `₹${val.toLocaleString('en-IN')}` : val}
                />
                <Tooltip
                    cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }}
                    contentStyle={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}
                    formatter={(val) => (yKey === 'total_amount' || yKey === 'unit_price') ? [`₹${val.toLocaleString('en-IN')}`, config.title || yKey] : [val, config.title || yKey]}
                />
                <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default BarChartWidget;
