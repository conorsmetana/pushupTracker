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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushupsController = void 0;
const common_1 = require("@nestjs/common");
const pushups_service_1 = require("./pushups.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
class CreatePushupDto {
    count;
    date;
}
class UpdatePushupDto {
    count;
}
let PushupsController = class PushupsController {
    pushupsService;
    constructor(pushupsService) {
        this.pushupsService = pushupsService;
    }
    async create(req, body) {
        const date = body.date ? new Date(body.date) : undefined;
        return this.pushupsService.create(req.user.userId, body.count, date);
    }
    async findAll(req, take, skip) {
        return this.pushupsService.findAll(req.user.userId, take ? parseInt(take, 10) : 30, skip ? parseInt(skip, 10) : 0);
    }
    async findToday(req) {
        return this.pushupsService.findToday(req.user.userId);
    }
    async update(req, id, body) {
        return this.pushupsService.update(id, req.user.userId, body.count);
    }
    async delete(req, id) {
        return this.pushupsService.delete(id, req.user.userId);
    }
};
exports.PushupsController = PushupsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreatePushupDto]),
    __metadata("design:returntype", Promise)
], PushupsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('take')),
    __param(2, (0, common_1.Query)('skip')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PushupsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('today'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PushupsController.prototype, "findToday", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, UpdatePushupDto]),
    __metadata("design:returntype", Promise)
], PushupsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], PushupsController.prototype, "delete", null);
exports.PushupsController = PushupsController = __decorate([
    (0, common_1.Controller)('api/pushups'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [pushups_service_1.PushupsService])
], PushupsController);
//# sourceMappingURL=pushups.controller.js.map