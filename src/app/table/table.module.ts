import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TableComponent } from './table.component';
import { TablePageComponent } from './table.page.component';

import { MatTableModule, MatPaginatorModule, } from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot([
      {
        path: 'table',
        component: TablePageComponent
      }
    ]),
    MatTableModule,
    MatPaginatorModule,
  ],
  declarations: [
    TableComponent, TablePageComponent
  ],
  exports: [
    TableComponent, TablePageComponent
  ]
})

export class TableModule { }
