import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}
  
  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  create(@Body() dto: CreateCategoryDto) { return this.service.create(dto.name); }
  
  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  findAll() { return this.service.findAll(); }
  
  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  
  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) { return this.service.update(id, dto.name!); }
  
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
