import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {Todo} from "../shared/models";

@Injectable({
  providedIn: "root"
})

export class DataService {
  // Subject для хранения элементов списка todo
  private subject = new BehaviorSubject<Todo[]>([]);

  // Observable, созданный на основе subject
  todos$: Observable<Todo[]> = this.subject.asObservable();

  // Функция, добавляющая новый todo в хранилище
  onAddTodo(todo: Todo) {
    const todos = this.subject.getValue();
    const newTodos = [...todos, todo];
    this.subject.next(newTodos);
  }

  // Функция, удаляющая todo из хранилища
  onDeleteTodo(date: number) {
    const todos = this.subject.getValue();
    const newTodos = todos.filter(el => el.date !== date);
    this.subject.next(newTodos);
  }

}
