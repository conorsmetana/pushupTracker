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
exports.PushupsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PushupsService = class PushupsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, count, date) {
        const entryDate = date || new Date();
        entryDate.setHours(0, 0, 0, 0);
        return this.prisma.pushupEntry.create({
            data: {
                userId,
                count,
                date: entryDate,
            },
        });
    }
    async findAll(userId, take = 30, skip = 0) {
        const [entries, total] = await Promise.all([
            this.prisma.pushupEntry.findMany({
                where: { userId },
                orderBy: { date: 'desc' },
                take,
                skip,
            }),
            this.prisma.pushupEntry.count({ where: { userId } }),
        ]);
        return {
            entries,
            total,
            hasMore: skip + take < total,
        };
    }
    async findToday(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const entries = await this.prisma.pushupEntry.findMany({
            where: {
                userId,
                date: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });
        const totalCount = entries.reduce((sum, entry) => sum + entry.count, 0);
        return {
            entries,
            totalCount,
            date: today,
        };
    }
    async update(id, userId, count) {
        const entry = await this.prisma.pushupEntry.findUnique({
            where: { id },
        });
        if (!entry) {
            throw new common_1.NotFoundException('Entry not found');
        }
        if (entry.userId !== userId) {
            throw new common_1.ForbiddenException('Not authorized to update this entry');
        }
        return this.prisma.pushupEntry.update({
            where: { id },
            data: { count },
        });
    }
    async delete(id, userId) {
        const entry = await this.prisma.pushupEntry.findUnique({
            where: { id },
        });
        if (!entry) {
            throw new common_1.NotFoundException('Entry not found');
        }
        if (entry.userId !== userId) {
            throw new common_1.ForbiddenException('Not authorized to delete this entry');
        }
        return this.prisma.pushupEntry.delete({
            where: { id },
        });
    }
};
exports.PushupsService = PushupsService;
exports.PushupsService = PushupsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PushupsService);
//# sourceMappingURL=pushups.service.js.map