import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {

  @Input("inputs")
  inputs: FormInputs = {};

  @Output() formSubmit = new EventEmitter<HTMLFormElement>();

  getInputs(): FormInput[]
  {
    return Object.values(this.inputs);
  }

  set(input: FormInput, event: Event)
  {
    this.getInputs().find(i => i.name === input.name)!.value = (event.composedPath()[0] as HTMLInputElement).value;
  }

  async onSubmit(e: Event)
  {
    e.preventDefault();

    this.getInputs().forEach(input => input.error = "");

    this.formSubmit.emit(e.target as HTMLFormElement);
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
