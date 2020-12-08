import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

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

  @ViewChild("form")
  form!: ElementRef<HTMLFormElement>;

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

  public show(): void
  {
    this.options.hidden = false;
  }

  public showModal(): void
  {
    const dialog = document.createElement("dialog");

    dialog.setAttribute("data-form", this.options.name);

    dialog.appendChild(this.form.nativeElement);

    document.body.appendChild(dialog);

    dialog.showModal();
  }

  public hide(): void
  {
    this.options.hidden = true;

    document.querySelector(`dialog[data-form=${this.options.name}]`)?.remove();
  }

  public remove(): void
  {
    this.hide();

    // TODO: Remove element
  }

  public reset(): void
  {
    this.form.nativeElement.reset();
  }

  async cancel()
  {
    this.hide();

    this.reset();
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
  /**
   * @default false
   */
  hidden?: boolean,
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
