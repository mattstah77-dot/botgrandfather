import { IsString, IsNotEmpty, IsOptional, IsObject, MaxLength, MinLength } from 'class-validator';

export class ConnectBotDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(200)
  token: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  template: string;

  @IsObject()
  @IsOptional()
  config?: Record<string, any>;
}

export class UpdateBotConfigDto {
  @IsObject()
  @IsNotEmpty()
  config: Record<string, any>;
}
