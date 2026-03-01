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
        count: number;
        date: Date;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        userId: number;
    }>;
    findAll(req: any, take?: string, skip?: string): Promise<{
        entries: {
            count: number;
            date: Date;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            userId: number;
        }[];
        total: number;
        hasMore: boolean;
    }>;
    findToday(req: any): Promise<{
        entries: {
            count: number;
            date: Date;
            createdAt: Date;
            updatedAt: Date;
            id: number;
            userId: number;
        }[];
        totalCount: number;
        date: Date;
    }>;
    update(req: any, id: number, body: UpdatePushupDto): Promise<{
        count: number;
        date: Date;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        userId: number;
    }>;
    delete(req: any, id: number): Promise<{
        count: number;
        date: Date;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        userId: number;
    }>;
}
export {};
