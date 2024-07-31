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
      where: { ownerId: userid, id: investmentId },
    });

    if (!investment) {
      throw new BadRequestException('Investment not found');
    }

    if (amount <= 0 || amount > investment.currentAmount) {
      throw new BadRequestException('Invalid withdrawal amount');
    }

    const monthsElapsed = this.getMonthsElapsed(new Date(investment.createdAt));
    const taxRate = this.getTaxRate(monthsElapsed);
    const taxAmount = (amount * taxRate) / 100;
    const netAmount = amount - taxAmount;

    const updatedInvestiment = await this.prisma.investment.update({
      where: { id: investmentId },
      data: {
        currentAmount: investment.currentAmount - amount,
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
      updatedInvestiment,
    });

    return { amount: netAmount, taxAmount, investment: updatedInvestiment };
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
