# Customer Layer

**Purpose:** Describe universal customer architecture  
**Status:** CANONICAL — Tier 4 Description  
**Version:** 1.0

---

## DEFINITION

Customer is a universal entity shared across all templates.

It is template-agnostic and capability-neutral.

---

## ENTITY

```typescript
@Entity()
class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  botId: string;

  @Column({ type: 'bigint' })
  telegramUserId: number;

  @Column({ default: 'new' })
  status: 'new' | 'active' | 'converted';

  @Column('simple-json', { default: {} })
  tags: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## LIFECYCLE

### States

| State | Meaning |
|-------|---------|
| `new` | First interaction, not yet engaged |
| `active` | Engaged with template |
| `converted` | Completed conversion goal |

### Transitions

```
new → active (first meaningful interaction)
active → converted (conversion achieved)
new → converted (direct conversion)
```

### Events

```
customer.created   (first interaction)
customer.updated   (status or tags change)
customer.converted (conversion achieved)
```

---

## SERVICE

```typescript
@Injectable()
class CustomerService {
  async ensureCustomer(botId, telegramUserId, profile): Promise<Customer>;
  async updateStatus(botId, telegramUserId, status): Promise<Customer>;
  async addTag(botId, telegramUserId, key, value): Promise<Customer>;
  async findByBotId(botId): Promise<Customer[]>;
}
```

**Zero template references.**

---

**Version 1.0 — 2026-05-23**
