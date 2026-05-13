import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  const isAuthRoute = req.url.includes('/auth/');

  const withAuth = (token: string | null) =>
    token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  const authed = withAuth(auth.accessToken());

  return next(authed).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401 || isAuthRoute) {
        return throwError(() => err);
      }

      return from(auth.tryRefresh()).pipe(
        switchMap((ok) => {
          if (!ok) return throwError(() => err);
          return next(withAuth(auth.accessToken()));
        })
      );
    })
  );
};
