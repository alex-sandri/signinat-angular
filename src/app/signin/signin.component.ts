import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Forms from 'src/config/Forms';
import { ApiService } from '../services/api/api.service';
import { SettingsService } from '../services/settings/settings.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent
{
  constructor(private api: ApiService, private router: Router, private route: ActivatedRoute, private settings: SettingsService)
  {}

  config = Forms.signIn(this.api, this.router, this.route, this.settings);
}
