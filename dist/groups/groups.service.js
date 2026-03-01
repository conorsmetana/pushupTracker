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
exports.GroupsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_1 = require("crypto");
let GroupsService = class GroupsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateInviteCode() {
        return (0, crypto_1.randomBytes)(4).toString('hex').toUpperCase();
    }
    async create(userId, name) {
        const inviteCode = this.generateInviteCode();
        const group = await this.prisma.group.create({
            data: {
                name,
                inviteCode,
                members: {
                    create: {
                        userId,
                        role: 'owner',
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                },
            },
        });
        return group;
    }
    async findUserGroups(userId) {
        return this.prisma.group.findMany({
            where: {
                members: {
                    some: { userId },
                },
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                },
                _count: {
                    select: { members: true },
                },
            },
        });
    }
    async findOne(id, userId) {
        const group = await this.prisma.group.findUnique({
            where: { id },
            include: {
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                },
            },
        });
        if (!group) {
            throw new common_1.NotFoundException('Group not found');
        }
        const isMember = group.members.some((m) => m.userId === userId);
        if (!isMember) {
            throw new common_1.ForbiddenException('You are not a member of this group');
        }
        return group;
    }
    async join(userId, inviteCode) {
        const group = await this.prisma.group.findUnique({
            where: { inviteCode: inviteCode.toUpperCase() },
        });
        if (!group) {
            throw new common_1.NotFoundException('Invalid invite code');
        }
        const existingMember = await this.prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId,
                    groupId: group.id,
                },
            },
        });
        if (existingMember) {
            throw new common_1.BadRequestException('You are already a member of this group');
        }
        await this.prisma.groupMember.create({
            data: {
                userId,
                groupId: group.id,
                role: 'member',
            },
        });
        return this.findOne(group.id, userId);
    }
    async getMembers(groupId, userId) {
        await this.findOne(groupId, userId);
        return this.prisma.groupMember.findMany({
            where: { groupId },
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }
    async getLeaderboard(groupId, userId, period = 'week') {
        await this.findOne(groupId, userId);
        const now = new Date();
        let startDate;
        switch (period) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                const dayOfWeek = now.getDay();
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
        }
        const members = await this.prisma.groupMember.findMany({
            where: { groupId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        pushupEntries: {
                            where: {
                                date: { gte: startDate },
                            },
                        },
                    },
                },
            },
        });
        const leaderboard = members
            .map((member) => ({
            userId: member.user.id,
            name: member.user.name,
            email: member.user.email,
            totalPushups: member.user.pushupEntries.reduce((sum, entry) => sum + entry.count, 0),
            entriesCount: member.user.pushupEntries.length,
        }))
            .sort((a, b) => b.totalPushups - a.totalPushups);
        return {
            period,
            startDate,
            leaderboard,
        };
    }
    async leave(groupId, userId, memberId) {
        const group = await this.findOne(groupId, userId);
        const targetUserId = memberId || userId;
        const currentMember = group.members.find((m) => m.userId === userId);
        const targetMember = group.members.find((m) => m.userId === targetUserId);
        if (!targetMember) {
            throw new common_1.NotFoundException('Member not found');
        }
        if (targetUserId !== userId && currentMember?.role !== 'owner') {
            throw new common_1.ForbiddenException('Only group owners can remove members');
        }
        if (targetMember.role === 'owner') {
            const ownerCount = group.members.filter((m) => m.role === 'owner').length;
            if (ownerCount === 1) {
                throw new common_1.BadRequestException('Cannot leave group as the only owner. Transfer ownership or delete the group.');
            }
        }
        await this.prisma.groupMember.delete({
            where: {
                userId_groupId: {
                    userId: targetUserId,
                    groupId,
                },
            },
        });
        return { message: 'Successfully left the group' };
    }
};
exports.GroupsService = GroupsService;
exports.GroupsService = GroupsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GroupsService);
//# sourceMappingURL=groups.service.js.map