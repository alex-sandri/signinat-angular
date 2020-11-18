import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {

  @Input("inputs")
  inputs: FormInputs = {};

  @Input("submit")
  submit: () => Promise<boolean> = async () => { return true; };

  getInputs(): FormInput[]
  {
    return Object.values(this.inputs);
  }

  set(input: FormInput, event: Event)
  {
    this.getInputs().find(i => i.name === input.name)!.value = (event.composedPath()[0] as HTMLInputElement).value;
  }

  async onSubmit(e: Event, form: HTMLFormElement)
  {
    e.preventDefault();

    const submitButton = form.querySelector("button[type=submit]") as HTMLButtonElement;

    submitButton.disabled = true;

    this.getInputs().forEach(input => input.error = "");

    if (await this.submit())
    {
      form.reset();
    }

    submitButton.disabled = false;
  }

  constructor() { }

  ngOnInit(): void {
  }

}

export interface FormInputs
{
  [key: string]: FormInput,
}

export interface FormInput
{
  label: string,
  name: string,
  type: "text" | "email" | "password" | "date",
  required: boolean,
  autocomplete: string,

  value?: string,
  error?: string,
}
