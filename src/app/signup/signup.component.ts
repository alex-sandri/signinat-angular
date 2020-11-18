import { Component, OnInit } from '@angular/core';
import { FormInput } from '../components/form/form.component';
import { ApiService } from '../services/api/api.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  inputs: FormInput[] = [
    { label: "First Name", name: "first-name", type: "text", required: true, autocomplete: "given-name" },
    { label: "Last Name", name: "last-name", type: "text", required: true, autocomplete: "family-name" },
    { label: "Email", name: "email", type: "email", required: true, autocomplete: "email" },
    { label: "Password", name: "password", type: "password", required: true, autocomplete: "new-password" },
  ];

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
