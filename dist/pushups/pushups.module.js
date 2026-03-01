"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushupsModule = void 0;
const common_1 = require("@nestjs/common");
const pushups_service_1 = require("./pushups.service");
const pushups_controller_1 = require("./pushups.controller");
let PushupsModule = class PushupsModule {
};
exports.PushupsModule = PushupsModule;
exports.PushupsModule = PushupsModule = __decorate([
    (0, common_1.Module)({
        providers: [pushups_service_1.PushupsService],
        controllers: [pushups_controller_1.PushupsController],
        exports: [pushups_service_1.PushupsService],
    })
], PushupsModule);
//# sourceMappingURL=pushups.module.js.map