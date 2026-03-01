import { GroupsService } from './groups.service';
export declare class GroupsController {
    private groupsService;
    constructor(groupsService: GroupsService);
    create(req: any, name: string): Promise<{
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
    findAll(req: any): Promise<({
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
    findOne(req: any, id: number): Promise<{
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
    join(req: any, inviteCode: string): Promise<{
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
    getMembers(req: any, id: number): Promise<({
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
    getLeaderboard(req: any, id: number, period?: 'today' | 'week' | 'month'): Promise<{
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
    removeMember(req: any, id: number, memberId: number): Promise<{
        message: string;
    }>;
    leave(req: any, id: number): Promise<{
        message: string;
    }>;
}
