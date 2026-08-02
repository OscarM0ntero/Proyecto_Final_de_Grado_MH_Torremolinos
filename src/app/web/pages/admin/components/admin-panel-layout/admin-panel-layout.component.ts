import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../../../services/auth.service';
import { LogoutConfirmDialogComponent } from '../../../../shared/logout-confirm-dialog.component';

@Component({
  selector: 'app-admin-panel-layout',
  standalone: false,
  templateUrl: './admin-panel-layout.component.html',
  styleUrl: './admin-panel-layout.component.scss'
})
export class AdminPanelLayoutComponent {
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
