import {Injectable, OnInit} from "@angular/core";
import {BehaviorSubject, merge, noop, Observable, Subscription} from "rxjs";
import {Todo} from "../shared/models";
import {filter, first, map, tap} from "rxjs/operators";
import {AngularFirestore} from "@angular/fire/firestore";
import {MessageService} from "primeng/api";

@Injectable({
  providedIn: "root"
})

export class DataService {

  constructor(
    private firestore: AngularFirestore,
    public messageService: MessageService
  ) {
    // Выгрузка начальных данных из БД
    this.firestore.collection<Todo>('todos').valueChanges()
      .pipe(
        first()
      )
      .subscribe(
        val => this.subject.next(val),
        err => console.log(err)
      );
  }

  // Subject для хранения элементов списка todo
  private subject = new BehaviorSubject<Todo[]>([]);

  // Observable, созданный на основе subject, и его производные
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
    // --- Локально
    const todos = this.subject.getValue();
    const newTodos = [...todos, todo];
    this.subject.next(newTodos);
    // --- В БД
    this.firestore.collection('todos').doc(todo.date.toString()).set(todo);
  }

  // Функция, удаляющая todo
  onDeleteTodo(date: number) {
    // --- Локально
    const todos = this.subject.getValue();
    const deleteIndex = todos.findIndex(el => el.date === date);
    todos[deleteIndex].deleted = true;
    this.subject.next(todos);
    // --- В БД
    this.firestore.collection('todos').doc(date.toString()).update({deleted: true});
  }

  // Функция, завершающая todo
  onCompleteTodo(date: number) {
    // --- Локально
    const todos = this.subject.getValue();
    const completeIndex = todos.findIndex(el => el.date === date);
    todos[completeIndex].completed = !todos[completeIndex].completed;
    const finalStatus = todos[completeIndex].completed;
    this.subject.next(todos);
    // --- В БД
    this.firestore.collection('todos').doc(date.toString()).update({completed: finalStatus});
  }

  // Функция, восстанавливающая todo
  onRestoreTodo(date: number) {
    // --- Локально
    const todos = this.subject.getValue();
    const restoreIndex = todos.findIndex(el => el.date === date);
    todos[restoreIndex].deleted = false;
    this.subject.next(todos);
    // --- В БД
    this.firestore.collection('todos').doc(date.toString()).update({deleted: false});
  }

  // Функция, удаляющая навсегда todo
  onDeleteForeverTodo(date: number) {
    // --- Локально
    const todos = this.subject.getValue();
    const newTodos = todos.filter(todo => todo.date !== date);
    this.subject.next(newTodos);
    // --- В БД
    this.firestore.collection('todos').doc(date.toString()).delete();
  }

  // Функция, изменяющая содержание todo
  refreshTodo (date: number, newContent: string) {
    // Локально
    const todos = this.subject.getValue();
    const refreshIndex = todos.findIndex(el => el.date === date);
    todos[refreshIndex].content = newContent;
    this.subject.next(todos);
    // В БД
    this.firestore.collection('todos').doc(date.toString()).update({content: newContent});
  }

  // Функция, удаляющая все завершенные todo
  onRemoveCompleted() {
    // Локально (работает)
    const todos = this.subject.getValue();
    let newTodos: Todo[] = [];
    const changes = {'deleted': true};
    for (let i = 0; i < todos.length; i++) {
      if (todos[i].completed && !todos[i].deleted) {
        newTodos[i] = {...todos[i], ...changes};
      } else {
        newTodos[i] = todos[i];
      }
    }
    this.subject.next(newTodos);
    // В БД (работает)
    let promiseChain = [];
    for (let i = 0; i < todos.length; i++) {
      if (todos[i].completed && !todos[i].deleted) {
        promiseChain.push(this.firestore.collection('todos').doc(todos[i].date.toString()).update(changes));
      }
    }
    Promise.all(promiseChain)
      .then(val => {
        this.messageService.add({
          severity:'warn',
          summary: 'Remove completed',
          detail: 'Completed todos are removed!'});
      })
      .catch(err => {
        this.messageService.add({
          severity:'error',
          summary: 'Remove completed error',
          detail: err});
      });
  }

  // Функция, восстанавливающая все удаленные todo
  onRestoreAll() {
    // Локально (работает)
    const todos = this.subject.getValue();
    let newTodos: Todo[] = [];
    const changes = {'deleted': false};
    for (let i = 0; i < todos.length; i++) {
      if (todos[i].deleted) {
        newTodos[i] = {...todos[i], ...changes};
      } else {
        newTodos[i] = todos[i];
      }
    }
    this.subject.next(newTodos);
    // В БД (работает)
    let promiseChain = [];
    for (let i = 0; i < todos.length; i++) {
      if (todos[i].deleted) {
        promiseChain.push(this.firestore.collection('todos').doc(todos[i].date.toString()).update(changes));
      }
    }
    Promise.all(promiseChain)
      .then(val => {
        this.messageService.add({
          severity:'success',
          summary: 'Restore all',
          detail: 'Deleted todos are restored!'});
      })
      .catch(err => {
        this.messageService.add({
          severity:'error',
          summary: 'Restore all error',
          detail: err});
      });
  }

  // Функция, удаляющая навсегда все удаленные todo
  onClearAll() {
    // Локально (работает)
    const todos = this.subject.getValue();
    let newTodos: Todo[] = [];
    newTodos = todos.filter(todo => !todo.deleted);
    this.subject.next(newTodos);
    // В БД (работает)
    let promiseChain = [];
    for (let i = 0; i < todos.length; i ++) {
      if (todos[i].deleted) {
        promiseChain.push(this.firestore.collection('todos').doc(todos[i].date.toString()).delete());
      }
    }
    Promise.all(promiseChain)
      .then(val => {
        this.messageService.add({
          severity:'warn',
          summary: 'Clear all',
          detail: 'Deleted todos are removed forever!'});
      })
      .catch(err => {
        this.messageService.add({
          severity:'error',
          summary: 'Clear all error',
          detail: err});
      });
  }

}
