import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Todo } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class TodosService {
  private apiUrl = `${environment.apiUrl}/todos`;

  constructor(private http: HttpClient) { }

  getTodos(): Observable<Todo[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(todos => todos.map(todo => this.normalizeTodo(todo)))
    );
  }

  private normalizeTodo(todo: any): Todo {
    return {
      ...todo,
      createdAt: todo.created_at || todo.createdAt,
      updatedAt: todo.updated_at || todo.updatedAt,
      // Map 'pending' status to 'todo' for compatibility
      status: todo.status === 'pending' ? 'todo' : todo.status
    };
  }

  createTodo(todo: Todo): Observable<Todo> {
    return this.http.post<any>(this.apiUrl, todo).pipe(
      map(response => this.normalizeTodo(response))
    );
  }

  updateTodo(id: number, todo: Partial<Todo>): Observable<Todo> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, todo).pipe(
      map(response => this.normalizeTodo(response))
    );
  }

  deleteTodo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

