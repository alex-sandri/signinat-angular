import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {

  @Input("inputs")
  inputs: FormInput[] = [];

  values: {
    [key: string]: string,
  } = {};

  set(input: string, e: Event)
  {
    console.log(e.type);
    this.values[input];
  }

  onSubmit(e: Event, form: HTMLFormElement)
  {
    e.preventDefault();
  }

  constructor() { }

  ngOnInit(): void {
  }

}

export interface FormInput
{
  label: string,
  name: string,
  type: "text" | "email" | "password" | "date",
  required: boolean,
  autocomplete: string,
  error: string,
}
