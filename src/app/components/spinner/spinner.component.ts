import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements AfterViewInit
{
  @Input()
  fill: boolean = false;

  @ViewChild("element")
  element?: ElementRef<HTMLDivElement>;

  constructor()
  {}

  ngAfterViewInit(): void
  {
    if (this.fill)
    {
      this.element?.nativeElement.parentElement!.classList.add("fill");
    }
  }
}
