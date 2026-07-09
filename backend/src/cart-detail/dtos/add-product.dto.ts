import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddProductDto {
  @ApiProperty({
    description: 'UUID del producto que se agregará al carrito.',
    example: 'c31a34b7-8b9a-4e71-a29a-8c26f675a1c8',
  })
  @IsUUID('4', { message: 'El UUID del producto no es válido.' })
  @IsNotEmpty({ message: 'El producto es obligatorio.' })
  productUuid: string;

  @ApiProperty({
    description: 'Cantidad del producto que se agregará al carrito.',
    example: 2,
  })
  @IsInt({ message: 'La cantidad debe ser un número entero.' })
  @IsPositive({ message: 'La cantidad debe ser mayor a cero.' })
  quantity: number;
}