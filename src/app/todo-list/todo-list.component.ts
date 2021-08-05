import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DataService} from "../services/data.service";
import {MenuItem, PrimeNGConfig} from 'primeng/api';
import {fromEvent, Observable, Subscription} from "rxjs";
import {map, tap} from "rxjs/operators";

@Component({
  selector: 'todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css']
})
export class TodoListComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(public dataService: DataService, private primengConfig: PrimeNGConfig) { }

  showList$: Observable<any>;
  activeCounter$ : Observable<any>;
  completedCounter$: Observable<any>;
  totalCounter$: Observable<any>;
  deletedCounter$: Observable<any>;

  ngOnInit() {
    this.primengConfig.ripple = true;

    this.showList$ = this.dataService.todos$
      .pipe(
        map(todos => {
          if(todos.length > 0) {
            return true;
          } else {
            return false;
          }
        })
      );

    this.activeCounter$ = this.dataService.activeTodos$
      .pipe(
        map(activeTodos => "Active: " + activeTodos.length)
      );

    this.completedCounter$ = this.dataService.completedTodos$
      .pipe(
        map(completedTodos => 'Completed: ' + completedTodos.length)
      );

    this.totalCounter$ = this.dataService.nonDeletedTodos$
      .pipe(
        map(totalTodos => 'Total: ' + totalTodos.length)
      );

    this.deletedCounter$ = this.dataService.deletedTodos$
      .pipe(
        map(deletedTodos => 'Deleted: ' + deletedTodos.length)
      );
  }

  ngAfterViewInit() {}

  ngOnDestroy() {}

}
