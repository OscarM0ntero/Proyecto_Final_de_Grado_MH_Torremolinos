import { Component, Input } from '@angular/core';

@Component({
  selector: 'img-text',
  standalone: false,
  templateUrl: './img-text.component.html',
  styleUrls: ['./img-text.component.scss']
})
export class ImgTextComponent {
  @Input() titulo: string = '';
  @Input() texto: string = '';
  @Input() imagen: string = '';
  @Input() horizontal: boolean = false;
  @Input() imgRight: boolean = true;
}
