import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { UiAvatar } from '../ui/ui-avatar';
import { UiButton } from '../ui/ui-button';
import { UiIcon } from '../ui/ui-icon';
import { UiLogo } from '../ui/ui-logo';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, UiAvatar, UiButton, UiIcon, UiLogo],
  templateUrl: './shell.html',
  styleUrl: './shell.scss'
})
export class Shell {
  protected readonly auth = inject(AuthService);

  logout(): void {
    void this.auth.logout();
  }
}
