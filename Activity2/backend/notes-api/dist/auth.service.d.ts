import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
export declare class AuthService {
    private readonly users;
    private readonly jwt;
    constructor(users: Repository<User>, jwt: JwtService);
    register(dto: AuthRegisterDto): Promise<{
        accessToken: string;
    }>;
    login(dto: AuthLoginDto): Promise<{
        accessToken: string;
    }>;
    private issueToken;
}
