import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ISerializedApp } from 'api/src/models/App';
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

  section: "profile" | "developer" = "profile";

  firstName: string = "";
  lastName: string = "";
  email: string = "";

  apps: ISerializedApp[] = [];

  createNewAppNameError: string = "";
  createNewAppUrlError: string = "";

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

  async createNewAppFormOnSubmit(e: Event, name: string, url: string) {
    e.preventDefault();

    const submitButton = this.createNewAppForm.nativeElement.querySelector("button[type=submit]") as HTMLButtonElement;

    submitButton.disabled = true;

    this.createNewAppNameError = this.createNewAppUrlError = "";

    const response = await this.api.createApp({
      name: name.trim(),
      url: url.trim(),
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

  constructor(authService: AuthService, private api: ApiService) {
    if (authService.isSignedIn())
    {
      api.retrieveSession(authService.sessionId as string).then(session =>
      {
        this.firstName = session.user.name.first;
        this.lastName = session.user.name.last;
        this.email = session.user.email;
      });
    }
  }

  ngOnInit(): void {
    this.api.listApps().then(apps => this.apps = apps);
  }

}
