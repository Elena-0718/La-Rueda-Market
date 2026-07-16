import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateInventoryMovementDto } from './dtos/create-inventory-movement.dto';
import { UpdateInventoryMovementDto } from './dtos/update-inventory-movement.dto';
import { InventoryMovementService } from './inventory-movement.service';

@ApiTags('Inventory Movements')
@Controller('inventory-movements')
export class InventoryMovementController {
  constructor(
    private readonly inventoryMovementService: InventoryMovementService,
  ) {}

  @Post('admin')
  @ApiOperation({ summary: 'Registrar movimiento de inventario' })
  createMovement(
    @Body() createMovementDto: CreateInventoryMovementDto,
  ) {
    return this.inventoryMovementService.createMovementService(
      createMovementDto,
    );
  }

  @Get('admin')
  @ApiOperation({ summary: 'Listar todos los movimientos de inventario' })
  getAllMovements() {
    return this.inventoryMovementService.getAllMovementsService();
  }

  @Get('admin/:uuid')
  @ApiOperation({ summary: 'Obtener movimiento de inventario por UUID' })
  getMovementByUuid(@Param('uuid') uuid: string) {
    return this.inventoryMovementService.getMovementByUuidService(uuid);
  }

  @Get('admin/inventory/:inventoryUuid')
  @ApiOperation({ summary: 'Listar movimientos de un inventario específico' })
  getMovementsByInventory(
    @Param('inventoryUuid') inventoryUuid: string,
  ) {
    return this.inventoryMovementService.getMovementsByInventoryService(
      inventoryUuid,
    );
  }

  @Patch('admin/:uuid')
  @ApiOperation({
    summary:
      'Actualizar datos administrativos del movimiento, sin modificar stock',
  })
  updateMovement(
    @Param('uuid') uuid: string,
    @Body() updateMovementDto: UpdateInventoryMovementDto,
  ) {
    return this.inventoryMovementService.updateMovementService(
      uuid,
      updateMovementDto,
    );
  }

  @Delete('admin/:uuid')
  @ApiOperation({
    summary:
      'Eliminar movimiento de inventario sin modificar el stock actual',
  })
  deleteMovement(@Param('uuid') uuid: string) {
    return this.inventoryMovementService.deleteMovementService(uuid);
  }
}