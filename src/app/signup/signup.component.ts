import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api/api.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  formValues: {
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  } = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  };

  firstNameError: string = "";
  lastNameError: string = "";
  emailError: string = "";
  passwordError: string = "";

  isAdditionalInformationShown = false;

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
        first: this.formValues.firstName.trim(),
        last: this.formValues.lastName.trim(),
      },
      email: this.formValues.email.trim(),
      password: this.formValues.password,
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
