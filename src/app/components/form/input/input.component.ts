import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormInput } from '../form.component';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements OnInit {

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

  // TODO
  // Reset 'select' element
  public reset()
  {
    if (!this.input) return;

    this.input.nativeElement.value = this.options.value ?? "";
  }

  constructor()
  {}

  ngOnInit(): void
  {}
}
