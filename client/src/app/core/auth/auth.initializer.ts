import { inject } from '@angular/core';
import { AuthService } from './auth.service';

/**
 * Kjører ved app-oppstart: forsøker silent refresh hvis cookie finnes.
 * Mislykkes stille — bruker blir bare ikke logget inn.
 */
export const authInitializer = async (): Promise<void> => {
  const auth = inject(AuthService);
  await auth.tryRefresh();
};
