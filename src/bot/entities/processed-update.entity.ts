import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Unique } from 'typeorm';
import { Bot } from './bot.entity';

@Entity('processed_updates')
@Unique(['botId', 'updateId'])
export class ProcessedUpdate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bigint' })
  updateId: bigint;

  @Column()
  botId: string;

  @ManyToOne(() => Bot, { onDelete: 'CASCADE' })
  bot: Bot;

  @CreateDateColumn()
  createdAt: Date;
}
