import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from '@sacharya/data';

export interface LogParams {
  userId: number;
  action: AuditAction;
  resourceType: string;
  resourceId: number;
  details?: string;
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>
  ) {}

  // Existing log method
  async log(params: LogParams): Promise<AuditLog> {
    const log = this.auditRepo.create({
      userId: params.userId,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      details: params.details,
      timestamp: new Date(),
    });

    return this.auditRepo.save(log);
  }

  // ADD THIS METHOD: List all audit logs
  async list(): Promise<AuditLog[]> {
    return this.auditRepo.find({
      order: { timestamp: 'DESC' },
      take: 100, // Limit to 100 most recent
    });
  }

  // Optional: List by organization
  async listByOrganization(organizationId: number): Promise<AuditLog[]> {
    // If you need to filter by organization, you'll need to join with User table
    // For now, return all logs
    return this.list();
  }

  // Optional: List by user
  async listByUser(userId: number): Promise<AuditLog[]> {
    return this.auditRepo.find({
      where: { userId },
      order: { timestamp: 'DESC' },
      take: 50,
    });
  }
}