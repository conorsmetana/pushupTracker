import { Strategy } from 'passport-jwt';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptions] | [opt: import("passport-jwt").StrategyOptions]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: any): Promise<{
        id: any;
        email: any;
    }>;
}
export {};
