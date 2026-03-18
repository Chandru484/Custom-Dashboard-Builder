import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { aggregateData } from '../../services/dataEngine';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const PieChartWidget = ({ config, data = [], style = {} }) => {
    const fontSize = style.fontSize || 12;

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

    const yKey = config.yAxis || 'value';

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={renderData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey={yKey}
                    nameKey={config.xAxis}
                >
                    {renderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: `${fontSize}px` }}
                    formatter={(val, name) => (yKey === 'total_amount' || yKey === 'unit_price') ? [`₹${val.toLocaleString('en-IN')}`, name] : [val, name]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: `${fontSize}px`, paddingTop: '10px' }} />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default PieChartWidget;
