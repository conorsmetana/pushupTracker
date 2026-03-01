import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): Promise<{
        id: number;
        email: string;
        password: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    findById(id: number): Promise<{
        id: number;
        email: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    create(email: string, password: string, name: string): Promise<{
        id: number;
        email: string;
        name: string;
        createdAt: Date;
    }>;
    updateProfile(id: number, data: {
        name?: string;
        email?: string;
    }): Promise<{
        id: number;
        email: string;
        name: string;
        updatedAt: Date;
    }>;
    validatePassword(user: {
        password: string;
    }, password: string): Promise<boolean>;
}
