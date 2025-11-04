import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('notes')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('notes')
export class NotesController {
  constructor(private readonly notes: NotesService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreateNoteDto) {
    return await this.notes.create(req.user.userId, dto);
  }

  @Get()
  async findAll(@Req() req: any) {
    const trashed = req.query.trashed === '1' || req.query.trashed === 'true';
    if (trashed) return await this.notes.findTrashed(req.user.userId);
    return await this.notes.findAll(req.user.userId);
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return await this.notes.findOne(req.user.userId, id);
  }

  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNoteDto,
  ) {
    return await this.notes.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    await this.notes.remove(req.user.userId, id);
    return { success: true };
  }

  @Post(':id/restore')
  async restore(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return await this.notes.restore(req.user.userId, id);
  }

  // permanent delete (admin/user confirm)
  @Delete(':id/permanent')
  async removePermanent(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    await this.notes.removePermanent(req.user.userId, id);
    return { success: true };
  }
}
