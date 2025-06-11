import { Directive, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appUppercase]',
  standalone: true,
})
export class UppercaseDirective {
  control = inject(NgControl);

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    this.control.control?.setValue(value.toUpperCase(), { emitEvent: false });
  }
}
