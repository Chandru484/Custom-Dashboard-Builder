import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { aggregateData } from '../../services/dataEngine';

const LineChartWidget = ({ config, data = [], style = {} }) => {
    const fontSize = style.fontSize || 12;

    if (!config?.xAxis || !config?.yAxis) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                <span>Configure Widget Settings</span>
            </div>
        );
    }

    const renderData = data.length > 0 ? aggregateData(data, config) : [];

    const xKey = config.xAxis || 'name';
    const yKey = config.yAxis || 'value';
    const color = config.chartColor || 'var(--primary)';

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={renderData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey={xKey} tick={{ fontSize, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize, fill: 'var(--text-muted)' }} />
                <Tooltip
                    contentStyle={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', fontSize: `${fontSize}px` }}
                />
                <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={3} activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default LineChartWidget;
