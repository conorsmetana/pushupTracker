import { StatsService } from './stats.service';
export declare class StatsController {
    private statsService;
    constructor(statsService: StatsService);
    getPersonal(req: any): Promise<{
        daily: Record<string, number>;
        weekly: Record<string, number>;
    }>;
    getGroup(req: any, id: number): Promise<{
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
