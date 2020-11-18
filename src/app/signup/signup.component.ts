import { Component, OnInit } from '@angular/core';
import { FormOptions } from '../components/form/form.component';
import { ApiService } from '../services/api/api.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  options = new FormOptions([
    {
      name: "default",
      inputs: [
        { label: "First Name", name: "first-name", type: "text", required: true, autocomplete: "given-name" },
        { label: "Last Name", name: "last-name", type: "text", required: true, autocomplete: "family-name" },
        { label: "Email", name: "email", type: "email", required: true, autocomplete: "email" },
        { label: "Password", name: "password", type: "password", required: true, autocomplete: "new-password" },
      ],
    },
    {
      name: "Additional information",
      description: {
        text: `
          This information is not required to create an account but some apps may require it,
          so when signing into an app for the first time we may ask you
          to add this information to your account.
        `,
        options: { mark: true },
      },
      inputs: [
        { label: "Birthday", name: "birthday", type: "date", required: false, autocomplete: "bday" },
      ],
    },
  ]);

  constructor(private api: ApiService) { }

  ngOnInit(): void {
  }

  async onSubmit(form: HTMLFormElement): Promise<void>
  {
    const submitButton = form.querySelector("button[type=submit]") as HTMLButtonElement;

    submitButton.disabled = true;

    const response = await this.api.createUser({
      name: {
        first: this.options.getInput("first-name")!.value!.trim(),
        last: this.options.getInput("last-name")!.value!.trim(),
      },
      email: this.options.getInput("email")!.value!.trim(),
      password: this.options.getInput("password")!.value!,
    });

    if (!response.result.valid)
    {
      this.options.getInput("first-name")!.error = response.errors.name.first.error;
      this.options.getInput("last-name")!.error = response.errors.name.last.error;
      this.options.getInput("email")!.error = response.errors.email.error;
      this.options.getInput("password")!.error = response.errors.password.error;
    }

    submitButton.disabled = false;
  }

}
