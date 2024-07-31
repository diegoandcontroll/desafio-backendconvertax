import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Body,
  UseGuards,
  Inject,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { InvestmentsService } from './investments.service';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { UserId } from 'src/auth/decorator/userid.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { ClientProxy } from '@nestjs/microservices';

@SkipThrottle()
@Controller('investments')
@UseGuards(JwtAuthGuard)
@ApiTags('Investments')
export class InvestmentsController {
  constructor(
    private readonly investmentsService: InvestmentsService,
    @Inject('INVESTMENTS_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new investment',
    description: 'Creates a new investment record for the user.',
  })
  @ApiBody({
    description: 'Investment creation payload',
    schema: {
      example: {
        userId: 'user123',
        initialAmount: 1000,
        createdAt: '2024-07-31T12:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Investment successfully created.',
    schema: {
      example: {
        id: 'investment123',
        ownerId: 'user123',
        initialAmount: 1000,
        currentAmount: 1000,
        createdAt: '2024-07-31T12:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request, invalid input data.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createInvestment(
    @Body() body: { userId: string; initialAmount: number; createdAt?: Date },
  ) {
    return this.investmentsService.createInvestment(
      body.userId,
      body.initialAmount,
      body.createdAt,
    );
  }

  @Throttle({ short: { ttl: 1000, limit: 1 } })
  @Get(':id')
  @ApiOperation({
    summary: 'Get investment details',
    description: 'Retrieve details of a specific investment by its ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Investment details retrieved successfully.',
    schema: {
      example: {
        id: 'investment123',
        ownerId: 'user123',
        initialAmount: 1000,
        currentAmount: 1000,
        createdAt: '2024-07-31T12:00:00Z',
        totalAmount: 1050.52, // exemplo de valor calculado
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request, investment not found.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getInvestment(@Param('id') id: string) {
    return this.investmentsService.getInvestment(id);
  }

  @Get()
  @ApiOperation({
    summary: 'List all investments',
    description:
      'Retrieve a paginated list of investments for the authenticated user.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter investments by status',
    type: String,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Number of items per page',
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'List of investments retrieved successfully.',
    schema: {
      example: [
        {
          id: 'investment123',
          ownerId: 'user123',
          initialAmount: 1000,
          currentAmount: 1000,
          createdAt: '2024-07-31T12:00:00Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async listInvestments(
    @UserId() userId: string,
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    return this.investmentsService.listInvestments(
      userId,
      status,
      page,
      pageSize,
    );
  }
}
