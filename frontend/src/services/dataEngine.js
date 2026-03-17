import { subDays, subMonths, isAfter, startOfDay, parseISO } from 'date-fns';

/**
 * Filter customer orders based on date selection
 */
export const filterDataByDate = (data, dateFilter) => {
    if (!data || data.length === 0) return [];
    if (dateFilter === 'ALL') return data;

    const today = startOfDay(new Date());
    let cutoffDate = null;

    switch (dateFilter) {
        case 'TODAY':
            cutoffDate = today;
            break;
        case 'LAST_7_DAYS':
            cutoffDate = subDays(today, 7);
            break;
        case 'LAST_30_DAYS':
            cutoffDate = subDays(today, 30);
            break;
        case 'LAST_MONTH':
            cutoffDate = subMonths(today, 1);
            break;
        default:
            return data;
    }

    return data.filter(item => {
        // Assume _id embedding timestamp or fallback to new Date() if missing created_at
        // In a real app we'd have a strictly formatted created_at date
        // As a fallback for this demo, returning all if we can't parse date
        if (!item.created_at && !item._id) return true;

        try {
            // Extract roughly from ObjectId if no created_at exists
            let itemDate = new Date();
            if (item.created_at) {
                itemDate = parseISO(item.created_at);
            } else if (item._id && typeof item._id === 'string' && item._id.length === 24) {
                itemDate = new Date(parseInt(item._id.substring(0, 8), 16) * 1000);
            }
            return isAfter(itemDate, cutoffDate);
        } catch (e) {
            return true;
        }
    });
};

/**
 * Aggregates data for charts and KPIs based on widget config
 */
export const aggregateData = (data, config) => {
    if (!data || data.length === 0) return [];

    // Filter out restricted statuses globally
    const filteredData = data.filter(item => 
        item.status !== 'Shipped' && item.status !== 'Cancelled'
    );

    const { xAxis = 'product', yAxis = 'total_amount', aggregation = 'SUM' } = config;

    // Grouping for Charts
    if (xAxis) {
        const grouped = filteredData.reduce((acc, item) => {
            const key = item[xAxis] || 'Unknown';
            if (!acc[key]) {
                acc[key] = { count: 0, sum: 0, items: [] };
            }

            const val = parseFloat(item[yAxis]) || 0;
            acc[key].count += 1;
            acc[key].sum += val;
            acc[key].items.push(item);

            return acc;
        }, {});

        // Formatting back to array for Recharts
        return Object.keys(grouped).map(key => {
            const group = grouped[key];
            let value = 0;

            if (aggregation === 'SUM') value = group.sum;
            else if (aggregation === 'AVG') value = group.sum / group.count;
            else if (aggregation === 'COUNT') value = group.count;

            return {
                [xAxis]: key, // e.g. "product": "Laptop"
                [yAxis]: Number(value.toFixed(2)) // e.g. "total_amount": 5400.00
            };
        });
    }

    return filteredData;
};

/**
 * Single value aggregation for KPI widgets
 */
export const aggregateKpi = (data, config) => {
    if (!data || data.length === 0) return 0;

    // Filter out restricted statuses globally
    const filteredData = data.filter(item => 
        item.status !== 'Shipped' && item.status !== 'Cancelled'
    );

    const { yAxis = 'total_amount', aggregation = 'SUM' } = config;

    let total = 0;
    filteredData.forEach(item => {
        total += parseFloat(item[yAxis]) || 0;
    });

    if (aggregation === 'SUM') return Number(total.toFixed(2));
    if (aggregation === 'AVG') return Number((total / filteredData.length).toFixed(2));
    if (aggregation === 'COUNT') return filteredData.length;

    return 0;
};
