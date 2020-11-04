import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  @ViewChild("createNewAppDialog") createNewAppDialog!: ElementRef<HTMLDialogElement>;
  @ViewChild("createNewAppForm") createNewAppForm!: ElementRef<HTMLFormElement>;

  section: "profile" | "developer" = "profile";

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

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.api.listApps().then(apps =>
    {
      apps.forEach(app =>
      {
        console.log(app);
      });
    });
  }

}
