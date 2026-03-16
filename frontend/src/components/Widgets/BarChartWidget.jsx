import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { aggregateData } from '../../services/dataEngine';

const BarChartWidget = ({ config, data = [] }) => {
    // If no config set, show placeholder
    if (!config?.xAxis || !config?.yAxis) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                <span>Configure Widget Settings</span>
            </div>
        );
    }

    // Process data based on config
    const renderData = data.length > 0 ? aggregateData(data, config) : [];

    const xKey = config.xAxis || 'name';
    const yKey = config.yAxis || 'value';
    const color = config.chartColor || 'var(--primary)';

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={renderData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <Tooltip
                    cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }}
                    contentStyle={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}
                />
                <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default BarChartWidget;
