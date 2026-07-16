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

import { CreateInventoryDto } from './dtos/create-inventory.dto';
import { UpdateInventoryDto } from './dtos/update-inventory.dto';
import { CreateInventoryMovementDto } from './dtos/create-inventory-movement.dto';
import { InventoryService } from './inventory.service';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('admin')
  @ApiOperation({ summary: 'Crear control de inventario para un producto' })
  createInventory(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.createInventoryService(createInventoryDto);
  }

  @Get('admin')
  @ApiOperation({ summary: 'Listar inventario administrativo' })
  getAllInventories() {
    return this.inventoryService.getAllInventoriesService();
  }

  @Get('admin/summary')
  @ApiOperation({ summary: 'Obtener resumen y alertas de inventario' })
  getInventorySummary() {
    return this.inventoryService.getInventorySummaryService();
  }

  @Get('admin/:uuid')
  @ApiOperation({ summary: 'Obtener inventario por UUID' })
  getInventoryByUuid(@Param('uuid') uuid: string) {
    return this.inventoryService.getInventoryByUuidService(uuid);
  }

  @Patch('admin/:uuid')
  @ApiOperation({ summary: 'Actualizar inventario' })
  updateInventory(
    @Param('uuid') uuid: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.updateInventoryService(
      uuid,
      updateInventoryDto,
    );
  }

  @Delete('admin/:uuid')
  @ApiOperation({ summary: 'Eliminar inventario' })
  deleteInventory(@Param('uuid') uuid: string) {
    return this.inventoryService.deleteInventoryService(uuid);
  }

  @Post('admin/movements')
  @ApiOperation({ summary: 'Registrar movimiento de inventario' })
  createMovement(
    @Body() createMovementDto: CreateInventoryMovementDto,
  ) {
    return this.inventoryService.createMovementService(createMovementDto);
  }

  @Get('admin/:uuid/movements')
  @ApiOperation({ summary: 'Listar movimientos de un inventario' })
  getMovementsByInventory(@Param('uuid') uuid: string) {
    return this.inventoryService.getMovementsByInventoryService(uuid);
  }
}