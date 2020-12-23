import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormInput } from '../form.component';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements AfterViewInit
{
  @Input("options")
  options!: FormInput;

  @ViewChild("input")
  input?: ElementRef<HTMLInputElement>;

  set(event: Event)
  {
    switch (this.options.type)
    {
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

    switch (this.options.type)
    {
      case "date":
        this.input.nativeElement.valueAsDate = this.options.value ?? null;
        break;
      case "select":
        // TODO
        break;
      default:
        this.input.nativeElement.value = this.options.value ?? "";
        break;
    }
  }

  constructor()
  {}

  ngAfterViewInit(): void
  {
    this.reset();
  }
}
