import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  @ViewChild("createNewAppDialog") createNewAppDialog!: ElementRef<HTMLDialogElement>;
  @ViewChild("createNewAppForm") createNewAppForm!: ElementRef<HTMLFormElement>;

  section: "profile" | "developer" = "profile";

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

  createNewAppFormOnSubmit(e: Event, name: string, url: string) {
    e.preventDefault();

    console.log(name, url);
  }

  constructor() { }

  ngOnInit(): void {
  }

}
