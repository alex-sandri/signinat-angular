import { Component, OnInit } from '@angular/core';
import Forms from 'src/config/Forms';
import { FormOptions, IDateFormInput, ITextFormInput } from '../components/form/form.component';
import { ApiService } from '../services/api/api.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent
{
  constructor(private api: ApiService)
  {}

  config = Forms.signUp(this.api);
}
