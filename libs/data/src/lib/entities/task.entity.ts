import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';

// Use string literals for SQLite compatibility
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskCategory = 'work' | 'personal';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column({
    type: 'varchar',
    default: 'todo',
  })
  status!: TaskStatus;

  @Column({
    type: 'varchar',
    default: 'personal',
  })
  category!: TaskCategory;

  @ManyToOne(() => User, (user) => user.tasks)
  user!: User;

  @Column()
  userId!: number;

  @ManyToOne(() => Organization, (org) => org.tasks)
  organization!: Organization;

  @Column()
  organizationId!: number;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}