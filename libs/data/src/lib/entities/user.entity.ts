import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Organization } from './organization.entity';
import { Task } from './task.entity';

export type UserRole = 'owner' | 'admin' | 'viewer';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({
    type: 'varchar',
    default: 'viewer',
  })
  role!: UserRole;

  @ManyToOne(() => Organization, (org) => org.users)
  organization!: Organization;

  @Column()
  organizationId!: number;

  @OneToMany(() => Task, (task) => task.user)
  tasks!: Task[];
}