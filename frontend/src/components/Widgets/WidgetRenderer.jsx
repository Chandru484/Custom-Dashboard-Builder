import React from 'react';
import KpiCard from './KpiCard';
import BarChartWidget from './BarChartWidget';
import LineChartWidget from './LineChartWidget';
import PieChartWidget from './PieChartWidget';
import AreaChartWidget from './AreaChartWidget';
import ScatterPlotWidget from './ScatterPlotWidget';
import TableWidget from './TableWidget';

const WidgetRenderer = ({ widget, data }) => {
    // data represents the customer orders array passed down

    switch (widget.type) {
        case 'KPI':
            return <KpiCard config={widget.config} data={data} />;
        case 'BAR_CHART':
            return <BarChartWidget config={widget.config} data={data} />;
        case 'LINE_CHART':
            return <LineChartWidget config={widget.config} data={data} />;
        case 'PIE_CHART':
            return <PieChartWidget config={widget.config} data={data} />;
        case 'AREA_CHART':
            return <AreaChartWidget config={widget.config} data={data} />;
        case 'SCATTER_PLOT':
            return <ScatterPlotWidget config={widget.config} data={data} />;
        case 'TABLE':
            return <TableWidget config={widget.config} data={data} style={widget.style} />;
        default:
            return <div>Unknown Widget Type</div>;
    }
};

export default WidgetRenderer;
