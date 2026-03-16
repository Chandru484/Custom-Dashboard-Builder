import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { aggregateData } from '../../services/dataEngine';

const AreaChartWidget = ({ config, data = [] }) => {
    if (!config?.xAxis || !config?.yAxis) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                <span>Configure Area Chart</span>
            </div>
        );
    }

    const renderData = data.length > 0 ? aggregateData(data, config) : [];

    const xKey = config.xAxis || 'name';
    const yKey = config.yAxis || 'value';
    const color = config.chartColor || '#3b82f6';

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={renderData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id={`color${yKey}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <Tooltip
                    contentStyle={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}
                />
                <Area type="monotone" dataKey={yKey} stroke={color} fillOpacity={1} fill={`url(#color${yKey})`} />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default AreaChartWidget;
