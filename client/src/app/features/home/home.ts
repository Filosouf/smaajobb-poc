import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.html'
})
export class HomePage {
  protected readonly auth = inject(AuthService);

  logout(): void {
    void this.auth.logout();
  }
}
