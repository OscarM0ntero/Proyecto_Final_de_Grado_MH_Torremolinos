import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-img-horizontal',
  standalone: false,
  templateUrl: './img-horizontal.component.html',
  styleUrls: ['./img-horizontal.component.scss']
})
export class ImgHorizontalComponent {
  @Input() titulo: string = '';
  @Input() texto: string = '';
  @Input() imagen: string = '';
}
