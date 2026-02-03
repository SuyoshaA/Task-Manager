import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';

import { User, Organization } from '@sacharya/data';

@Module({
  imports: [TypeOrmModule.forFeature([User, Organization])],
  providers: [SeedService],
})
export class SeedModule {}
