import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CreateUserDto } from './DTOS/CreateUser.dto';
import { UpdateUserDto } from './DTOS/UpdateUser.dto';
import { UserService } from './users.service';


import { Roles } from '../enum/roles.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesDecorator } from '../decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Usuarios')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Crear usuario | ADMIN' })
  @ApiBody({ type: CreateUserDto })
  @HttpCode(HttpStatus.CREATED)
  @RolesDecorator(Roles.ADMIN)
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUserService(createUserDto);
  }

  @Get('all')
  @ApiOperation({ summary: 'Obtener todos los usuarios | ADMIN' })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.ADMIN)
  getAllUsers() {
    return this.userService.getAllUsersService();
  }

  @Get('find/:uuid')
  @ApiOperation({ summary: 'Obtener usuario por UUID | ADMIN' })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.ADMIN)
  getUserById(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.userService.getUserByIdService(uuid);
  }

  @Get('my-profile')
  @ApiOperation({ summary: 'Ver mi perfil' })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.CLIENT, Roles.ADMIN)
  getMyProfile(@Req() req) {
    return this.userService.getUserProfileService(req);
  }

  @Put('update-my-profile')
  @ApiOperation({ summary: 'Actualizar mi perfil' })
  @ApiBody({ type: UpdateUserDto })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.CLIENT, Roles.ADMIN)
  updateMyProfile(
    @Req() req,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUserProfileService(req, updateUserDto);
  }

  @Put('update/:uuid')
  @ApiOperation({ summary: 'Actualizar usuario por UUID | ADMIN' })
  @ApiBody({ type: UpdateUserDto })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.ADMIN)
  updateUserByAdmin(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUserByAdminService(uuid, updateUserDto);
  }

  @Put('deactivate/:uuid')
  @ApiOperation({ summary: 'Desactivar usuario | ADMIN' })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.ADMIN)
  deactivateUser(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.userService.deactivateUserService(uuid);
  }
}
