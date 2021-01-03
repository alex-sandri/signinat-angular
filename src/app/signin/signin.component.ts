import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Forms from 'src/config/forms';
import { ApiService } from '../services/api/api.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent
{
  constructor(private api: ApiService, private router: Router, private route: ActivatedRoute)
  {}

  config = Forms.signIn(this.api, this.router, this.route);
}
