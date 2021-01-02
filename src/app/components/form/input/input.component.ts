import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormInput, ITextFormInput } from '../form.component';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements AfterViewInit
{
  private _options?: FormInput;

  @Input("options")
  options!: FormInput;

  @ViewChild("input")
  input?: ElementRef<HTMLInputElement>;

  constructor()
  {}

  ngAfterViewInit(): void
  {
    // Clone options object to keep its default values to be used in reset()
    this._options = Object.assign({}, this.options);

    this.reset();
  }

  set(event: Event)
  {
    switch (this.options.type)
    {
      case "date":
        this.options.value = (event.composedPath()[0] as HTMLInputElement).valueAsDate ?? undefined;
        break;
      case "select":
        this.options.selectedValues = Array.from((event.target as HTMLSelectElement).selectedOptions).map(opt => opt.value);
        break;
      default:
        this.options.value = (event.composedPath()[0] as HTMLInputElement).value;
        break;
    }
  }

  public reset()
  {
    if (!this.input) return;

    switch (this._options?.type)
    {
      case "date":
        this.input.nativeElement.valueAsDate = this._options?.value ?? null;
        break;
      default:
        this.input.nativeElement.value = (this._options as ITextFormInput | undefined)?.value ?? "";
        break;
    }
  }
}
