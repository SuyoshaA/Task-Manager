import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User, Organization } from '@sacharya/data';
import { hashPassword } from '../auth/password.util';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(Organization) private readonly orgRepo: Repository<Organization>
  ) {}

  async onModuleInit() {
    const exists = await this.usersRepo.findOne({ where: { email: 'owner@example.com' } });
    if (exists) return;

    const org = await this.orgRepo.save(this.orgRepo.create({ name: 'Default Org' }));

    const owner = this.usersRepo.create({
      email: 'owner@example.com',
      password: await hashPassword('owner123'),
      role: 'owner',
      organization: org,
      organizationId: org.id,
    });

    const admin = this.usersRepo.create({
      email: 'admin@example.com',
      password: await hashPassword('admin123'),
      role: 'admin',
      organization: org,
      organizationId: org.id,
    });

    const viewer = this.usersRepo.create({
      email: 'viewer@example.com',
      password: await hashPassword('viewer123'),
      role: 'viewer',
      organization: org,
      organizationId: org.id,
    });

    await this.usersRepo.save([owner, admin, viewer]);

    // eslint-disable-next-line no-console
    console.log('✅ Seeded users: owner/admin/viewer');
  }
}
