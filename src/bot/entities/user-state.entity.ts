import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, Index, Unique } from 'typeorm';
import { Bot } from './bot.entity';

@Entity('user_states')
@Unique(['botId', 'userId'])
@Index(['botId', 'userId'])
export class UserState {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  botId: string;

  @Column({ type: 'bigint' })
  userId: bigint;

  @Column({ default: 'idle' })
  currentStep: string;

  @Column({ type: 'jsonb', default: {} })
  payload: Record<string, any>;

  @ManyToOne(() => Bot, { onDelete: 'CASCADE' })
  bot: Bot;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
