import { Component, OnInit } from '@angular/core';
import {DataService} from "../services/data.service";
import {fromEvent, Observable} from "rxjs";

@Component({
  selector: 'todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css']
})
export class TodoListComponent implements OnInit {

  constructor(public dataService: DataService) { }

  ngOnInit(): void {
  }

}
