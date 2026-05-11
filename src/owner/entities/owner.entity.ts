import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Bot } from '../../bot/entities/bot.entity';

/**
 * Owner entity — represents a platform user who owns bots.
 * Created/updated automatically when interacting with BotGrandFather.
 */
@Entity('owners')
@Index(['telegramUserId'])
export class Owner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bigint', unique: true })
  telegramUserId: bigint;

  @Column({ type: 'varchar', nullable: true })
  username: string | null;

  @Column({ type: 'varchar', nullable: true })
  firstName: string | null;

  @Column({ type: 'varchar', nullable: true })
  lastName: string | null;

  @Column({ default: 'free' })
  subscriptionPlan: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Bot, (bot) => bot.owner)
  bots: Bot[];
}
