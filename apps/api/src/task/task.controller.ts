import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto } from '@sacharya/data';
import { JwtAuthGuard, RolesGuard, Roles } from '@sacharya/auth';
import { AuditLogService } from '../audit-log/audit-log.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly auditLog: AuditLogService
  ) {}

  // Helper method to ensure consistent user extraction
  private getUserInfo(req: any) {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }
    
    // Handle both possible field names from JWT
    return {
      id: user.id || user.sub,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId || user.orgId,
    };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin') // VIEWERS CANNOT CREATE
  async create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    const user = this.getUserInfo(req);

    const created = await this.taskService.create(
      createTaskDto,
      user.id,
      user.organizationId,
      user.role
    );

    await this.auditLog.log({
      userId: user.id,
      action: 'CREATE_TASK',
      resourceType: 'task',
      resourceId: created.id,
      details: JSON.stringify({ title: created.title, userId: user.id }),
    });

    return created;
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'viewer') // All roles can view (scoped in service)
  async findAll(@Request() req) {
    const user = this.getUserInfo(req);

    const result = await this.taskService.findAll(
      user.id,
      user.role,
      user.organizationId
    );

    await this.auditLog.log({
      userId: user.id,
      action: 'VIEW_TASKS',
      resourceType: 'task',
      resourceId: 0,
      details: JSON.stringify({ count: result.length, role: user.role }),
    });

    return result;
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'viewer')
  async findOne(@Param('id') id: string, @Request() req) {
    const user = this.getUserInfo(req);
    const task = await this.taskService.findOne(
      Number(id),
      user.id,
      user.role,
      user.organizationId
    );

    // Optional: Log individual task view
    await this.auditLog.log({
      userId: user.id,
      action: 'VIEW_TASKS',
      resourceType: 'task',
      resourceId: task.id,
      details: JSON.stringify({ title: task.title }),
    });

    return task;
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin') // VIEWERS CANNOT UPDATE
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req
  ) {
    const user = this.getUserInfo(req);

    const updated = await this.taskService.update(
      Number(id),
      updateTaskDto,
      user.id,
      user.role,
      user.organizationId
    );

    await this.auditLog.log({
      userId: user.id,
      action: 'UPDATE_TASK',
      resourceType: 'task',
      resourceId: updated.id,
      details: JSON.stringify({ 
        fields: Object.keys(updateTaskDto ?? {}),
        updatedBy: user.id,
        role: user.role 
      }),
    });

    return updated;
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin') // VIEWERS CANNOT DELETE
  async remove(@Param('id') id: string, @Request() req) {
    const user = this.getUserInfo(req);

    const removed = await this.taskService.remove(
      Number(id),
      user.id,
      user.role,
      user.organizationId
    );

    await this.auditLog.log({
      userId: user.id,
      action: 'DELETE_TASK',
      resourceType: 'task',
      resourceId: removed.id,
      details: JSON.stringify({ 
        title: removed.title,
        deletedBy: user.id,
        role: user.role 
      }),
    });

    return removed;
  }

  // ✅ FIXED: Changed findAll() to list()
  @Get('audit/logs')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  async getAuditLogs(@Request() req) {
    const user = this.getUserInfo(req);
    
    await this.auditLog.log({
      userId: user.id,
      action: 'VIEW_AUDIT',
      resourceType: 'audit',
      resourceId: 0,
      details: JSON.stringify({ viewedBy: user.id, role: user.role }),
    });

    
    return this.auditLog.list();
  }
}