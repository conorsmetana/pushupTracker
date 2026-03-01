import { PrismaService } from '../prisma/prisma.service';
export declare class PushupsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: number, count: number, date?: Date): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        count: number;
        date: Date;
        userId: number;
    }>;
    findAll(userId: number, take?: number, skip?: number): Promise<{
        entries: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            count: number;
            date: Date;
            userId: number;
        }[];
        total: number;
        hasMore: boolean;
    }>;
    findToday(userId: number): Promise<{
        entries: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            count: number;
            date: Date;
            userId: number;
        }[];
        totalCount: number;
        date: Date;
    }>;
    update(id: number, userId: number, count: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        count: number;
        date: Date;
        userId: number;
    }>;
    delete(id: number, userId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        count: number;
        date: Date;
        userId: number;
    }>;
}
