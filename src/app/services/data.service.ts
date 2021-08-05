import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {Todo} from "../shared/models";
import {filter, map} from "rxjs/operators";

@Injectable({
  providedIn: "root"
})

export class DataService {
  // Subject для хранения элементов списка todo
  private subject = new BehaviorSubject<Todo[]>([]);

  // Observable, созданный на основе subject
  todos$: Observable<Todo[]> = this.subject.asObservable();
  activeTodos$: Observable<Todo[]> = this.todos$
    .pipe(
      map(todos => todos.filter(todo => !todo.completed && !todo.deleted))
    );
  completedTodos$: Observable<Todo[]> = this.todos$
    .pipe(
      map(todos => todos.filter(todo => todo.completed && !todo.deleted))
    )
  deletedTodos$: Observable<Todo[]> = this.todos$
    .pipe(
      map(todos => todos.filter(todo => todo.deleted))
    );
  nonDeletedTodos$: Observable<Todo[]> = this.todos$
    .pipe(
      map(todos => todos.filter(todo => !todo.deleted))
    );

  // Функция, добавляющая новый todo в хранилище
  onAddTodo(todo: Todo) {
    const todos = this.subject.getValue();
    const newTodos = [...todos, todo];
    this.subject.next(newTodos);
  }

  // Функция, удаляющая todo
  onDeleteTodo(date: number) {
    const todos = this.subject.getValue();
    const deleteIndex = todos.findIndex(el => el.date === date);
    todos[deleteIndex].deleted = true;
    this.subject.next(todos);
  }

  // Функция, завершающая todo
  onCompleteTodo(date: number) {
    const todos = this.subject.getValue();
    const completeIndex = todos.findIndex(el => el.date === date);
    todos[completeIndex].completed = !todos[completeIndex].completed;
    this.subject.next(todos);
  }

  // Функция, восстанавливающая todo
  onRestoreTodo(date: number) {
    const todos = this.subject.getValue();
    const restoreIndex = todos.findIndex(el => el.date === date);
    todos[restoreIndex].deleted = false;
    this.subject.next(todos);
  }

  // Функция, удаляющая навсегда todo
  onDeleteForeverTodo(date: number) {
    const todos = this.subject.getValue();
    const newTodos = todos.filter(todo => todo.date !== date);
    this.subject.next(newTodos);
  }

  // Функция, удаляющая завершенный todo
  onRemoveCompleted() {
    const todos = this.subject.getValue();
    const newTodos = todos.map(todo => {
      if (todo.completed && !todo.deleted) {
        todo.deleted = true;
        return todo;
      } else {
        return todo;
      }
    });
    this.subject.next(newTodos);
  }

  // Функция, восстанавливающая все удаленные todo
  onRestoreAll() {
    const todos = this.subject.getValue();
    const newTodos = todos.map(todo => {
      if (todo.deleted) {
        todo.deleted = false;
        return todo;
      } else {
        return todo;
      }
    });
    this.subject.next(newTodos);
  }

  // Функция, удаляющая навсегда все удаленные todo
  onClearAll() {
    const todos = this.subject.getValue();
    const newTodos = todos.filter(todo => !todo.deleted);
    this.subject.next(newTodos);
  }

  // Функция, изменяющая содержание todo
  refreshTodo (date: number, newContent: string) {
    const todos = this.subject.getValue();
    const refreshIndex = todos.findIndex(el => el.date === date);
    todos[refreshIndex].content = newContent;
    this.subject.next(todos);
  }

}
