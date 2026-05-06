import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { UserState } from './user-state.entity';
import { ProcessedUpdate } from './processed-update.entity';

@Entity('bots')
@Index(['template'])
export class Bot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ select: false }) // Never select token by default; explicit opt-in only
  token: string;

  @Column()
  template: string;

  @Column({ type: 'jsonb' })
  config: Record<string, any>;

  @Column({ unique: true })
  webhookSecret: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserState, (userState) => userState.bot)
  userStates: UserState[];

  @OneToMany(() => ProcessedUpdate, (processedUpdate) => processedUpdate.bot)
  processedUpdates: ProcessedUpdate[];
}
