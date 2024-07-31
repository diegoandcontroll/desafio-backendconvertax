import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvestmentsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('INVESTMENTS_SERVICE') private readonly client: ClientProxy,
    @Inject('CACHE_MANAGER') private readonly cacheManager: Cache,
  ) {}

  async createInvestment(
    userId: string,
    initialAmount: number,
    createdAt?: Date,
  ) {
    if (initialAmount <= 0) {
      throw new BadRequestException('Initial amount must be positive');
    }

    const investment = await this.prisma.investment.create({
      data: {
        ownerId: userId,
        initialAmount,
        currentAmount: initialAmount,
        createdAt: createdAt || new Date(),
      },
    });

    this.client.emit('investment_created', investment);
    await this.cacheManager.del(`investments_${userId}`);
    return investment;
  }

  async getInvestment(id: string) {
    const cacheKey = `investment_${id}`;
    const cachedInvestment = await this.cacheManager.get(cacheKey);

    if (cachedInvestment) {
      return cachedInvestment;
    }

    const investment = await this.prisma.investment.findUnique({
      where: { id },
      include: { withdrawals: true },
    });

    if (!investment) {
      throw new BadRequestException('Investment not found');
    }

    const monthsElapsed = this.getMonthsElapsed(new Date(investment.createdAt));
    const compoundInterest =
      investment.initialAmount * Math.pow(1 + 0.0052, monthsElapsed);
    const totalAmount = investment.currentAmount + compoundInterest;

    const result = {
      ...investment,
      totalAmount,
    };
    await this.cacheManager.set(cacheKey, result, 3600); // Corrigido
    return result;
  }

  async listInvestments(
    userId: string,
    status?: string,
    page: number = 1,
    pageSize: number = 10,
  ) {
    const cacheKey = `investments_${userId}_${status}_${page}_${pageSize}`;
    const cachedInvestments = await this.cacheManager.get(cacheKey);

    if (cachedInvestments) {
      return cachedInvestments;
    }

    const whereClause: any = { ownerId: userId };

    if (status) {
      whereClause.status = status;
    }

    const investments = await this.prisma.investment.findMany({
      where: whereClause,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    await this.cacheManager.set(cacheKey, investments, 3600); // Corrigido
    return investments;
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
