"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StatsService = class StatsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPersonalStats(userId) {
        const since = new Date();
        since.setDate(since.getDate() - 29);
        since.setHours(0, 0, 0, 0);
        const entries = await this.prisma.pushupEntry.findMany({
            where: { userId, date: { gte: since } },
            orderBy: { date: 'asc' },
        });
        const stats = {};
        for (let i = 0; i < 30; i++) {
            const d = new Date(since);
            d.setDate(since.getDate() + i);
            const key = d.toISOString().slice(0, 10);
            stats[key] = 0;
        }
        for (const entry of entries) {
            const key = entry.date.toISOString().slice(0, 10);
            stats[key] = (stats[key] || 0) + entry.count;
        }
        return stats;
    }
    async getWeeklyStats(userId) {
        const now = new Date();
        const stats = {};
        for (let i = 0; i < 12; i++) {
            const start = new Date(now);
            start.setDate(now.getDate() - now.getDay() - i * 7);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setDate(start.getDate() + 7);
            const key = start.toISOString().slice(0, 10);
            const total = await this.prisma.pushupEntry.aggregate({
                _sum: { count: true },
                where: {
                    userId,
                    date: { gte: start, lt: end },
                },
            });
            stats[key] = total._sum.count || 0;
        }
        return stats;
    }
    async getGroupStats(groupId) {
        const since = new Date();
        since.setDate(since.getDate() - 29);
        since.setHours(0, 0, 0, 0);
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() - 11 * 7);
        weekStart.setHours(0, 0, 0, 0);
        const members = await this.prisma.groupMember.findMany({
            where: { groupId },
            include: {
                user: {
                    select: { id: true, name: true, pushupEntries: true },
                },
            },
        });
        const stats = members.map((m) => ({
            userId: m.user.id,
            name: m.user.name,
            daily: Array.from({ length: 30 }, (_, i) => {
                const d = new Date(since);
                d.setDate(since.getDate() + i);
                const key = d.toISOString().slice(0, 10);
                return {
                    date: key,
                    count: m.user.pushupEntries.filter((e) => e.date.toISOString().slice(0, 10) === key).reduce((sum, e) => sum + e.count, 0),
                };
            }),
            weekly: Array.from({ length: 12 }, (_, i) => {
                const start = new Date(weekStart);
                start.setDate(weekStart.getDate() + i * 7);
                const end = new Date(start);
                end.setDate(start.getDate() + 7);
                const key = start.toISOString().slice(0, 10);
                const count = m.user.pushupEntries.filter((e) => {
                    const dt = e.date;
                    return dt >= start && dt < end;
                }).reduce((sum, e) => sum + e.count, 0);
                return { week: key, count };
            }),
        }));
        return stats;
    }
};
exports.StatsService = StatsService;
exports.StatsService = StatsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StatsService);
//# sourceMappingURL=stats.service.js.map