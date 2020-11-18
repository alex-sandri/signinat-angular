import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {

  @Input("inputs")
  inputs: FormInput[] = [];

  @Input("submit")
  submit: (inputs: FormInput[]) => Promise<void> = async () => {};

  set(input: FormInput, event: Event)
  {
    this.inputs.find(i => i.name === input.name)!.value = (event.composedPath()[0] as HTMLInputElement).value;
  }

  async onSubmit(e: Event, form: HTMLFormElement)
  {
    e.preventDefault();

    const submitButton = form.querySelector("button[type=submit]") as HTMLButtonElement;

    submitButton.disabled = true;

    await this.submit(this.inputs);

    submitButton.disabled = false;
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

  value?: string,
  error?: string,
}
