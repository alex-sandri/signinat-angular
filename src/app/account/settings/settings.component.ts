import { Component, ComponentRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ISerializedApp } from 'api/src/models/App';
import { ISerializedUser } from 'api/src/models/User';
import { FormComponent, FormOptions, IDateFormInput, ISelectFormInput, ITextFormInput } from 'src/app/components/form/form.component';
import { ApiService } from 'src/app/services/api/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import Forms from 'src/config/Forms';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent
{
  user?: ISerializedUser = this.auth.user;

  @ViewChild("createNewAppForm")
  createNewAppForm!: FormComponent;

  @ViewChild("updateProfileForm")
  updateProfileForm!: FormComponent;

  createNewAppFormConfig = Forms.createNewApp(this.api, this.createNewAppForm);

  updateProfileFormConfig = Forms.updateProfile(this.api, this.user as ISerializedUser, this.updateProfileForm, this.getBirthdayAsDate());

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

  constructor(private auth: AuthService, private api: ApiService, private router: Router)
  {
    this.section = router.url.split("/").pop() as string;

    if (this.section === "settings") this.section = "general";

    api.listApps().then(response => this.apps = response.data);

    api
      .listScopes()
      .then(response => (this.createNewAppFormConfig.options.groups[0].inputs[2] as ISelectFormInput).selectOptions = response.data);
  }
}
