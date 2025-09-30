import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

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
}


