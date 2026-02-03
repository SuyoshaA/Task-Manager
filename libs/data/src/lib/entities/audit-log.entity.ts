import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

export type AuditAction = 'CREATE_TASK' | 'UPDATE_TASK' | 'DELETE_TASK' | 'VIEW_TASKS' | 'VIEW_AUDIT';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  user!: User;

  @Column()
  userId!: number;

  @Column({
    type: 'varchar',  // CHANGED FROM 'enum' to 'varchar'
  })
  action!: AuditAction;

  @Column()
  resourceId!: number;

  @Column()
  resourceType!: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  timestamp!: Date;

  @Column({ type: 'text', nullable: true })
  details!: string;
}