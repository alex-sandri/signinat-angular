import { Component, Input, OnInit } from '@angular/core';
import { ISerializedScope } from 'api/src/models/Scope';

@Component({
  selector: 'app-scope-list',
  templateUrl: './scope-list.component.html',
  styleUrls: ['./scope-list.component.scss']
})
export class ScopeListComponent implements OnInit {

  @Input("scopes")
  scopes: ISerializedScope[] = [];

  constructor() { }

  ngOnInit(): void {
  }

}
