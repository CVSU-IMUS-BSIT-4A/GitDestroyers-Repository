import { Body, Controller, Get, Param, Patch, Post, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  findAll() {
    return this.users.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.users.findOne(Number(id));
  }

  @Post()
  create(@Body() body: CreateUserDto) {
    return this.users.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<{ email: string; name: string }>) {
    return this.users.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.users.remove(Number(id));
  }
}
