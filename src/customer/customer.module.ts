import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { CustomerService } from './customer.service';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [TypeOrmModule.forFeature([Customer]), AnalyticsModule],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
