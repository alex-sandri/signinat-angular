import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ISerializedApp } from 'api/src/models/App';
import { ISerializedScope } from 'api/src/models/Scope';
import { ISerializedUser } from 'api/src/models/User';
import { FormOptions } from 'src/app/components/form/form.component';
import { ApiService } from 'src/app/services/api/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  createNewAppFormOptions = new FormOptions(
    "Create new App",
    [
      {
        name: "default",
        inputs: [
          { label: "App Name", name: "name", type: "text", required: true },
          { label: "URL", name: "url", type: "url", required: true },
          { label: "Scopes", name: "scopes", type: "select", required: true, options: { multiple: true }, },
        ],
      },
    ],
    "Create",
    true,
  );

  updateProfileFormOptions = new FormOptions(
    "Profile",
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
    "Update",
    true,
  );

  @ViewChild("createNewAppDialog") createNewAppDialog!: ElementRef<HTMLDialogElement>;
  @ViewChild("updateProfileDialog") updateProfileDialog!: ElementRef<HTMLDialogElement>;

  section: string;

  user!: ISerializedUser;

  apps!: ISerializedApp[];

  async deleteAccount() {
    await this.api.deleteUser();

    this.router.navigateByUrl("/");
  }

  setCreateNewAppDialogVisible(visible: boolean) {
    if (visible)
    {
      this.createNewAppDialog.nativeElement.showModal();
    }
    else
    {
      this.createNewAppDialog.nativeElement.close();

      this.createNewAppDialog.nativeElement.querySelector("form")!.reset();
    }
  }

  setDialogVisible(dialog: HTMLDialogElement, visible: boolean)
  {
    if (visible)
    {
      dialog.showModal();
    }
    else
    {
      dialog.querySelector("form")!.reset();

      dialog.close();
    }
  }

  setSection(section: string) {
    this.section = section;

    this.router.navigateByUrl(`account/settings/${section}`);
  }

  async createNewAppFormOnSubmit(form: HTMLFormElement) {
    const submitButton = form.querySelector("button[type=submit]") as HTMLButtonElement;

    submitButton.disabled = true;

    const response = await this.api.createApp({
      name: this.createNewAppFormOptions.getInput("name")!.value!.trim(),
      url: this.createNewAppFormOptions.getInput("url")!.value!.trim(),
      scopes: this.createNewAppFormOptions.getInput("scopes")!.selectedValues!,
    });

    if (!response.result.valid)
    {
      this.createNewAppFormOptions.getInput("name")!.error = response.errors.find(e => e.id.startsWith("app/name/"))?.message;
      this.createNewAppFormOptions.getInput("url")!.error = response.errors.find(e => e.id.startsWith("app/url/"))?.message;
    }
    else
    {
      this.setCreateNewAppDialogVisible(false);
    }

    submitButton.disabled = false;
  }

  constructor(private api: ApiService, private router: Router) {
    this.section = router.url.split("/").pop() as string;

    if (this.section === "settings") this.section = "general";

    api.retrieveToken(AuthService.token as string).then(token => this.user = token.user);

    api.listApps().then(apps => this.apps = apps);

    api
      .listScopes()
      .then(scopes => this.createNewAppFormOptions.getInput("scopes")!.selectOptions = scopes);
  }

  ngOnInit(): void {
  }

}
