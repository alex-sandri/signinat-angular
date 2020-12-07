import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit
{
  user = this.auth.user;

  constructor(private auth: AuthService)
  {}

  ngOnInit(): void
  {}
}
