import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
export declare class UsersService {
    private readonly users;
    constructor(users: Repository<User>);
    findById(id: number): Promise<User>;
    changePassword(userId: number, currentPassword: string, newPassword: string): Promise<{
        success: boolean;
    }>;
}
