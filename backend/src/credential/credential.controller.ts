import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { CredentialService } from './credential.service';
import { ChangePasswordDto } from './DTOS/change-password.dto';
import { ForgotPasswordDto } from './DTOS/forgot-password.dto';
import { VerifyResetCodeDto } from './DTOS/verify-reset-code.dto';
import { ResetPasswordDto } from './DTOS/reset-password.dto';
import { ChangeRoleDto } from './DTOS/change-role.dto';

import { RolesDecorator } from '../decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../enum/roles.enum';

@ApiTags('Credenciales')
@ApiBearerAuth()
@Controller('credentials')
export class CredentialController {
  constructor(
    private readonly credentialService: CredentialService,
  ) {}

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Solicitar código de recuperación por celular | PÚBLICA',
  })
  @ApiBody({ type: ForgotPasswordDto })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.credentialService.forgotPasswordService(dto);
  }

  @Post('verify-reset-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar código de recuperación | PÚBLICA',
  })
  @ApiBody({ type: VerifyResetCodeDto })
  verifyResetCode(@Body() dto: VerifyResetCodeDto) {
    return this.credentialService.verifyResetCodeService(dto);
  }

  @Patch('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restablecer contraseña con código | PÚBLICA',
  })
  @ApiBody({ type: ResetPasswordDto })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.credentialService.resetPasswordService(dto);
  }

  @Get('all')
  @ApiOperation({
    summary: 'Obtener todas las credenciales | ADMIN',
  })
  @ApiQuery({ name: 'phone', required: false })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getAllCredentials(@Query('phone') phone?: string) {
    if (phone) {
      return this.credentialService.getCredentialByPhoneService(phone);
    }

    return this.credentialService.getAllCredentialsService();
  }

  @Get(':uuid')
  @ApiOperation({
    summary: 'Obtener credencial por UUID | ADMIN',
  })
  @ApiParam({ name: 'uuid', type: 'string' })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getCredentialById(
    @Param('uuid', ParseUUIDPipe) uuid: string,
  ) {
    return this.credentialService.getCredentialByIdService(uuid);
  }

  @Patch('change-password/:uuid')
  @ApiOperation({
    summary: 'Cambiar contraseña | PROPIO o ADMIN',
  })
  @ApiBody({ type: ChangePasswordDto })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.ADMIN, Roles.CLIENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  changePassword(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: ChangePasswordDto,
    @Req() req,
  ) {
    return this.credentialService.patchChangePasswordService(
      uuid,
      dto,
      req.user,
    );
  }

  @Delete('deactivate/:uuid')
  @ApiOperation({
    summary: 'Desactivar cuenta | PROPIO o ADMIN',
  })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.ADMIN, Roles.CLIENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  deleteCredential(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Req() req,
  ) {
    return this.credentialService.deleteCredentialService(
      uuid,
      req.user,
    );
  }

  @Put('activate/:uuid')
  @ApiOperation({
    summary: 'Activar cuenta | ADMIN',
  })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  activateCredential(
    @Param('uuid', ParseUUIDPipe) uuid: string,
  ) {
    return this.credentialService.activateCredentialService(uuid);
  }

  @Put('change-role/:uuid')
  @ApiOperation({
    summary: 'Cambiar rol | ADMIN',
  })
  @ApiBody({ type: ChangeRoleDto })
  @HttpCode(HttpStatus.OK)
  @RolesDecorator(Roles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  changeRole(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() dto: ChangeRoleDto,
  ) {
    return this.credentialService.putChangeUserRole(uuid, dto);
  }
}