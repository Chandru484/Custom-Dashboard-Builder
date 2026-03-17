import React from 'react';

const TableWidget = ({ config, data = [], style = {} }) => {
    // A simplified data grid for the dashboard (not the main Customer Order table)
    const fontSize  = style.fontSize  ? `${style.fontSize}px` : '0.875rem';
    const headerBg  = style.headerBg  || 'var(--bg-surface)';

    // We'll show up to 10 rows
    const renderData = data.slice(0, 10);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

            <div className="non-draggable" style={{ flex: 1, overflowY: 'auto', padding: '0 1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize }}>
                    <thead style={{ position: 'sticky', top: 0, backgroundColor: headerBg }}>
                        <tr>
                            <th style={{ padding: '0.75rem 0.5rem', borderBottom: '2px solid var(--border)', color: 'var(--text-muted)', fontWeight: 600 }}>Product</th>
                            <th style={{ padding: '0.75rem 0.5rem', borderBottom: '2px solid var(--border)', color: 'var(--text-muted)', fontWeight: 600 }}>Qty</th>
                            <th style={{ padding: '0.75rem 0.5rem', borderBottom: '2px solid var(--border)', color: 'var(--text-muted)', fontWeight: 600 }}>Total</th>
                            <th style={{ padding: '0.75rem 0.5rem', borderBottom: '2px solid var(--border)', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderData.map((row, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '0.75rem 0.5rem' }}>{row.product || '-'}</td>
                                <td style={{ padding: '0.75rem 0.5rem' }}>{row.qty || '-'}</td>
                                <td style={{ padding: '0.75rem 0.5rem' }}>₹{parseFloat(row.total_amount || 0).toFixed(2)}</td>
                                <td style={{ padding: '0.75rem 0.5rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        backgroundColor: row.status === 'Completed' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                        color: row.status === 'Completed' ? 'var(--primary)' : '#f59e0b'
                                    }}>
                                        {row.status || 'Pending'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {renderData.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                        No data available
                    </div>
                )}
            </div>
        </div>
    );
};

export default TableWidget;
