import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateUserDto } from './CreateUser.dto';


export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}