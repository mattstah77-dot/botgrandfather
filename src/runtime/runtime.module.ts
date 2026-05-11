import { Module } from '@nestjs/common';
import { WebhookModule } from '../webhook/webhook.module';

/**
 * Runtime module — wraps all webhook/bot runtime functionality.
 * This is the chat-facing runtime layer, separate from admin/owner dashboards.
 */
@Module({
  imports: [WebhookModule],
  exports: [WebhookModule],
})
export class RuntimeModule {}
