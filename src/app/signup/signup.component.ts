import { Component, OnInit } from '@angular/core';
import { FormOptions } from '../components/form/form.component';
import { ApiService } from '../services/api/api.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  options = new FormOptions(
    "Sign Up",
    [
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
        inputs: [
          { label: "Birthday", name: "birthday", type: "date", required: false, autocomplete: "bday" },
        ],
      },
    ],
    "Sign Up",
  );

  constructor(private api: ApiService) { }

  ngOnInit(): void {
  }

  async onSubmit(end: () => void): Promise<void>
  {
    const response = await this.api.createUser({
      name: {
        first: this.options.getInput("first-name")!.value!.trim(),
        last: this.options.getInput("last-name")!.value!.trim(),
      },
      email: this.options.getInput("email")!.value!.trim(),
      password: this.options.getInput("password")!.value!,
      birthday: this.options.getInput("birthday")!.value!,
    });

    if (!response.result.valid)
    {
      this.options.getInput("first-name")!.error = response.errors.find(e => e.id.startsWith("user/name/first/"))?.message;
      this.options.getInput("last-name")!.error = response.errors.find(e => e.id.startsWith("user/name/last/"))?.message;
      this.options.getInput("email")!.error = response.errors.find(e => e.id.startsWith("user/email/"))?.message;
      this.options.getInput("password")!.error = response.errors.find(e => e.id.startsWith("user/password/"))?.message;
    }

    end();
  }
}
