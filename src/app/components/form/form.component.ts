import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {

  @Input("options")
  options!: FormOptions;

  @Output() formSubmit = new EventEmitter<HTMLFormElement>();

  getDefaultInputs(): FormInput[]
  {
    return this.options.getGroup("default")!.inputs;
  }

  set(input: FormInput, event: Event)
  {
    this.options.getInput(input.name)!.value = (event.composedPath()[0] as HTMLInputElement).value;
  }

  async onSubmit(e: Event)
  {
    e.preventDefault();

    this
      .options
      .groups
      .map(group => group.inputs)
      .flat()
      .forEach(input => input.error = "");

    this.formSubmit.emit(e.target as HTMLFormElement);
  }

  constructor() { }

  ngOnInit(): void {
  }

}

export class FormOptions
{
  constructor(public readonly groups: FormGroup[])
  {}

  public getGroup(name: string): FormGroup | null
  {
    return this
      .groups
      .find(group => group.name === name)
      ?? null;
  }

  public getNonDefaultGroups(): FormGroup[]
  {
    return this
      .groups
      .filter(group => group.name !== "default");
  }

  public getInput(name: string): FormInput | null
  {
    return this
      .groups
      .map(group => group.inputs)
      .flat()
      .find(input => input.name === name)
      ?? null;
  }
}

export interface FormGroup
{
  name: string,
  description?: {
    text: string,
    options?: {
      mark?: boolean,
    },
  },
  inputs: FormInput[],

  open?: boolean,
}

export interface FormInput
{
  label: string,
  name: string,
  type: "text" | "email" | "password" | "date" | "url" | "select",
  required: boolean,

  autocomplete?: string,
  value?: string,
  error?: string,

  options?: {
    multiple?: boolean, // Used with type `select`
  },

  // Used with type `select`
  selectOptions?: {
    value: string,
  }[],

  // Used with type `select`
  selectedValues?: string[]
}
