import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

import {
  TaskService,
  Task,
  TaskStatus,
  TaskCategory,
  CreateTaskPayload,
  UpdateTaskPayload,
} from '../services/task.service';

type SortKey = 'updatedAt' | 'createdAt' | 'title';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  loading = false;
  errorMsg = '';

  role: string = 'viewer';

  // filters
  search = '';
  categoryFilter: TaskCategory | 'all' = 'all';
  statusFilter: TaskStatus | 'all' = 'all';
  sortKey: SortKey = 'updatedAt';

  // create form
  newTask: CreateTaskPayload = {
    title: '',
    description: '',
    category: 'work',
    status: 'todo',
  };

  // edit modal
  editing: Task | null = null;
  editModel: UpdateTaskPayload | null = null;

  // raw data from API
  tasks: Task[] = [];

  // ✅ stable board arrays (drag/drop needs stable references)
  todoList: Task[] = [];
  inProgressList: Task[] = [];
  doneList: Task[] = [];

  constructor(private taskService: TaskService, private router: Router) {}

  ngOnInit() {
    const rawUser = localStorage.getItem('task-user');
    if (rawUser) {
      try {
        this.role = JSON.parse(rawUser)?.role ?? 'viewer';
      } catch {
        this.role = 'viewer';
      }
    }
    this.loadTasks();
  }

  logout() {
    localStorage.removeItem('task-token');
    localStorage.removeItem('task-user');
    this.router.navigate(['/login']);
  }

  canDelete(): boolean {
    return this.role === 'owner' || this.role === 'admin';
  }

  // ✅ call this whenever tasks or filters change
  private rebuildBoard() {
    const list = this.filteredSortedTasks();

    this.todoList = list.filter((t) => t.status === 'todo');
    this.inProgressList = list.filter((t) => t.status === 'in_progress');
    this.doneList = list.filter((t) => t.status === 'done');
  }

  // ✅ hook filters to this to update instantly
  onFiltersChanged() {
    this.rebuildBoard();
  }

  clearFilters() {
    this.search = '';
    this.categoryFilter = 'all';
    this.statusFilter = 'all';
    this.onFiltersChanged();
  }

  loadTasks() {
    this.loading = true;
    this.errorMsg = '';

    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks ?? [];
        this.loading = false;
        this.rebuildBoard();
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Failed to load tasks';
        console.error(err);
      },
    });
  }

  createTask() {
    const title = (this.newTask.title ?? '').trim();
    if (!title) return;

    const payload: CreateTaskPayload = {
      title,
      description: (this.newTask.description ?? '').trim(),
      category: this.newTask.category,
      status: this.newTask.status ?? 'todo',
    };

    this.taskService.createTask(payload).subscribe({
      next: (created: Task) => {
        this.tasks = [created, ...this.tasks];
        this.rebuildBoard();
        this.newTask = { title: '', description: '', category: 'work', status: 'todo' };
      },
      error: (err: any) => {
        console.error(err);
        alert(err?.error?.message || 'Create task failed');
      },
    });
  }

  openEdit(task: Task) {
    this.editing = task;
    this.editModel = {
      title: task.title ?? '',
      description: task.description ?? '',
      category: task.category,
      status: task.status,
    };
  }

  closeEdit() {
    this.editing = null;
    this.editModel = null;
  }

  saveEdit() {
    if (!this.editing || !this.editModel) return;

    const payload: UpdateTaskPayload = {
      title: (this.editModel.title ?? '').toString().trim(),
      description: (this.editModel.description ?? '').toString().trim(),
      category: this.editModel.category,
      status: this.editModel.status,
    };

    this.taskService.updateTask(this.editing.id, payload).subscribe({
      next: (updated: Task) => {
        this.tasks = this.tasks.map((t) => (t.id === updated.id ? updated : t));
        this.rebuildBoard();
        this.closeEdit();
      },
      error: (err: any) => {
        console.error('Update failed', err);
        alert(err?.error?.message || 'Update task failed');
      },
    });
  }

  deleteTask(task: Task) {
    if (!this.canDelete()) return;

    const ok = confirm(`Delete "${task.title}"?`);
    if (!ok) return;

    this.taskService.deleteTask(task.id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter((t) => t.id !== task.id);
        this.rebuildBoard();
      },
      error: (err: any) => {
        console.error(err);
        alert(err?.error?.message || 'Delete task failed');
      },
    });
  }

  // ✅ FIXED: Drag & drop handler (correct parameter type)
  drop(event: CdkDragDrop<Task[]>, targetColumn: string) {
    console.log('Drag event triggered:', {
      previousContainer: event.previousContainer.id,
      container: event.container.id,
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex,
      targetColumn: targetColumn
    });

    // Determine new status based on which column it was dropped in
    let newStatus: TaskStatus = 'todo';
    
    switch(targetColumn) {
      case 'todo': 
        newStatus = 'todo'; 
        break;
      case 'in_progress': 
        newStatus = 'in_progress'; 
        break;
      case 'done': 
        newStatus = 'done'; 
        break;
      default: 
        newStatus = 'todo';
    }

    // If dragging within the same column (reordering)
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
      // Optional: Save order to backend if needed
      console.log('Task reordered within column');
    } 
    // If dragging to a different column (changing status)
    else {
      const movedTask = event.previousContainer.data[event.previousIndex];
      
      // Move the task visually first (immediate feedback)
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      console.log(`Moving task "${movedTask.title}" from ${movedTask.status} to ${newStatus}`);

      // Only update backend if status actually changed
      if (movedTask.status !== newStatus) {
        // Update the task status in backend
        this.taskService.updateTask(movedTask.id, { status: newStatus }).subscribe({
          next: (updated: Task) => {
            console.log('Task status updated successfully:', updated);
            
            // Update the main tasks array with new status
            this.tasks = this.tasks.map((t) => 
              t.id === updated.id ? { ...updated } : t
            );
            
            // Rebuild board to ensure consistency
            this.rebuildBoard();
          },
          error: (err: any) => {
            console.error('Failed to update task status:', err);
            
            // Revert the visual move on error by reloading
            this.loadTasks();
            
            alert('Failed to update task status. Please try again.');
          },
        });
      } else {
        console.log('Task already has this status, no backend update needed');
        // Still update the main array to reflect the move
        this.rebuildBoard();
      }
    }
  }

  // Helper method if you want to save order within a column
  private saveTaskOrder(tasks: Task[]) {
    // Implement if you need to save the order of tasks within a column
    // This would require adding an "order" field to your Task model
    // tasks.forEach((task, index) => {
    //   this.taskService.updateTask(task.id, { order: index }).subscribe();
    // });
  }

  private filteredSortedTasks(): Task[] {
    const q = this.search.trim().toLowerCase();
    let list = [...this.tasks];

    if (this.categoryFilter !== 'all') {
      list = list.filter((t) => t.category === this.categoryFilter);
    }
    if (this.statusFilter !== 'all') {
      list = list.filter((t) => t.status === this.statusFilter);
    }
    if (q) {
      list = list.filter(
        (t) =>
          (t.title ?? '').toLowerCase().includes(q) ||
          (t.description ?? '').toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (this.sortKey === 'title') return (a.title || '').localeCompare(b.title || '');
      const av = new Date((a as any)[this.sortKey] || 0).getTime();
      const bv = new Date((b as any)[this.sortKey] || 0).getTime();
      return bv - av;
    });

    return list;
  }

  get filteredTasks(): Task[] {
    return this.filteredSortedTasks();
  }
}