import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
	constructor(private readonly users: UsersService) {}

	@Get('me')
	async me(@Req() req: any) {
		const u = await this.users.findById(req.user.userId);
		return { id: u.id, email: u.email, createdAt: u.createdAt };
	}

	@Patch('me/password')
	async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
		return await this.users.changePassword(req.user.userId, dto.currentPassword, dto.newPassword);
	}
}
