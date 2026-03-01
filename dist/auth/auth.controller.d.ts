import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
declare class RegisterDto {
    email: string;
    password: string;
    name: string;
}
declare class UpdateProfileDto {
    name?: string;
    email?: string;
}
export declare class AuthController {
    private authService;
    private usersService;
    constructor(authService: AuthService, usersService: UsersService);
    register(body: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: number;
            email: string;
            name: string;
            createdAt: Date;
        };
    }>;
    login(req: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
        };
    }>;
    getProfile(req: any): Promise<{
        id: number;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    updateProfile(req: any, body: UpdateProfileDto): Promise<{
        id: number;
        email: string;
        name: string;
        updatedAt: Date;
    }>;
}
export {};
