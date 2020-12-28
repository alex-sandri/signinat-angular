import { Component, ComponentRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ISerializedApp } from 'api/src/models/App';
import { ISerializedUser } from 'api/src/models/User';
import { FormComponent, FormOptions, IDateFormInput, ISelectFormInput, ITextFormInput } from 'src/app/components/form/form.component';
import { ApiService } from 'src/app/services/api/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit
{
  user?: ISerializedUser = this.auth.user;

  createNewAppFormOptions: FormOptions = {
    name: "Create new App",
    groups: [
      {
        name: "default",
        inputs: [
          { label: "App Name", name: "name", type: "text", required: true },
          { label: "URL", name: "url", type: "url", required: true },
          { label: "Scopes", name: "scopes", type: "select", required: true, options: { multiple: true }, },
        ],
      },
    ],
    submitButtonText: "Create",
    showCancelButton: true,
    hidden: true,
  };

  updateProfileFormOptions: FormOptions = {
    name: "Profile",
    groups: [
      {
        name: "default",
        inputs: [
          { label: "First Name", name: "first-name", type: "text", required: true, autocomplete: "given-name", value: this.user?.name.first },
          { label: "Last Name", name: "last-name", type: "text", required: true, autocomplete: "family-name", value: this.user?.name.last },
          { label: "Email", name: "email", type: "email", required: true, autocomplete: "email", value: this.user?.email },
        ],
      },
      {
        name: "Additional information",
        inputs: [
          { label: "Birthday", name: "birthday", type: "date", required: false, autocomplete: "bday", value: this.getBirthdayAsDate() },
        ],
      },
    ],
    submitButtonText: "Update",
    showCancelButton: true,
    hidden: true,
  };

  @ViewChild("createNewAppForm")
  createNewAppForm!: FormComponent;

  @ViewChild("updateProfileForm")
  updateProfileForm!: FormComponent;

  section: string;

  apps!: ISerializedApp[];

  async deleteAccount()
  {
    await this.api.deleteUser();

    this.router.navigateByUrl("/");
  }

  setSection(section: string)
  {
    this.section = section;

    this.router.navigateByUrl(`account/settings/${section}`);
  }

  getBirthdayAsDate(): Date | undefined
  {
    if (!this.user || !this.user.birthday) return;

    const date = new Date();

    date.setDate(this.user.birthday.day);
    date.setMonth(this.user.birthday.month - 1);
    date.setFullYear(this.user.birthday.year);

    return date;
  }

  getFormattedBirthday(): string
  {
    const date = this.getBirthdayAsDate();

    if (!date) return "";

    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  async createNewAppFormOnSubmit(end: () => void)
  {
    const response = await this.api.createApp({
      name: (this.createNewAppFormOptions.groups[0].inputs[0] as ITextFormInput).value,
      url: (this.createNewAppFormOptions.groups[0].inputs[1] as ITextFormInput).value,
      scopes: (this.createNewAppFormOptions.groups[0].inputs[2] as ISelectFormInput).selectedValues,
    });

    if (!response.result.valid)
    {
      this.createNewAppFormOptions.groups[0].inputs[0].error = response.errors.find(e => e.id.startsWith("app/name/"))?.message;
      this.createNewAppFormOptions.groups[0].inputs[1].error = response.errors.find(e => e.id.startsWith("app/url/"))?.message;
    }
    else
    {
      this.createNewAppForm.hide();
    }

    end();
  }

  async updateProfileFormOnSubmit(end: () => void)
  {
    const response = await this.api.updateUser({
      name: {
        first: (this.updateProfileFormOptions.groups[0].inputs[0] as ITextFormInput).value,
        last: (this.updateProfileFormOptions.groups[0].inputs[1] as ITextFormInput).value,
      },
      email: (this.updateProfileFormOptions.groups[0].inputs[2] as ITextFormInput).value,
      birthday: (this.updateProfileFormOptions.groups[1].inputs[0] as IDateFormInput).value?.toISOString(),
    });

    if (!response.result.valid)
    {
      this.updateProfileFormOptions.groups[0].inputs[0].error = response.errors.find(e => e.id.startsWith("user/name/first/"))?.message;
      this.updateProfileFormOptions.groups[0].inputs[1].error = response.errors.find(e => e.id.startsWith("user/name/last/"))?.message;
      this.updateProfileFormOptions.groups[0].inputs[2].error = response.errors.find(e => e.id.startsWith("user/email/"))?.message;

      this.updateProfileFormOptions.groups[1].inputs[0].error = response.errors.find(e => e.id.startsWith("user/birthday/"))?.message;
    }
    else
    {
      this.updateProfileForm.hide();
    }

    end();
  }

  constructor(private auth: AuthService, private api: ApiService, private router: Router)
  {
    this.section = router.url.split("/").pop() as string;

    if (this.section === "settings") this.section = "general";

    api.listApps().then(apps => this.apps = apps);

    api
      .listScopes()
      .then(scopes => (this.createNewAppFormOptions.groups[0].inputs[2] as ISelectFormInput).selectOptions = scopes);
  }

  ngOnInit(): void
  {}
}
