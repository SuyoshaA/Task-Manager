import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateTaskDto, UpdateTaskDto, Task, UserRole } from '@sacharya/data';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>
  ) {}

  async create(
    createTaskDto: CreateTaskDto,
    userId: number,
    orgId: number,
    role: UserRole
  ): Promise<Task> {
    // ASSESSMENT REQUIREMENT: Viewers should be read-only
    if (role === 'viewer') {
      throw new ForbiddenException('Viewers cannot create tasks');
    }

    if (!orgId) {
      throw new ForbiddenException('Organization scope required');
    }

    const task = this.taskRepo.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      category: createTaskDto.category,
      status: createTaskDto.status || 'todo',
      userId,
      organizationId: orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.taskRepo.save(task);
  }

  async findAll(
    userId: number,
    role: UserRole,
    orgId: number
  ): Promise<Task[]> {
    if (!orgId) {
      throw new ForbiddenException('Organization scope required');
    }

    // ✅ FIX: Viewers are read-only but should still be able to READ tasks
    // All roles can view all tasks within their organization
    return this.taskRepo.find({
      where: { organizationId: orgId },
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(
    id: number,
    userId: number,
    role: UserRole,
    orgId: number
  ): Promise<Task> {
    const task = await this.taskRepo.findOne({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Must be same org
    if (task.organizationId !== orgId) {
      throw new ForbiddenException('Not allowed (different organization)');
    }

    // ✅ FIX: Viewers can view tasks in their org (read-only),
    // so no "own task only" restriction here.

    return task;
  }

  async update(
    id: number,
    updateTaskDto: UpdateTaskDto,
    userId: number,
    role: UserRole,
    orgId: number
  ): Promise<Task> {
    const task = await this.findOne(id, userId, role, orgId);

    // ASSESSMENT REQUIREMENT: Viewers should be read-only
    if (role === 'viewer') {
      throw new ForbiddenException('Viewers cannot update tasks');
    }

    // Admin/Owner can update any task in org
    // (No additional check needed for admin/owner)

    if (updateTaskDto.title !== undefined) task.title = updateTaskDto.title;
    if (updateTaskDto.description !== undefined)
      task.description = updateTaskDto.description;
    if (updateTaskDto.category !== undefined) task.category = updateTaskDto.category;
    if (updateTaskDto.status !== undefined) task.status = updateTaskDto.status;

    task.updatedAt = new Date();

    return this.taskRepo.save(task);
  }

  async remove(
    id: number,
    userId: number,
    role: UserRole,
    orgId: number
  ): Promise<Task> {
    const task = await this.findOne(id, userId, role, orgId);

    // Only owners and admins can delete tasks
    if (role !== 'owner' && role !== 'admin') {
      throw new ForbiddenException('Only owners and admins can delete tasks');
    }

    await this.taskRepo.delete({ id: task.id });
    return task;
  }
}
