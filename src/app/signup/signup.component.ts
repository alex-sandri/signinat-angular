import { Component, OnInit } from '@angular/core';
import { FormOptions, IDateFormInput, ITextFormInput } from '../components/form/form.component';
import { ApiService } from '../services/api/api.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  options: FormOptions = {
    name: "Sign Up",
    groups: [
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
    submitButtonText: "Sign Up",
  };

  constructor(private api: ApiService) { }

  ngOnInit(): void {
  }

  async onSubmit(end: () => void): Promise<void>
  {
    const response = await this.api.createUser({
      name: {
        first: (this.options.groups[0].inputs[0] as ITextFormInput).value as string,
        last: (this.options.groups[0].inputs[1] as ITextFormInput).value as string,
      },
      email: (this.options.groups[0].inputs[2] as ITextFormInput).value as string,
      password: (this.options.groups[0].inputs[3] as ITextFormInput).value as string,
      birthday: (this.options.groups[1].inputs[0] as IDateFormInput).value?.toISOString(),
    });

    if (!response.result.valid)
    {
      this.options.groups[0].inputs[0].error = response.errors.find(e => e.id.startsWith("user/name/first/"))?.message;
      this.options.groups[0].inputs[1].error = response.errors.find(e => e.id.startsWith("user/name/last/"))?.message;
      this.options.groups[0].inputs[2].error = response.errors.find(e => e.id.startsWith("user/email/"))?.message;
      this.options.groups[0].inputs[3].error = response.errors.find(e => e.id.startsWith("user/password/"))?.message;
    }

    end();
  }
}
