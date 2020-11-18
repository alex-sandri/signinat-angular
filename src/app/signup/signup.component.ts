import { Component, OnInit } from '@angular/core';
import { FormInputs } from '../components/form/form.component';
import { ApiService } from '../services/api/api.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  inputs: FormInputs = {
    firstName: { label: "First Name", name: "first-name", type: "text", required: true, autocomplete: "given-name" },
    lastName: { label: "Last Name", name: "last-name", type: "text", required: true, autocomplete: "family-name" },
    email: { label: "Email", name: "email", type: "email", required: true, autocomplete: "email" },
    password: { label: "Password", name: "password", type: "password", required: true, autocomplete: "new-password" },
  };

  isAdditionalInformationShown = false;

  constructor(private api: ApiService) { }

  ngOnInit(): void {
  }

  async onSubmit(): Promise<boolean> {
    const response = await this.api.createUser({
      name: {
        first: this.inputs.firstName.value!.trim(),
        last: this.inputs.lastName.value!.trim(),
      },
      email: this.inputs.email.value!.trim(),
      password: this.inputs.password.value!,
    });

    if (!response.result.valid)
    {
      this.inputs.firstName.error = response.errors.name.first.error;
      this.inputs.lastName.error = response.errors.name.last.error;
      this.inputs.email.error = response.errors.email.error;
      this.inputs.password.error = response.errors.password.error;
    }

    return response.result.valid;
  }

}
