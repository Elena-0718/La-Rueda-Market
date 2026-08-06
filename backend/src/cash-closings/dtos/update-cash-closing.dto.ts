import { PartialType } from '@nestjs/swagger';
import { CreateCashClosingDto } from './create-cash-closing.dto';

export class UpdateCashClosingDto extends PartialType(CreateCashClosingDto) {}