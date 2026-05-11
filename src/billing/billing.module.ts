import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { SubscriptionGuard } from './subscription-guard';

@Module({
  providers: [BillingService, SubscriptionGuard],
  exports: [BillingService, SubscriptionGuard],
})
export class BillingModule {}
