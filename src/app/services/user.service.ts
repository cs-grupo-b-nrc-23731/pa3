import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersUrl = 'assets/data/users.json';
  private users: User[] = [];

  constructor(private http: HttpClient) {
    // Cargar los usuarios del JSON al iniciar el servicio
    this.loadUsers().subscribe(users => {
      this.users = users;
    });
  }

  // Método para cargar usuarios del JSON
  loadUsers(): Observable<User[]> {
    return this.http.get<{users: User[]}>(this.usersUrl).pipe(
      map(response => response.users),
      catchError(error => {
        console.error('Error al cargar usuarios:', error);
        return throwError(() => new Error('Error al cargar usuarios. Por favor, inténtalo más tarde.'));
      })
    );
  }

  // Autenticar usuario
  authenticateUser(email: string, password: string): Observable<User | null> {
    // En una aplicación real, la autenticación se realizaría en el servidor
    return this.loadUsers().pipe(
      map(users => {
        const user = users.find(u => u.email === email && u.password === password && u.isActive);
        return user || null;
      })
    );
  }

  // Obtener usuario por email
  getUserByEmail(email: string): Observable<User | null> {
    return this.loadUsers().pipe(
      map(users => {
        const user = users.find(u => u.email === email);
        return user || null;
      })
    );
  }

  // Crear nuevo usuario
  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Observable<User> {
    return this.loadUsers().pipe(
      map(users => {
        // Verificar si el email ya existe
        const existingUser = users.find(u => u.email === user.email);
        if (existingUser) {
          throw new Error('El correo electrónico ya está registrado');
        }

        // Crear nuevo usuario
        const newUser: User = {
          ...user,
          id: this.getNextId(users),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // En una aplicación real, aquí se guardaría en el servidor
        // Para este ejemplo, simulamos la adición al array local
        this.users = [...users, newUser];
        
        return newUser;
      })
    );
  }

  // Actualizar usuario
  updateUser(id: number, updates: Partial<User>): Observable<User> {
    return this.loadUsers().pipe(
      map(users => {
        const userIndex = users.findIndex(u => u.id === id);
        if (userIndex === -1) {
          throw new Error('Usuario no encontrado');
        }

        // Actualizar usuario
        const updatedUser: User = {
          ...users[userIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };

        // En una aplicación real, aquí se guardaría en el servidor
        // Para este ejemplo, actualizamos el array local
        this.users = [
          ...users.slice(0, userIndex),
          updatedUser,
          ...users.slice(userIndex + 1)
        ];

        return updatedUser;
      })
    );
  }

  // Cambiar contraseña
  changePassword(id: number, oldPassword: string, newPassword: string): Observable<User> {
    return this.loadUsers().pipe(
      map(users => {
        const userIndex = users.findIndex(u => u.id === id);
        if (userIndex === -1) {
          throw new Error('Usuario no encontrado');
        }

        const user = users[userIndex];
        
        // Verificar contraseña actual
        if (user.password !== oldPassword) {
          throw new Error('Contraseña actual incorrecta');
        }

        // Actualizar contraseña
        const updatedUser: User = {
          ...user,
          password: newPassword,
          updatedAt: new Date().toISOString()
        };

        // En una aplicación real, aquí se guardaría en el servidor
        // Para este ejemplo, actualizamos el array local
        this.users = [
          ...users.slice(0, userIndex),
          updatedUser,
          ...users.slice(userIndex + 1)
        ];

        return updatedUser;
      })
    );
  }

  // Activar/Desactivar usuario
  toggleUserActive(id: number): Observable<User> {
    return this.loadUsers().pipe(
      map(users => {
        const userIndex = users.findIndex(u => u.id === id);
        if (userIndex === -1) {
          throw new Error('Usuario no encontrado');
        }

        const user = users[userIndex];
        
        // Cambiar estado de activación
        const updatedUser: User = {
          ...user,
          isActive: !user.isActive,
          updatedAt: new Date().toISOString()
        };

        // En una aplicación real, aquí se guardaría en el servidor
        // Para este ejemplo, actualizamos el array local
        this.users = [
          ...users.slice(0, userIndex),
          updatedUser,
          ...users.slice(userIndex + 1)
        ];

        return updatedUser;
      })
    );
  }

  // Método auxiliar para obtener el siguiente ID
  private getNextId(users: User[]): number {
    return users.length > 0 
      ? Math.max(...users.map(user => user.id)) + 1 
      : 1;
  }
}