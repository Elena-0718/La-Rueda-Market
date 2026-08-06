import { PartialType } from '@nestjs/swagger';
import { CreateCashDepositDto } from './create-cash-deposit.dto';

export class UpdateCashDepositDto extends PartialType(CreateCashDepositDto) {}