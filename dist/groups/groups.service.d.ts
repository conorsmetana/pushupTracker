import { PrismaService } from '../prisma/prisma.service';
export declare class GroupsService {
    private prisma;
    constructor(prisma: PrismaService);
    private generateInviteCode;
    create(userId: number, name: string): Promise<{
        members: ({
            user: {
                id: number;
                email: string;
                name: string;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            role: string;
            groupId: number;
        })[];
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        inviteCode: string;
    }>;
    findUserGroups(userId: number): Promise<({
        _count: {
            members: number;
        };
        members: ({
            user: {
                id: number;
                email: string;
                name: string;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            role: string;
            groupId: number;
        })[];
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        inviteCode: string;
    })[]>;
    findOne(id: number, userId: number): Promise<{
        members: ({
            user: {
                id: number;
                email: string;
                name: string;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            role: string;
            groupId: number;
        })[];
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        inviteCode: string;
    }>;
    join(userId: number, inviteCode: string): Promise<{
        members: ({
            user: {
                id: number;
                email: string;
                name: string;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            role: string;
            groupId: number;
        })[];
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        inviteCode: string;
    }>;
    getMembers(groupId: number, userId: number): Promise<({
        user: {
            id: number;
            email: string;
            name: string;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        role: string;
        groupId: number;
    })[]>;
    getLeaderboard(groupId: number, userId: number, period?: 'today' | 'week' | 'month'): Promise<{
        period: "week" | "today" | "month";
        startDate: Date;
        leaderboard: {
            userId: number;
            name: string;
            email: string;
            totalPushups: number;
            entriesCount: number;
        }[];
    }>;
    leave(groupId: number, userId: number, memberId?: number): Promise<{
        message: string;
    }>;
}
