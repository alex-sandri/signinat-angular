import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ISerializedSession } from 'api/src/models/Session';
import { ApiService } from '../services/api/api.service';
import { SettingsService } from '../services/settings/settings.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {

  email: string = "";
  password: string = "";

  emailError: string = "";
  passwordError: string = "";

  setEmail = (value: string) => { this.email = value; }
  setPassword = (value: string) => { this.password = value; }

  constructor(private api: ApiService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
  }

  async onSubmit(e: Event, form: HTMLFormElement): Promise<void> {
    e.preventDefault();

    const submitButton = form.querySelector("button[type=submit]") as HTMLButtonElement;

    submitButton.disabled = true;

    this.emailError = this.passwordError = "";

    const response = await this.api.createSession({
      email: this.email.trim(),
      password: this.password,
    });

    if (!response.result.valid)
    {
      this.emailError = response.errors.email.error;
      this.passwordError = response.errors.password.error;
    }
    else
    {
      SettingsService.set("session", (response.result.data as ISerializedSession).id);

      if (this.route.snapshot.queryParams["ref"])
      {
        this.router.navigateByUrl(`/${this.route.snapshot.queryParams["ref"]}`)
      }
      else
      {
        this.router.navigateByUrl("/account");
      }
    }

    submitButton.disabled = false;
  }

}
