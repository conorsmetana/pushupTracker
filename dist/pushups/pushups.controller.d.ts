import { PushupsService } from './pushups.service';
declare class CreatePushupDto {
    count: number;
    date?: string;
}
declare class UpdatePushupDto {
    count: number;
}
export declare class PushupsController {
    private pushupsService;
    constructor(pushupsService: PushupsService);
    create(req: any, body: CreatePushupDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        count: number;
        date: Date;
        userId: number;
    }>;
    findAll(req: any, take?: string, skip?: string): Promise<{
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
    findToday(req: any): Promise<{
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
    update(req: any, id: number, body: UpdatePushupDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        count: number;
        date: Date;
        userId: number;
    }>;
    delete(req: any, id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        count: number;
        date: Date;
        userId: number;
    }>;
}
export {};
