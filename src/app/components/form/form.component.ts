import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit
{
  @Input("options")
  options!: FormOptions;

  @Output()
  formSubmit = new EventEmitter<() => void>();

  @Output()
  formCancel = new EventEmitter<void>();

  getDefaultInputs(): FormInput[]
  {
    return this.getGroup("default")!.inputs;
  }

  public getGroup(name: string): FormGroup | null
  {
    return this
      .options
      .groups
      .find(group => group.name === name)
      ?? null;
  }

  public getNonDefaultGroups(): FormGroup[]
  {
    return this
      .options
      .groups
      .filter(group => group.name !== "default");
  }

  public getInput(name: string): FormInput | null
  {
    return this
      .options
      .groups
      .map(group => group.inputs)
      .flat()
      .find(input => input.name === name)
      ?? null;
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

    const form = e.target as HTMLFormElement;

    const submitButton = form.querySelector("button[type=submit]") as HTMLButtonElement;

    submitButton.disabled = true;

    const callback = () => submitButton.disabled = false;

    this.formSubmit.emit(callback);
  }

  async cancel()
  {
    this.formCancel.emit();
  }

  constructor()
  {}

  ngOnInit(): void
  {}
}

export interface FormOptions
{
  name: string,
  groups: FormGroup[],
  /**
   * @default "Submit"
   */
  submitButtonText?: string,
  /**
   * @default false
   */
  showCancelButton?: boolean,
}

export interface FormGroup
{
  name: string,
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
  selectedValues?: string[],
}
