import React, { useState, useEffect } from 'react';

// Hook: returns current window width, updates on resize
const useWindowWidth = () => {
    const [width, setWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handler = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);
    return width;
};

import { useNavigate } from 'react-router-dom';
import { Responsive as ResponsiveGridLayout, WidthProvider } from 'react-grid-layout/legacy';
const ResponsiveGridLayoutWithWidth = WidthProvider(ResponsiveGridLayout);
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { dashboardServices, orderServices } from '../services/api';
import WidgetRenderer from '../components/Widgets/WidgetRenderer';
import WidgetConfigPanel from '../components/Widgets/WidgetConfigPanel';
import { aggregateData } from '../services/dataEngine';

// Widget Types from Requirement (shortened default heights)
const WIDGET_TYPES = [
    { title: 'Bar Chart', type: 'BAR_CHART', defaultW: 6, defaultH: 4 },
    { title: 'Line Chart', type: 'LINE_CHART', defaultW: 6, defaultH: 4 },
    { title: 'Pie Chart', type: 'PIE_CHART', defaultW: 6, defaultH: 4 },
    { title: 'Area Chart', type: 'AREA_CHART', defaultW: 6, defaultH: 4 },
    { title: 'Scatter Plot', type: 'SCATTER_PLOT', defaultW: 6, defaultH: 4 },
    { title: 'Table', type: 'TABLE', defaultW: 6, defaultH: 4 },
    { title: 'KPI Value', type: 'KPI', defaultW: 4, defaultH: 2 }
];

import { useToast } from '../context/ToastContext';

const ConfigureDashboard = () => {
    const { showToast } = useToast();
    const windowWidth = useWindowWidth();
    const isMobileOrTablet = windowWidth <= 1024;
    const navigate = useNavigate();
    const [widgets, setWidgets] = useState([]);
    const [activeWidget, setActiveWidget] = useState(null); // Which widget is currently being configured
    const [draggingWidget, setDraggingWidget] = useState(null); // Track widget being dragged from library
    const [saving, setSaving] = useState(false);
    const [orders, setOrders] = useState([]); // Raw order data
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        loadExistingConfig();
        fetchOrders();
    }, []);

    useEffect(() => {
        // Trigger a fake resize event when layout switches or sidebar opens
        const timer = setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
        return () => clearTimeout(timer);
    }, [isMobileOrTablet, activeWidget]);

    const fetchOrders = async () => {
        try {
            const res = await orderServices.getOrders();
            setOrders(res.data || []);
        } catch (error) {
            console.error("Failed to load orders", error);
        } finally {
            setLoadingData(false);
        }
    };

    const loadExistingConfig = async () => {
        try {
            const res = await dashboardServices.getConfig();
            if (res.data?.widgets) {
                setWidgets(res.data.widgets);
            }
        } catch (error) {
            console.error("Error loading config", error);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await dashboardServices.saveConfig(widgets);
            showToast("Dashboard saved successfully!", "success");
            navigate('/');
        } catch (error) {
            showToast("Failed to save dashboard.", "error");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const addWidget = (widgetTemplate) => {
        // Generate a simple unique ID for the new widget
        const id = `widget_${Date.now()}`;

        // Find an empty spot or just place at 0,0 (GridLayout will automatically push it down)
        const newWidget = {
            id,
            type: widgetTemplate.type,
            title: 'Untitled',
            grid: { x: 0, y: 0, w: widgetTemplate.defaultW, h: widgetTemplate.defaultH },
            config: {} // specific settings like "Select Metric" go here
        };

        setWidgets([...widgets, newWidget]);
    };

    const removeWidget = (id) => {
        setWidgets(prev => prev.filter(w => w.id !== id));
        if (activeWidget?.id === id) setActiveWidget(null);
    };

    const handleLayoutChange = (layout) => {
        // Update local state with new positions/sizes
        const updatedWidgets = widgets.map(widget => {
            const item = layout.find(l => l.i === widget.id);
            if (item) {
                return { ...widget, grid: { x: item.x, y: item.y, w: item.w, h: item.h } };
            }
            return widget;
        });
        setWidgets(updatedWidgets);
    };

    return (
        <div className="configure-page" style={{ backgroundColor: '#e2e4e6', minHeight: 'calc(100vh - 60px)' }}>
            {/* Main White Canvas Container */}
            <div style={{ backgroundColor: 'white', borderRadius: '4px', display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 160px)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                
                {/* Inner Top Navigation Bar */}
                <div style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <button className="btn-icon" onClick={() => navigate('/')} style={{ marginRight: '1rem', color: 'var(--text)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    </button>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Configure dashboard</h2>
                    </div>
                </div>

                {/* Content Area within White Box */}
                <div className="config-layout-wrapper">

                    {/* Left Sidebar: Widget Library */}
                    <div className="config-sidebar-left">
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Show data for</label>
                            <select className="form-select" disabled>
                                <option>All time</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Widget library</label>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Drag and drop your canvas</span>
                        </div>

                        {/* Accordion Categories (Simulated) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f8fafc', fontWeight: 500, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    Charts <span>^</span>
                                </div>
                                <div style={{ padding: '0.5rem' }}>
                                    {WIDGET_TYPES.filter(w => w.type.includes('CHART') || w.type.includes('PLOT')).map(widget => (
                                        <div
                                            key={widget.type}
                                            className="widget-library-item"
                                            style={{ padding: '0.5rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)', transition: 'all 0.2s', borderRadius: '6px' }}
                                            draggable={true}
                                            unselectable="on"
                                            onDragStart={(e) => {
                                                setDraggingWidget(widget);
                                                e.dataTransfer.setData("text/plain", "");
                                            }}
                                            onClick={(e) => {
                                                // Prevent addWidget if it was a drag attempt
                                                if (e.detail !== 0) { // detailed check to see if it was a real click
                                                    addWidget(widget);
                                                }
                                            }}
                                        >
                                            <span style={{ opacity: 0.5 }}>⠿</span>
                                            <span>{widget.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div style={{ border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f8fafc', fontWeight: 500, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    Tables <span>^</span>
                                </div>
                                <div style={{ padding: '0.5rem' }}>
                                    {WIDGET_TYPES.filter(w => w.type === 'TABLE').map(widget => (
                                        <div
                                            key={widget.type}
                                            className="widget-library-item"
                                            style={{ padding: '0.5rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)', transition: 'all 0.2s', borderRadius: '6px' }}
                                            draggable={true}
                                            unselectable="on"
                                            onDragStart={(e) => {
                                                setDraggingWidget(widget);
                                                e.dataTransfer.setData("text/plain", "");
                                            }}
                                            onClick={(e) => {
                                                if (e.detail !== 0) addWidget(widget);
                                            }}
                                        >
                                            <span style={{ opacity: 0.5 }}>⠿</span>
                                            <span>{widget.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f8fafc', fontWeight: 500, display: 'flex', borderBottom: '1px solid var(--border)', justifyContent: 'space-between', alignItems: 'center' }}>
                                    KPIs <span>^</span>
                                </div>
                                <div style={{ padding: '0.5rem' }}>
                                    {WIDGET_TYPES.filter(w => w.type === 'KPI').map(widget => (
                                        <div
                                            key={widget.type}
                                            className="widget-library-item"
                                            style={{ padding: '0.5rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)', transition: 'all 0.2s', borderRadius: '6px' }}
                                            draggable={true}
                                            unselectable="on"
                                            onDragStart={(e) => {
                                                setDraggingWidget(widget);
                                                e.dataTransfer.setData("text/plain", "");
                                            }}
                                            onClick={(e) => {
                                                if (e.detail !== 0) addWidget(widget);
                                            }}
                                        >
                                            <span style={{ opacity: 0.5 }}>⠿</span>
                                            <span>{widget.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Center Canvas */}
                    <div className="config-main-canvas" style={{ width: '100%', minWidth: 0 }}>
                        <div style={{ flex: 1, position: 'relative', width: '100%' }}>

                        {/* ── Empty canvas state ── */}
                        {widgets.length === 0 && (
                            <div style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                justifyContent: 'center', height: '420px', textAlign: 'center',
                                color: 'var(--text-muted)', userSelect: 'none'
                            }}>
                                <div style={{
                                    width: '72px', height: '72px', borderRadius: '50%',
                                    backgroundColor: '#f0fdf4', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem'
                                }}>
                                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                                        stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2" />
                                        <path d="M3 9h18M9 21V9" />
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 0.4rem' }}>
                                    No widgets added yet
                                </h3>
                                <p style={{ fontSize: '0.8rem', color: '#6b7280', maxWidth: '280px', lineHeight: 1.5, margin: 0 }}>
                                    Expand a widget category on the left panel and click a widget to add it to the dashboard.
                                </p>
                            </div>
                        )}

                        <ResponsiveGridLayoutWithWidth
                            key={`grid-${isMobileOrTablet}`}
                            className="layout"
                            measureBeforeMount={true}
                            layouts={{
                                lg: widgets.map(w => ({ i: w.id, ...w.grid })),
                                md: widgets.map(w => ({ i: w.id, x: 0, y: w.grid.y, w: 8, h: w.grid.h })),
                                sm: widgets.map(w => ({ i: w.id, x: 0, y: w.grid.y, w: 1, h: w.grid.h })),
                            }}
                            breakpoints={{ lg: 1200, md: 800, sm: 0 }}
                            cols={{ lg: 12, md: 8, sm: 1 }}
                            rowHeight={windowWidth < 1024 ? 45 : 50}
                            onLayoutChange={(currentLayout) => handleLayoutChange(currentLayout)}
                            isDraggable={true}
                            isResizable={true}
                            draggableCancel=".non-draggable"
                            isDroppable={true}
                            onDrop={(layout, item, e) => {
                                if (!draggingWidget) return;
                                const id = `widget_${Date.now()}`;
                                const newWidget = {
                                    id,
                                    type: draggingWidget.type,
                                    title: 'Untitled',
                                    // Use precise coordinates from 'item'
                                    grid: { x: item.x, y: item.y, w: draggingWidget.defaultW, h: draggingWidget.defaultH },
                                    config: {}
                                };
                                setWidgets([...widgets, newWidget]);
                                setDraggingWidget(null);
                            }}
                            droppingItem={draggingWidget ? {
                                i: "__dropping_elem__",
                                w: draggingWidget.defaultW,
                                h: draggingWidget.defaultH
                            } : undefined}
                            margin={[16, 16]}
                        >
                        {widgets.map(widget => (
                            <div key={widget.id} style={{ display: 'flex', flexDirection: 'column', padding: '1rem', backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem', flexShrink: 0 }}>
                                    <h4 style={{ margin: 0 }}>{widget.title || widget.type}</h4>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn-icon non-draggable" onMouseDown={(e) => e.stopPropagation()} onClick={() => setActiveWidget(widget)}>⚙️</button>
                                        <button className="btn-icon text-danger non-draggable" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); removeWidget(widget.id); }}>🗑️</button>
                                    </div>
                                </div>
                                <div className="widget-content-wrapper" style={{ flex: 1, minHeight: 0, position: 'relative', width: '100%', overflow: 'hidden' }}>
                                    {loadingData ? (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                            <span className="text-muted">Loading Data...</span>
                                        </div>
                                    ) : (
                                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                                            <WidgetRenderer 
                                                widget={widget} 
                                                data={aggregateData(orders, widget.config, 'All Time')}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        </ResponsiveGridLayoutWithWidth>
                        </div>
                    </div>

                    {/* Right Sidebar (desktop) / Modal (mobile+tablet) */}
                    {activeWidget && !isMobileOrTablet && (
                        <div className="config-sidebar-right">
                            <WidgetConfigPanel
                                widget={activeWidget}
                                onUpdate={(updated) => {
                                    setActiveWidget(updated);
                                    setWidgets(widgets.map(w => w.id === updated.id ? updated : w));
                                }}
                                onClose={() => setActiveWidget(null)}
                            />
                        </div>
                    )}

                </div>
            </div>

            {/* Widget Config Modal — shown on mobile/tablet (≤1024px) */}
            {activeWidget && isMobileOrTablet && (
                <div
                    className="modal-overlay"
                    onClick={(e) => { if (e.target === e.currentTarget) setActiveWidget(null); }}
                >
                    <div className="modal-content" style={{ maxWidth: '520px', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
                        <div className="modal-header">
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Widget configuration</h2>
                                <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                    {activeWidget.title || activeWidget.type}
                                </p>
                            </div>
                            <button
                                className="btn-icon"
                                onClick={() => setActiveWidget(null)}
                                style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}
                            >✕</button>
                        </div>
                        <div className="modal-body" style={{ flex: 1, overflowY: 'auto' }}>
                            <WidgetConfigPanel
                                widget={activeWidget}
                                hideHeader={true}
                                onUpdate={(updated) => {
                                    setActiveWidget(updated);
                                    setWidgets(widgets.map(w => w.id === updated.id ? updated : w));
                                }}
                                onClose={() => setActiveWidget(null)}
                            />
                        </div>
                    </div>
                </div>
            )}


            {/* Sticky Action Footer */}
            <div className="config-sticky-footer">
                <button 
                    className="btn btn-outline" 
                    onClick={() => navigate('/')} 
                    style={{ borderRadius: '4px', backgroundColor: 'white', borderColor: 'var(--primary)', color: 'var(--primary)', padding: '0.5rem 1.5rem' }}
                >
                    Cancel
                </button>
                <button 
                    className="btn btn-primary" 
                    onClick={handleSave} 
                    disabled={saving} 
                    style={{ borderRadius: '4px', backgroundColor: 'var(--primary)', borderColor: 'var(--primary)', color: 'white', padding: '0.5rem 1.5rem' }}
                >
                    {saving ? 'Saving...' : 'Save'}
                </button>
            </div>
        </div>
    );
};

export default ConfigureDashboard;
