import { Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { InputComponent } from './input/input.component';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent
{
  @Input("config")
  config!: FormConfig;

  @ViewChild("form")
  form!: ElementRef<HTMLFormElement>;

  @ViewChildren(InputComponent)
  inputs!: QueryList<InputComponent>;

  constructor()
  {}

  getDefaultInputs(): FormInput[]
  {
    return this.getGroup("default")!.inputs;
  }

  public getGroup(name: string): FormGroup | undefined
  {
    return this
      .config
      .options
      .groups
      .find(group => group.name === name);
  }

  public getNonDefaultGroups(): FormGroup[]
  {
    return this
      .config
      .options
      .groups
      .filter(group => group.name !== "default");
  }

  public getInput(name: string): FormInput | undefined
  {
    return this
      .config
      .options
      .groups
      .map(group => group.inputs)
      .flat()
      .find(input => input.name === name);
  }

  async onSubmit(e: Event)
  {
    e.preventDefault();

    this
      .config
      .options
      .groups
      .map(group => group.inputs)
      .flat()
      .forEach(input => input.error = "");

    const form = e.target as HTMLFormElement;

    const submitButton = form.querySelector("button[type=submit]") as HTMLButtonElement;

    submitButton.disabled = true;

    const callback = (options: FormOptions) =>
    {
      submitButton.disabled = false;

      this.config.options = options;
    }

    const data: { [ key: string ]: any } = {};

    this.inputs.forEach(input =>
    {
      switch (input.options.type)
      {
        case "date":
        {
          // TODO

          break;
        }
        case "select":
        {
          // TODO

          break;
        }
        default:
        {
          data[input.options.name] = input.options.value;

          break;
        }
      }
    });

    this.config.onSubmit(data, this.config.options, callback);
  }

  public show(): void
  {
    this.config.options.hidden = false;
  }

  public showModal(): void
  {
    const dialog = document.createElement("dialog");

    dialog.setAttribute("data-form", this.config.options.name);

    dialog.appendChild(this.form.nativeElement);

    document.body.appendChild(dialog);

    dialog.showModal();
  }

  public hide(): void
  {
    this.config.options.hidden = true;

    document.querySelector(`dialog[data-form="${this.config.options.name}"]`)?.remove();
  }

  public reset(): void
  {
    this.form.nativeElement.reset();

    this.inputs.forEach(input => input.reset());
  }

  public cancel()
  {
    this.hide();

    this.reset();
  }
}

export interface FormConfig
{
  options: FormOptions;
  onSubmit: (data: { [ key: string ]: any }, options: FormOptions, end: (options: FormOptions) => void) => void;
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

export interface ITextFormInput
{
  type: "text" | "email" | "password" | "url",
  label: string,
  name: string,
  required: boolean,

  autocomplete?: string,
  value?: string,
  error?: string,
}

export interface IDateFormInput
{
  type: "date",
  label: string,
  name: string,
  required: boolean,

  autocomplete?: string,
  value?: Date,
  error?: string,
}

export interface ISelectFormInput
{
  type: "select",
  label: string,
  name: string,
  required: boolean,

  error?: string,

  options?: {
    multiple?: boolean,
  },

  selectOptions?: {
    value: string,
  }[],

  selectedValues?: string[],
}

export type FormInput = ITextFormInput | IDateFormInput | ISelectFormInput;