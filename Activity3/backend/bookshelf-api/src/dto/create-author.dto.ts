import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAuthorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;
}

export class UpdateAuthorDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;
}


