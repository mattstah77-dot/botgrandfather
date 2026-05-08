import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

/**
 * Lead entity — stores collected lead data from the lead-funnel template.
 * Strictly multi-tenant: every lead belongs to one bot.
 */
@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  botId: string;

  @Column({ type: 'bigint' })
  @Index()
  userId: bigint;

  @Column({ type: 'varchar', nullable: true })
  username: string | null;

  @Column({ type: 'jsonb', default: {} })
  answers: Record<string, string>;

  @Column({ type: 'varchar', nullable: true })
  contact: string | null;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}
