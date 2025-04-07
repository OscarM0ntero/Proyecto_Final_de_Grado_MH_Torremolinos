import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-img-vertical',
  standalone: false,
  templateUrl: './img-vertical.component.html',
  styleUrls: ['./img-vertical.component.scss']
})
export class ImgVerticalComponent {
  @Input() titulo: string = '';
  @Input() texto: string = '';
  @Input() imagen: string = '';
}
