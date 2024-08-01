// src/withdrawals/withdrawals.service.ts

import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WithdrawalsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('WITHDRAWALS_SERVICE') private readonly client: ClientProxy,
  ) {}

  async withdrawInvestment(
    userid: string,
    investmentId: string,
    amount: number,
  ) {
    const investment = await this.prisma.investment.findUnique({
      where: { id: investmentId },
    });

    if (!investment || investment.ownerId !== userid) {
      throw new BadRequestException('Investment not found');
    }

    // Considerar o valor atual acumulado com ganhos compostos
    const monthsElapsed = this.getMonthsElapsed(new Date(investment.createdAt));
    const compoundInterest =
      investment.initialAmount * Math.pow(1 + 0.0052, monthsElapsed);
    const currentAmount = compoundInterest; // Valor acumulado

    if (amount <= 0 || amount > currentAmount) {
      throw new BadRequestException('Invalid withdrawal amount');
    }

    const taxRate = this.getTaxRate(monthsElapsed);
    const taxAmount = (amount * taxRate) / 100;
    const netAmount = amount - taxAmount;

    const updatedInvestment = await this.prisma.investment.update({
      where: { id: investmentId },
      data: {
        currentAmount: currentAmount - amount, // Atualizar valor com a retirada
        withdrawals: {
          create: {
            amount,
            tax: taxAmount,
          },
        },
      },
    });

    this.client.emit('withdrawal_processed', {
      investmentId,
      amount,
      taxAmount,
      investment,
      updatedInvestment,
    });

    return { amount: netAmount, taxAmount, investment: updatedInvestment };
  }

  private getMonthsElapsed(startDate: Date): number {
    const now = new Date();
    return (
      (now.getFullYear() - startDate.getFullYear()) * 12 +
      (now.getMonth() - startDate.getMonth())
    );
  }

  private getTaxRate(monthsElapsed: number): number {
    if (monthsElapsed < 12) return 22.5;
    if (monthsElapsed < 24) return 18.5;
    return 15;
  }
}
