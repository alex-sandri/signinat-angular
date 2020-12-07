import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormOptions } from '../components/form/form.component';
import { ApiService } from '../services/api/api.service';
import { SettingsService } from '../services/settings/settings.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {
  options: FormOptions = {
    name: "Sign In",
    groups: [
      {
        name: "default",
        inputs: [
          { label: "Email", name: "email", type: "email", required: true, autocomplete: "email" },
          { label: "Password", name: "password", type: "password", required: true, autocomplete: "current-password" },
        ],
      },
    ],
    submitButtonText: "Sign In",
  };

  constructor(private api: ApiService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
  }

  async onSubmit(end: () => void): Promise<void>
  {
    const response = await this.api.createUserToken({
      user: {
        email: this.options.groups[0].inputs[0].value!,
        password: this.options.groups[0].inputs[1]!.value!,
      },
    });

    if (!response.result.valid)
    {
      this.options.groups[0].inputs[0].error = response.errors.find(e => e.id.startsWith("user/email/"))?.message;
      this.options.groups[0].inputs[1].error = response.errors.find(e => e.id.startsWith("user/password/"))?.message;
    }
    else
    {
      SettingsService.set("session.token", response.result.data!.id);
      SettingsService.set("session.userId", response.result.data!.user.id);

      if (this.route.snapshot.queryParams["ref"])
      {
        this.router.navigateByUrl(`/${this.route.snapshot.queryParams["ref"]}`)
      }
      else
      {
        this.router.navigateByUrl("/account");
      }
    }

    end();
  }
}
