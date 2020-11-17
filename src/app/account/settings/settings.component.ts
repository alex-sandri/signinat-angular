import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ISerializedApp } from 'api/src/models/App';
import { ISerializedScope } from 'api/src/models/Scope';
import { ApiService } from 'src/app/services/api/api.service';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  @ViewChild("createNewAppDialog") createNewAppDialog!: ElementRef<HTMLDialogElement>;
  @ViewChild("createNewAppForm") createNewAppForm!: ElementRef<HTMLFormElement>;

  section: string;

  firstName: string = "";
  lastName: string = "";
  email: string = "";

  apps!: ISerializedApp[];

  scopes: ISerializedScope[] = [];

  createNewAppNameError: string = "";
  createNewAppUrlError: string = "";

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

      this.createNewAppForm.nativeElement.reset();
    }
  }

  setSection(section: string) {
    this.section = section;

    this.router.navigateByUrl(`account/settings/${section}`);
  }

  async createNewAppFormOnSubmit(e: Event, name: string, url: string, scopes: HTMLCollection) {
    e.preventDefault();

    const submitButton = this.createNewAppForm.nativeElement.querySelector("button[type=submit]") as HTMLButtonElement;

    submitButton.disabled = true;

    this.createNewAppNameError = this.createNewAppUrlError = "";

    const response = await this.api.createApp({
      name: name.trim(),
      url: url.trim(),
      scopes: Array.from(scopes).map(scope => (scope as HTMLElement).innerText),
    });

    if (!response.result.valid)
    {
      this.createNewAppNameError = response.errors.name.error;

      this.createNewAppUrlError = response.errors.url.error;
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

    api.retrieveToken(AuthService.token as string).then(token =>
    {
      this.firstName = token.user.name.first;
      this.lastName = token.user.name.last;
      this.email = token.user.email;
    });

    api.listApps().then(apps => this.apps = apps);

    api.listScopes().then(scopes => this.scopes = scopes);
  }

  ngOnInit(): void {
  }

}
