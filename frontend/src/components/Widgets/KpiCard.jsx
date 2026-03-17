import React from 'react';
import { aggregateKpi } from '../../services/dataEngine';

const KpiCard = ({ config, data = [], style = {} }) => {
    // ... lines 5-13
    const fontSize = style.fontSize ? `${style.fontSize}px` : '0.875rem';
    const valueFontSize = style.fontSize ? `${style.fontSize * 2.5}px` : '2.5rem';

    if (!config?.yAxis || !config?.aggregation) {
        // ...
    }

    const val = aggregateKpi(data, config);
    // ...

    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', padding: '0 1rem' }}>
            <h3 style={{ fontSize, color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 500 }}>
                {title}
            </h3>
            <div style={{ fontSize: valueFontSize, fontWeight: 700, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '4px', height: '32px', backgroundColor: color, borderRadius: '4px', display: 'inline-block' }}></span>
                {valueStr}
            </div>

            {/* Optional secondary metric or trend could go here */}
            {config.showTrend && (
                <div style={{ fontSize: '0.875rem', color: 'var(--primary)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                        <polyline points="17 6 23 6 23 12"></polyline>
                    </svg>
                    +12.5% vs last month
                </div>
            )}
        </div>
    );
};

export default KpiCard;
