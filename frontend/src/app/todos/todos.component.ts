import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TodosService } from '../services/todos.service';
import { Todo, TodoStatus } from '../models/todo.model';

@Component({
  selector: 'app-todos',
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.css']
})
export class TodosComponent implements OnInit {
  todos: Todo[] = [];
  todoItems: Todo[] = [];
  inProgressItems: Todo[] = [];
  doneItems: Todo[] = [];
  
  newTodoTitle: string = '';
  newTodoDescription: string = '';
  loading: boolean = false;
  error: string = '';

  columns = [
    { id: 'todo', title: 'To Do', items: this.todoItems },
    { id: 'in-progress', title: 'In Progress', items: this.inProgressItems },
    { id: 'done', title: 'Done', items: this.doneItems }
  ];

  constructor(private todosService: TodosService) { }

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos(): void {
    this.loading = true;
    this.error = '';
    this.todosService.getTodos().subscribe({
      next: (todos) => {
        this.todos = todos.sort((a, b) => (a.order || 0) - (b.order || 0));
        this.organizeTodosByStatus();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load todos. Please try again.';
        this.loading = false;
        console.error('Error loading todos:', err);
      }
    });
  }

  organizeTodosByStatus(): void {
    this.todoItems = this.todos
      .filter(t => !t.status || t.status === 'todo' || t.status === 'pending')
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    
    this.inProgressItems = this.todos
      .filter(t => t.status === 'in-progress')
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    
    this.doneItems = this.todos
      .filter(t => t.status === 'done' || t.completed)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  addTodo(): void {
    if (!this.newTodoTitle.trim()) {
      return;
    }

    const newTodo: Todo = {
      title: this.newTodoTitle.trim(),
      description: this.newTodoDescription.trim(),
      completed: false,
      status: 'todo',
      order: this.todoItems.length
    };

    this.todosService.createTodo(newTodo).subscribe({
      next: (todo) => {
        this.todos.push(todo);
        this.organizeTodosByStatus();
        this.newTodoTitle = '';
        this.newTodoDescription = '';
      },
      error: (err) => {
        this.error = 'Failed to add todo. Please try again.';
        console.error('Error adding todo:', err);
      }
    });
  }

  toggleTodo(todo: Todo): void {
    if (todo.id) {
      const updatedTodo: Partial<Todo> = { 
        ...todo, 
        completed: !todo.completed,
        status: (!todo.completed ? 'done' : 'todo') as TodoStatus
      };
      this.todosService.updateTodo(todo.id, updatedTodo).subscribe({
        next: (updated) => {
          const index = this.todos.findIndex(t => t.id === updated.id);
          if (index !== -1) {
            this.todos[index] = updated;
          }
          this.organizeTodosByStatus();
        },
        error: (err) => {
          this.error = 'Failed to update todo. Please try again.';
          console.error('Error updating todo:', err);
        }
      });
    }
  }

  deleteTodo(todo: Todo): void {
    if (todo.id) {
      this.todosService.deleteTodo(todo.id).subscribe({
        next: () => {
          this.todos = this.todos.filter(t => t.id !== todo.id);
          this.organizeTodosByStatus();
        },
        error: (err) => {
          this.error = 'Failed to delete todo. Please try again.';
          console.error('Error deleting todo:', err);
        }
      });
    }
  }

  drop(event: CdkDragDrop<Todo[]>): void {
    if (event.previousContainer === event.container) {
      // Moving within the same column
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.updateTodosOrder(event.container.data);
    } else {
      // Moving between columns
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
      const todo = event.container.data[event.currentIndex];
      const newStatus = this.getStatusFromContainerId(event.container.id);
      
      if (todo.id) {
        this.todosService.updateTodo(todo.id, { 
          status: newStatus,
          completed: newStatus === 'done',
          order: event.currentIndex
        }).subscribe({
          next: (updated) => {
            const index = this.todos.findIndex(t => t.id === updated.id);
            if (index !== -1) {
              this.todos[index] = updated;
            }
            this.updateTodosOrder(event.container.data);
            this.updateTodosOrder(event.previousContainer.data);
          },
          error: (err) => {
            console.error('Error updating todo status:', err);
            // Revert the change on error
            transferArrayItem(
              event.container.data,
              event.previousContainer.data,
              event.currentIndex,
              event.previousIndex
            );
          }
        });
      }
    }
  }

  getStatusFromContainerId(containerId: string): TodoStatus {
    if (containerId.includes('todo')) return 'todo';
    if (containerId.includes('in-progress')) return 'in-progress';
    return 'done';
  }

  updateTodosOrder(items: Todo[]): void {
    items.forEach((todo, index) => {
      if (todo.id) {
        this.todosService.updateTodo(todo.id, { order: index }).subscribe({
          error: (err) => {
            console.error('Error updating todo order:', err);
          }
        });
      }
    });
  }

  get completedCount(): number {
    return this.doneItems.length;
  }

  get totalCount(): number {
    return this.todos.length;
  }
}

