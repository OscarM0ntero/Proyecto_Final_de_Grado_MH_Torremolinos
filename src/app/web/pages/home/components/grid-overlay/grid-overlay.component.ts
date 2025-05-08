import { Component } from '@angular/core';

@Component({
  selector: 'app-grid-overlay',
  standalone: false,
  templateUrl: './grid-overlay.component.html',
  styleUrls: ['./grid-overlay.component.scss']
})
export class GridOverlayComponent {
  columns = 26;
  rows = 24;
  totalCells = this.columns * this.rows;

  cells = Array.from({ length: this.totalCells });

}
