import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {InputTextModule} from 'primeng/inputtext';

import { AppComponent } from './app.component';
import { TodoInputComponent } from './todo-input/todo-input.component';
import { TodoListComponent } from './todo-list/todo-list.component';
import { TodoElementComponent } from './todo-element/todo-element.component';

@NgModule({
  declarations: [
    AppComponent,
    TodoInputComponent,
    TodoListComponent,
    TodoElementComponent
  ],
  imports: [
    BrowserModule, InputTextModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {

}
