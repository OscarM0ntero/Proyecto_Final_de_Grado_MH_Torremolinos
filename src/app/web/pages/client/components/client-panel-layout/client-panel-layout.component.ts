import { Component, ViewEncapsulation } from '@angular/core';
import { AuthService } from '../../../../../services/auth.service';
import { LogoutConfirmDialogComponent } from '../../dialogs/logout-confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-client-panel-layout',
  standalone: false,
  templateUrl: './client-panel-layout.component.html',
  styleUrl: './client-panel-layout.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ClientPanelLayoutComponent {
  constructor(private dialog: MatDialog, private auth: AuthService) { }

  logout() {
    const dialogRef = this.dialog.open(LogoutConfirmDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.auth.logout();
      }
    });
  }
}
