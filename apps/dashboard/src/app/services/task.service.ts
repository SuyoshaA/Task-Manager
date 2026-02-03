import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskCategory = 'work' | 'personal';

export interface Task {
  id: string | number;  // <-- CHANGE THIS: Allow both string and number
  title: string;
  description: string;
  status: TaskStatus;
  category: TaskCategory;
  userId: number;
  organizationId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description: string;
  category: TaskCategory;
  status?: TaskStatus;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  category?: TaskCategory;
  status?: TaskStatus;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks`);
  }

  createTask(payload: CreateTaskPayload): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/tasks`, payload);
  }

  updateTask(id: string | number, payload: UpdateTaskPayload): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/tasks/${id}`, payload);
  }

  deleteTask(id: string | number): Observable<Task> {
    return this.http.delete<Task>(`${this.apiUrl}/tasks/${id}`);
  }
}