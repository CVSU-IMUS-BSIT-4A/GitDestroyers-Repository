import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto, UpdateAuthorDto } from './dto/create-author.dto';

@ApiTags('authors')
@Controller('authors')
export class AuthorsController {
  constructor(private readonly service: AuthorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new author' })
  create(@Body() dto: CreateAuthorDto) { return this.service.create(dto.name); }
  
  @Get()
  @ApiOperation({ summary: 'Get all authors' })
  findAll() { return this.service.findAll(); }
  
  @Get(':id')
  @ApiOperation({ summary: 'Get an author by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  
  @Patch(':id')
  @ApiOperation({ summary: 'Update an author' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAuthorDto) { return this.service.update(id, dto.name!); }
  
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an author' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
