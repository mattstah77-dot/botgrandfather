import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class ConnectBotDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
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
