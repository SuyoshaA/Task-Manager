import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User, Organization, Task, AuditLog } from '@sacharya/data';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: 'database.sqlite',
  entities: [User, Organization, Task, AuditLog],
  synchronize: true, // ✅ Make sure this is TRUE
  logging: true,
};