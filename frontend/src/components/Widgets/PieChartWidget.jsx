import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { aggregateData } from '../../services/dataEngine';

const PieChartWidget = ({ config, data = [] }) => {
    if (!config?.xAxis) { // For pie, xAxis is the category
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                <span>Configure Widget Settings</span>
            </div>
        );
    }

    const renderData = data.length > 0 ? aggregateData(data, config) : [];

    const categoryKey = config.xAxis || 'name';
    const valueKey = config.yAxis || 'value'; // Though Pie often just needs a valueKey, user selects metric
    const showLegend = config.showDataLabel !== false;

    // Visually distinct palette — no two adjacent colors are similar
    const COLORS = [
        '#2563eb', // blue
        '#f59e0b', // amber
        '#10b981', // emerald
        '#ef4444', // red
        '#8b5cf6', // violet
        '#06b6d4', // cyan
        '#f97316', // orange
        '#ec4899', // pink
        '#84cc16', // lime
        '#6366f1', // indigo
    ];

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Pie
                    data={renderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey={valueKey}
                    nameKey={categoryKey}
                >
                    {renderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}
                />
                {showLegend && <Legend verticalAlign="bottom" height={36} />}
            </PieChart>
        </ResponsiveContainer>
    );
};

export default PieChartWidget;
