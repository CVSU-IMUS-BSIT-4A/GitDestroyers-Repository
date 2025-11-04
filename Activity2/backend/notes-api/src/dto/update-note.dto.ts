import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateNoteDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  content?: string | null;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string | null;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  folder?: string | null;
}


