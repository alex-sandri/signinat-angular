import { Component, Input, OnInit } from '@angular/core';
import { FormInput } from '../form.component';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements OnInit {

  @Input("options")
  options!: FormInput;

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

  constructor()
  {}

  ngOnInit(): void
  {}
}
