import {
  IsInt,
  IsPositive,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductQuantityDto {
  @ApiProperty({
    description: 'Nueva cantidad del producto en el carrito.',
    example: 3,
  })
  @IsInt({ message: 'La cantidad debe ser un número entero.' })
  @IsPositive({ message: 'La cantidad debe ser mayor a cero.' })
  quantity: number;
}