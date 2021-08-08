import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Todo} from "../shared/models";
import {DataService} from "../services/data.service";
import {fromEvent, merge, Observable, Subscription} from "rxjs";
import {filter, finalize, first, map, tap} from "rxjs/operators";

@Component({
  selector: 'todo-element',
  templateUrl: './todo-element.component.html',
  styleUrls: ['./todo-element.component.css']
})

export class TodoElementComponent implements OnInit,AfterViewInit,OnDestroy {
  @Input()
  todoData: Todo;

  @ViewChild('deleteButton') deleteButton: ElementRef;
  @ViewChild('deleteForeverButton') deleteForeverButton: ElementRef;
  @ViewChild('completeBox') completeBox: ElementRef ;
  @ViewChild('restoreButton') restoreButton: ElementRef ;
  @ViewChild('todoText') todoText: ElementRef ;
  @ViewChild('changeInput') changeInput: ElementRef ;
  @ViewChild('saveChange') saveChange: ElementRef ;

  deleteEvent$: Observable<any>;
  completeEvent$: Observable<any>;
  restoreEvent$: Observable<any>;
  deleteForeverEvent$: Observable<any>;
  todoTextEvent$: Observable<any>;

  subscriptionDelete$: Subscription;
  subscriptionDeleteForever$: Subscription;
  subscriptionComplete$ : Subscription;
  subscriptionRestore$: Subscription;
  subscriptionTextEvent$: Subscription;

  showChangeInput: boolean = false;

  constructor(public dataService: DataService) { }

  ngOnInit(): void {}

  ngAfterViewInit() {

    // Поток нажатий на кнопку удаления
    this.deleteEvent$ = fromEvent<any>(this.deleteButton.nativeElement,'click')
      .pipe(
        tap(() => {
          this.dataService.onDeleteTodo(this.todoData.date);
        })
      );
    this.subscriptionDelete$ = this.deleteEvent$.subscribe();

    // Поток нажатий на чекбокс завершения
    this.completeEvent$ = fromEvent<any>(this.completeBox.nativeElement,'click')
      .pipe(
        tap(() => this.dataService.onCompleteTodo(this.todoData.date))
      );
    this.subscriptionComplete$ = this.completeEvent$.subscribe();

    // Поток нажатий на кнопку восстановления
    this.restoreEvent$ = fromEvent<any>(this.restoreButton.nativeElement,'click')
      .pipe(
        tap(() => {
          this.dataService.onRestoreTodo(this.todoData.date);
        })
      );
    this.subscriptionRestore$ = this.restoreEvent$.subscribe();

    //Поток нажатий на кнопку "удалить навсегда"
    this.deleteForeverEvent$ = fromEvent<any>(this.deleteForeverButton.nativeElement,'click')
      .pipe(
        tap(() => {
          this.dataService.onDeleteForeverTodo(this.todoData.date);
        })
      );
    this.subscriptionDeleteForever$ = this.deleteForeverEvent$.subscribe();

    //Поток двойных кликов для редактирования todo
    this.todoTextEvent$ = fromEvent<any>(this.todoText.nativeElement, 'dblclick')
      .pipe(
        tap(() => {
          this.showChangeInput = true;
          const clickEventButton$ = fromEvent<any>(this.saveChange.nativeElement,'click');
          const clickOutside$ = fromEvent<any>(document, 'click')
            .pipe(
              filter(event => event.target !== this.changeInput.nativeElement && event.target !== this.saveChange.nativeElement)
            );
          merge(clickEventButton$, clickOutside$)
            .pipe(
              first(),
              map(() => this.changeInput.nativeElement.value),
              tap(val => {
                this.todoData.content = val;
                this.showChangeInput = false;
                this.dataService.refreshTodo(this.todoData.date, val);
              })
            ).subscribe();
        })
      );
    this.subscriptionTextEvent$ = this.todoTextEvent$.subscribe();

  }

  ngOnDestroy() {
    // Отписка от всех Observable
    this.subscriptionDelete$.unsubscribe();
    this.subscriptionComplete$.unsubscribe();
    this.subscriptionRestore$.unsubscribe();
    this.subscriptionDeleteForever$.unsubscribe();
    this.subscriptionTextEvent$.unsubscribe();
  }


}
