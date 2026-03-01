import { PrismaService } from '../prisma/prisma.service';
export declare class StatsService {
    private prisma;
    constructor(prisma: PrismaService);
    getPersonalStats(userId: number): Promise<Record<string, number>>;
    getWeeklyStats(userId: number): Promise<Record<string, number>>;
    getGroupStats(groupId: number): Promise<{
        userId: number;
        name: string;
        daily: {
            date: string;
            count: number;
        }[];
        weekly: {
            week: string;
            count: number;
        }[];
    }[]>;
}
