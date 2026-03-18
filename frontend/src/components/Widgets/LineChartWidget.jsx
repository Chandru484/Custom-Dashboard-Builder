import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { LineChart as LineIcon } from 'lucide-react';
import { aggregateData } from '../../services/dataEngine';

const LineChartWidget = ({ config, data = [], style = {} }) => {
    const fontSize = style.fontSize || 12;

    if (!config?.xAxis || !config?.yAxis) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: '1rem' }}>
                <LineIcon size={48} strokeWidth={1} opacity={0.5} />
                <span style={{ fontSize: '0.9rem' }}>Configure Line Chart Settings</span>
            </div>
        );
    }

    const renderData = data.length > 0 ? aggregateData(data, config) : [];

    const xKey = config.xAxis || 'name';
    const yKey = config.yAxis || 'value';
    const color = config.chartColor || 'var(--primary)';

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={renderData} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                    dataKey={xKey} 
                    tick={{ fontSize, fill: 'var(--text-muted)' }}
                    interval={0}
                    tickFormatter={(val) => val.length > 12 ? `${val.substring(0, 10)}...` : val}
                />
                <YAxis 
                    tick={{ fontSize, fill: 'var(--text-muted)' }}
                    tickFormatter={val => (yKey === 'total_amount' || yKey === 'unit_price') ? `₹${val.toLocaleString('en-IN')}` : val}
                />
                <Tooltip
                    contentStyle={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', fontSize: `${fontSize}px` }}
                    formatter={(val) => (yKey === 'total_amount' || yKey === 'unit_price') ? [`₹${val.toLocaleString('en-IN')}`, config.title || yKey] : [val, config.title || yKey]}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: `${fontSize}px`, paddingBottom: '10px' }} />
                <Line type="monotone" dataKey={yKey} name={config.title || yKey} stroke={color} strokeWidth={3} activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default LineChartWidget;
