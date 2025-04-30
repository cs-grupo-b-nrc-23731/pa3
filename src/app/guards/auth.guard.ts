import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}
  
  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Verificar si hay un usuario en localStorage
    const userJson = localStorage.getItem('currentUser');
    
    if (userJson) {
      return true;
    }
    
    // Redirigir al login si no hay usuario autenticado
    this.router.navigate(['/login']);
    return false;
  }
}