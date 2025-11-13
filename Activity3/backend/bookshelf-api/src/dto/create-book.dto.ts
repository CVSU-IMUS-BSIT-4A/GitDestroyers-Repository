import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, MinLength, Matches } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsNumber()
  @IsOptional()
  authorId?: number;

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1000)
  publishedYear: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9Xx-]{10,17}$/, { message: 'ISBN must be 10-13 digits (dashes/spaces allowed)' })
  isbn: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  pageCount: number;

  @IsString()
  @IsNotEmpty()
  coverUrl: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(100, { message: 'Plot must be at least 100 characters long' })
  plot: string;
}

export class UpdateBookDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @IsNumber()
  @IsOptional()
  authorId?: number | null;

  @IsNumber()
  @IsOptional()
  categoryId?: number | null;

  @IsNumber()
  @IsOptional()
  @Min(1000)
  publishedYear?: number | null;

  @IsString()
  @IsOptional()
  @Matches(/^[0-9Xx-]{10,17}$/, { message: 'ISBN must be 10-13 digits (dashes/spaces allowed)' })
  isbn?: string | null;

  @IsNumber()
  @IsOptional()
  @Min(1)
  pageCount?: number | null;

  @IsString()
  @IsOptional()
  coverUrl?: string | null;

  @IsString()
  @IsOptional()
  @MinLength(100, { message: 'Plot must be at least 100 characters long' })
  plot?: string | null;
}


