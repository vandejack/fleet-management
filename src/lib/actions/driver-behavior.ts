'use server';

export interface DriverBehaviorEvent {
    id: number;
    vehicleId: string;
    driverId: string | null;
    eventType: 'harsh_braking' | 'harsh_acceleration' | 'harsh_cornering' | 'speeding';
    timestamp: Date;
    latitude: number | null;
    longitude: number | null;
    severity: 'low' | 'medium' | 'high';
    speed: number | null;
    gForce: number | null;
}

export interface DriverBehaviorFilters {
    vehicleId?: string;
    driverId?: string;
    eventType?: string;
    startDate?: Date;
    endDate?: Date;
}

export interface DriverBehaviorStats {
    totalEvents: number;
    byType: Record<string, number>;
    byVehicle: Record<string, number>;
    byDriver: Record<string, number>;
    bySeverity: Record<string, number>;
}

// Mock data generator for demonstration
function generateMockEvents(count: number = 50): DriverBehaviorEvent[] {
    const eventTypes: Array<'harsh_braking' | 'harsh_acceleration' | 'harsh_cornering' | 'speeding'> = [
        'harsh_braking',
        'harsh_acceleration',
        'harsh_cornering',
        'speeding'
    ];

    const severities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
    const vehicles = ['TRUCK-001', 'TRUCK-002', 'TRUCK-003', 'TRUCK-004', 'TRUCK-005'];
    const drivers = ['DRV-001', 'DRV-002', 'DRV-003', 'DRV-004'];

    const events: DriverBehaviorEvent[] = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const hoursAgo = Math.floor(Math.random() * 24);
        const timestamp = new Date(now);
        timestamp.setDate(timestamp.getDate() - daysAgo);
        timestamp.setHours(timestamp.getHours() - hoursAgo);

        events.push({
            id: i + 1,
            vehicleId: vehicles[Math.floor(Math.random() * vehicles.length)],
            driverId: Math.random() > 0.1 ? drivers[Math.floor(Math.random() * drivers.length)] : null,
            eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
            timestamp,
            latitude: -6.2 + (Math.random() * 0.2),
            longitude: 106.8 + (Math.random() * 0.2),
            severity: severities[Math.floor(Math.random() * severities.length)],
            speed: Math.floor(Math.random() * 40) + 60,
            gForce: Math.random() * 2 + 0.5,
        });
    }

    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// TODO: Replace with actual database query when database is set up
export async function getDriverBehaviorEvents(filters?: DriverBehaviorFilters): Promise<DriverBehaviorEvent[]> {
    try {
        // Generate mock data
        let events = generateMockEvents(100);

        // Apply filters
        if (filters?.vehicleId) {
            events = events.filter(e => e.vehicleId === filters.vehicleId);
        }

        if (filters?.driverId) {
            events = events.filter(e => e.driverId === filters.driverId);
        }

        if (filters?.eventType) {
            events = events.filter(e => e.eventType === filters.eventType);
        }

        if (filters?.startDate) {
            events = events.filter(e => new Date(e.timestamp) >= filters.startDate!);
        }

        if (filters?.endDate) {
            events = events.filter(e => new Date(e.timestamp) <= filters.endDate!);
        }

        return events;
    } catch (error) {
        console.error('Error fetching driver behavior events:', error);
        return [];
    }
}

export async function getDriverBehaviorStats(filters?: DriverBehaviorFilters): Promise<DriverBehaviorStats> {
    try {
        const events = await getDriverBehaviorEvents(filters);

        const stats: DriverBehaviorStats = {
            totalEvents: events.length,
            byType: {},
            byVehicle: {},
            byDriver: {},
            bySeverity: {},
        };

        events.forEach(event => {
            // By type
            stats.byType[event.eventType] = (stats.byType[event.eventType] || 0) + 1;

            // By vehicle
            stats.byVehicle[event.vehicleId] = (stats.byVehicle[event.vehicleId] || 0) + 1;

            // By driver
            if (event.driverId) {
                stats.byDriver[event.driverId] = (stats.byDriver[event.driverId] || 0) + 1;
            }

            // By severity
            stats.bySeverity[event.severity] = (stats.bySeverity[event.severity] || 0) + 1;
        });

        return stats;
    } catch (error) {
        console.error('Error calculating driver behavior stats:', error);
        return {
            totalEvents: 0,
            byType: {},
            byVehicle: {},
            byDriver: {},
            bySeverity: {},
        };
    }
}

export async function getEventsByTimeOfDay(filters?: DriverBehaviorFilters): Promise<Record<number, number>> {
    try {
        const events = await getDriverBehaviorEvents(filters);
        const byHour: Record<number, number> = {};

        // Initialize all hours
        for (let i = 0; i < 24; i++) {
            byHour[i] = 0;
        }

        events.forEach(event => {
            const hour = new Date(event.timestamp).getHours();
            byHour[hour] = (byHour[hour] || 0) + 1;
        });

        return byHour;
    } catch (error) {
        console.error('Error getting events by time of day:', error);
        return {};
    }
}

export async function getEventsTrend(filters?: DriverBehaviorFilters, days: number = 30): Promise<Array<{ date: string; count: number }>> {
    try {
        const events = await getDriverBehaviorEvents(filters);
        const trendData: Record<string, number> = {};

        // Initialize last N days
        const today = new Date();
        for (let i = 0; i < days; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            trendData[dateStr] = 0;
        }

        events.forEach(event => {
            const dateStr = new Date(event.timestamp).toISOString().split('T')[0];
            if (trendData.hasOwnProperty(dateStr)) {
                trendData[dateStr]++;
            }
        });

        return Object.entries(trendData)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
        console.error('Error getting events trend:', error);
        return [];
    }
}
