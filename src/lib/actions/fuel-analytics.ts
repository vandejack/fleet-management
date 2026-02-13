'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';

// Default configuration (can be moved to SystemSettings later)
const DEFAULT_TANK_CAPACITY = 60; // Liters
const DEFAULT_FUEL_PRICE = 14500; // Rp per liter
const REFUELING_THRESHOLD = 10; // % increase to detect refueling

interface FuelAnalytics {
    vehicleId: string;
    vehicleName: string;
    distanceTraveled: number;
    fuelConsumed: number;
    efficiency: number;
    refuelingCount: number;
    estimatedCost: number;
}

interface RefuelingEvent {
    timestamp: Date;
    fuelAdded: number;
    location: { lat: number; lng: number };
    odometer: number | null;
    vehicleId: string;
    vehicleName?: string;
}

interface DailyTrend {
    date: string;
    distance: number;
    consumption: number;
    cost: number;
    efficiency: number;
}

/**
 * Get comprehensive fuel analytics for a period
 */
export async function getFuelAnalytics(options: {
    startDate: string;
    endDate: string;
    vehicleId?: string;
}) {
    const session = await auth();
    if (!session?.user) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        // Build where clause
        const where: any = {
            timestamp: {
                gte: new Date(options.startDate),
                lte: new Date(options.endDate),
            },
            fuelLevel: { not: null },
            odometer: { not: null },
        };

        if (options.vehicleId) {
            where.vehicleId = options.vehicleId;
        }

        // Get location history with fuel and odometer data
        const locationData = await prisma.locationHistory.findMany({
            where,
            orderBy: { timestamp: 'asc' },
            include: {
                vehicle: {
                    select: {
                        id: true,
                        name: true,
                        plate: true,
                        fuelType: true,
                    },
                },
            },
        });

        if (locationData.length === 0) {
            return {
                success: true,
                analytics: [],
                summary: {
                    totalDistance: 0,
                    totalFuelConsumed: 0,
                    totalCost: 0,
                    averageEfficiency: 0,
                    totalRefuelings: 0,
                }
            };
        }

        // Calculate analytics
        const analytics = calculateAnalytics(locationData);

        // Calculate summary
        const summary = {
            totalDistance: analytics.reduce((sum, a) => sum + a.distanceTraveled, 0),
            totalFuelConsumed: analytics.reduce((sum, a) => sum + a.fuelConsumed, 0),
            totalCost: analytics.reduce((sum, a) => sum + a.estimatedCost, 0),
            averageEfficiency: analytics.length > 0
                ? analytics.reduce((sum, a) => sum + a.efficiency, 0) / analytics.length
                : 0,
            totalRefuelings: analytics.reduce((sum, a) => sum + a.refuelingCount, 0),
        };

        return {
            success: true,
            analytics,
            summary,
        };
    } catch (error) {
        console.error('Error in getFuelAnalytics:', error);
        return {
            success: false,
            error: 'Failed to calculate fuel analytics'
        };
    }
}

/**
 * Detect refueling events from GPS fuel level data
 */
export async function detectRefuelingEvents(
    vehicleId: string | 'all',
    days = 30
) {
    const session = await auth();
    if (!session?.user) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const where: any = {
            timestamp: { gte: startDate },
            fuelLevel: { not: null },
        };

        if (vehicleId !== 'all') {
            where.vehicleId = vehicleId;
        }

        const history = await prisma.locationHistory.findMany({
            where,
            orderBy: { timestamp: 'asc' },
            include: {
                vehicle: {
                    select: { id: true, name: true, plate: true },
                },
            },
        });

        const refuelings: RefuelingEvent[] = [];

        // Group by vehicle for accurate detection
        const byVehicle = groupBy(history, 'vehicleId');

        Object.values(byVehicle).forEach((vehicleData: any[]) => {
            for (let i = 1; i < vehicleData.length; i++) {
                const prev = vehicleData[i - 1];
                const curr = vehicleData[i];

                const fuelIncrease = (curr.fuelLevel || 0) - (prev.fuelLevel || 0);

                // Detect refueling (significant fuel increase)
                if (fuelIncrease > REFUELING_THRESHOLD) {
                    refuelings.push({
                        timestamp: curr.timestamp,
                        fuelAdded: fuelIncrease,
                        location: { lat: curr.lat, lng: curr.lng },
                        odometer: curr.odometer,
                        vehicleId: curr.vehicleId,
                        vehicleName: curr.vehicle.name,
                    });
                }
            }
        });

        // Sort by timestamp descending (most recent first)
        refuelings.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        return { success: true, refuelings };
    } catch (error) {
        console.error('Error in detectRefuelingEvents:', error);
        return {
            success: false,
            error: 'Failed to detect refueling events'
        };
    }
}

/**
 * Calculate fuel efficiency for a specific vehicle
 */
export async function calculateFuelEfficiency(
    vehicleId: string,
    periodDays = 30
) {
    const session = await auth();
    if (!session?.user) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - periodDays);

        const data = await prisma.locationHistory.findMany({
            where: {
                vehicleId,
                timestamp: { gte: startDate },
                odometer: { not: null },
                fuelLevel: { not: null },
            },
            orderBy: { timestamp: 'asc' },
        });

        if (data.length < 2) {
            return {
                success: false,
                error: 'Insufficient data for efficiency calculation'
            };
        }

        const first = data[0];
        const last = data[data.length - 1];

        // Calculate distance traveled
        const distance = (last.odometer || 0) - (first.odometer || 0);

        // Calculate fuel consumed (excluding refueling)
        let fuelConsumed = 0;
        for (let i = 1; i < data.length; i++) {
            const prev = data[i - 1];
            const curr = data[i];
            const fuelChange = (prev.fuelLevel || 0) - (curr.fuelLevel || 0);

            // Only count fuel decrease (consumption), skip increases (refueling)
            if (fuelChange > 0 && fuelChange < REFUELING_THRESHOLD) {
                fuelConsumed += fuelChange;
            }
        }

        // Convert percentage to liters
        const litersConsumed = (fuelConsumed / 100) * DEFAULT_TANK_CAPACITY;

        const efficiency = litersConsumed > 0 ? distance / litersConsumed : 0;

        return {
            success: true,
            efficiency: {
                distance,
                fuelConsumed: litersConsumed,
                efficiency,
                periodDays,
                dataPoints: data.length,
            },
        };
    } catch (error) {
        console.error('Error in calculateFuelEfficiency:', error);
        return {
            success: false,
            error: 'Failed to calculate fuel efficiency'
        };
    }
}

/**
 * Get daily consumption trends
 */
export async function getDailyConsumptionTrend(options: {
    startDate: string;
    endDate: string;
    vehicleId?: string;
}) {
    const session = await auth();
    if (!session?.user) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const where: any = {
            timestamp: {
                gte: new Date(options.startDate),
                lte: new Date(options.endDate),
            },
            fuelLevel: { not: null },
            odometer: { not: null },
        };

        if (options.vehicleId) {
            where.vehicleId = options.vehicleId;
        }

        const locationData = await prisma.locationHistory.findMany({
            where,
            orderBy: { timestamp: 'asc' },
        });

        // Group by day
        const dailyData = groupByDay(locationData);

        return { success: true, dailyTrends: dailyData };
    } catch (error) {
        console.error('Error in getDailyConsumptionTrend:', error);
        return {
            success: false,
            error: 'Failed to get daily consumption trends'
        };
    }
}

// ============================================================================
// Helper Functions
// ============================================================================

function calculateAnalytics(locationData: any[]): FuelAnalytics[] {
    // Group by vehicle
    const byVehicle = groupBy(locationData, 'vehicleId');

    const results: FuelAnalytics[] = Object.entries(byVehicle).map(([vehicleId, data]) => {
        const sorted = (data as any[]).sort((a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        const first = sorted[0];
        const last = sorted[sorted.length - 1];

        // Calculate distance traveled
        const distanceTraveled = (last.odometer || 0) - (first.odometer || 0);

        // Calculate fuel consumed and count refuelings
        let totalFuelConsumed = 0;
        let refuelingCount = 0;

        for (let i = 1; i < sorted.length; i++) {
            const prev = sorted[i - 1];
            const curr = sorted[i];
            const fuelChange = (prev.fuelLevel || 0) - (curr.fuelLevel || 0);

            if (fuelChange > REFUELING_THRESHOLD) {
                // This is a refueling event
                refuelingCount++;
            } else if (fuelChange > 0) {
                // This is fuel consumption
                totalFuelConsumed += fuelChange;
            }
        }

        // Convert percentage to liters
        const litersConsumed = (totalFuelConsumed / 100) * DEFAULT_TANK_CAPACITY;
        const efficiency = litersConsumed > 0 ? distanceTraveled / litersConsumed : 0;
        const estimatedCost = litersConsumed * DEFAULT_FUEL_PRICE;

        return {
            vehicleId,
            vehicleName: first.vehicle.name,
            distanceTraveled,
            fuelConsumed: litersConsumed,
            efficiency,
            refuelingCount,
            estimatedCost,
        };
    });

    return results;
}

function groupByDay(data: any[]): DailyTrend[] {
    const byDay: Record<string, any[]> = {};

    data.forEach(item => {
        const day = item.timestamp.toISOString().split('T')[0];
        if (!byDay[day]) byDay[day] = [];
        byDay[day].push(item);
    });

    return Object.entries(byDay).map(([date, dayData]) => {
        const sorted = dayData.sort((a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        const first = sorted[0];
        const last = sorted[sorted.length - 1];

        const distance = (last.odometer || 0) - (first.odometer || 0);
        let fuelConsumed = 0;

        for (let i = 1; i < sorted.length; i++) {
            const prev = sorted[i - 1];
            const curr = sorted[i];
            const change = (prev.fuelLevel || 0) - (curr.fuelLevel || 0);

            // Exclude refueling events
            if (change > 0 && change < REFUELING_THRESHOLD) {
                fuelConsumed += change;
            }
        }

        const liters = (fuelConsumed / 100) * DEFAULT_TANK_CAPACITY;
        const cost = liters * DEFAULT_FUEL_PRICE;

        return {
            date,
            distance,
            consumption: liters,
            cost,
            efficiency: liters > 0 ? distance / liters : 0,
        };
    });
}

function groupBy(array: any[], key: string): Record<string, any[]> {
    return array.reduce((result, item) => {
        const groupKey = item[key];
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {});
}
