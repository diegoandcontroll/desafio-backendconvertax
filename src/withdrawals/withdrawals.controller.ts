// src/withdrawals/withdrawals.controller.ts

import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Withdrawals')
@ApiBearerAuth()
@Controller('withdrawals')
@UseGuards(JwtAuthGuard)
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Post()
  @ApiOperation({ summary: 'Perform a withdrawal from an investment' })
  @ApiBody({
    description: 'Withdrawal request payload',
    schema: {
      example: {
        userId: 'uuid',
        investmentId: 'uuid',
        amount: 10,
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Successful withdrawal' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async withdraw(
    @Body() body: { userId: string; investmentId: string; amount: number },
  ) {
    return this.withdrawalsService.withdrawInvestment(
      body.userId,
      body.investmentId,
      body.amount,
    );
  }
}
