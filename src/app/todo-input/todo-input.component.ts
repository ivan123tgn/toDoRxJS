import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {fromEvent, merge} from "rxjs";
import {filter, map, tap} from "rxjs/operators";
import {DataService} from "../services/data.service";

@Component({
  selector: 'todo-input',
  templateUrl: './todo-input.component.html',
  styleUrls: ['./todo-input.component.css']
})
export class TodoInputComponent implements OnInit, AfterViewInit {

  constructor(public dataService: DataService) { }

  @ViewChild('mainInput') mainInput: ElementRef ;
  @ViewChild('addTodoButton') addTodoButton: ElementRef;

  ngOnInit(): void {
  }

  ngAfterViewInit() {

    // Поток нажатий для всех клавиш
    const keyEvents$ = fromEvent<any>(this.mainInput.nativeElement,'keyup');

    // Поток нажатий на Enter
    const enterEvents$ = keyEvents$
      .pipe(
        filter(event => event.code === 'Enter'),
        map(event => event.target?.value)
      );

    // Поток нажатий на плюс-кнопку
    const clickEvents$ = fromEvent<any>(this.addTodoButton.nativeElement,'click')
      .pipe(
        map(() => this.mainInput.nativeElement.value)
      );

    // Объединенный поток
    merge(enterEvents$, clickEvents$)
      .pipe(
        tap(() => {
          this.addTodo();
          this.mainInput.nativeElement.value = '';
        })
      )
      .subscribe();

  }

  addTodo() {
    const newTodo = {
      author: 'anonymous',
      content: this.mainInput.nativeElement.value,
      completed: false,
      deleted: false,
      date: Date.now()
    };
    if (newTodo.content !== '') {
      this.dataService.onAddTodo(newTodo);
    }
  }

}
