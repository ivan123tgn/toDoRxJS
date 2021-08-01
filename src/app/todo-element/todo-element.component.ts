import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Todo} from "../shared/models";
import {EventEmitter} from "@angular/core";
import {DataService} from "../services/data.service";
import {fromEvent, Observable, Subscription} from "rxjs";
import {tap} from "rxjs/operators";
import {subscriptionLogsToBeFn} from "rxjs/internal/testing/TestScheduler";

@Component({
  selector: 'todo-element',
  templateUrl: './todo-element.component.html',
  styleUrls: ['./todo-element.component.css']
})

export class TodoElementComponent implements OnInit,AfterViewInit,OnDestroy {
  @Input()
  todoData: Todo;
  @ViewChild('deleteButton') deleteButton: ElementRef ;
  deleteEvent$: Observable<any>;
  subscription$: Subscription;

  constructor(public dataService: DataService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    // Поток нажатий на кнопку удаления
    this.deleteEvent$ = fromEvent<any>(this.deleteButton.nativeElement,'click')
      .pipe(
        tap(() => this.dataService.onDeleteTodo(this.todoData.date))
      );
    this.subscription$ = this.deleteEvent$.subscribe();
  }

  ngOnDestroy() {
    this.subscription$.unsubscribe();
  }

}
