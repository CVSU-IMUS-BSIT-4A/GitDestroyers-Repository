import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
	constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

	async findById(id: number) {
		const u = await this.users.findOne({ where: { id } });
		if (!u) throw new NotFoundException('User not found');
		return u;
	}

	async changePassword(userId: number, currentPassword: string, newPassword: string) {
		const user = await this.findById(userId);
		const ok = await bcrypt.compare(currentPassword, user.passwordHash);
		if (!ok) throw new ForbiddenException('Current password is incorrect');
		const hash = await bcrypt.hash(newPassword, 10);
		user.passwordHash = hash;
		await this.users.save(user);
		return { success: true };
	}

}
