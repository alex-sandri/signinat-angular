import { Component, OnInit } from '@angular/core';
import { ApiResponse } from 'api/src/typings/ApiResponse';
import { ApiService } from '../services/api/api.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  firstName: string = "";
  lastName: string = "";
  email: string = "";
  password: string = "";

  firstNameError: string = "";
  lastNameError: string = "";
  emailError: string = "";
  passwordError: string = "";

  setFirstName = (value: string) => { this.firstName = value; }
  setLastName = (value: string) => { this.lastName = value; }
  setEmail = (value: string) => { this.email = value; }
  setPassword = (value: string) => { this.password = value; }

  constructor(private api: ApiService) { }

  ngOnInit(): void {
  }

  async onSubmit(e: Event, form: HTMLFormElement): Promise<void> {
    e.preventDefault();

    const submitButton = form.querySelector("button[type=submit]") as HTMLButtonElement;

    submitButton.disabled = true;

    this.firstNameError = this.lastNameError = this.emailError = this.passwordError = "";

    const response = await this.api.createUser({
      name: {
        first: this.firstName.trim(),
        last: this.lastName.trim(),
      },
      email: this.email.trim(),
      password: this.password,
    });

    if (!response.result.valid)
    {
      this.firstNameError = response.errors.name.first.error;
      this.lastNameError = response.errors.name.last.error;
      this.emailError = response.errors.email.error;
      this.passwordError = response.errors.password.error;
    }
    else
    {
      form.reset();
    }

    submitButton.disabled = false;
  }

}
