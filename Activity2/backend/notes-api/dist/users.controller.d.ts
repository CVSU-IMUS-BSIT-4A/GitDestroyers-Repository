import { UsersService } from './users.service';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class UsersController {
    private readonly users;
    constructor(users: UsersService);
    me(req: any): Promise<{
        id: number;
        email: string;
        createdAt: Date;
    }>;
    changePassword(req: any, dto: ChangePasswordDto): Promise<{
        success: boolean;
    }>;
}
