import { AuthService } from './auth.service';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { AuthLoginDto } from './dto/auth-login.dto';
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    register(dto: AuthRegisterDto): Promise<{
        accessToken: string;
    }>;
    login(dto: AuthLoginDto): Promise<{
        accessToken: string;
    }>;
}
