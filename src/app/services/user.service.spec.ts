import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { UserService } from './user.service';
import { User } from '../models/user';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('UserService', () => {
  let service: UserService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    // Crear y configurar el espía primero
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    
    // Configurar el comportamiento por defecto
    httpClientSpy.get.and.returnValue(of({ users: [] }));
    
    // Luego crear el servicio
    service = new UserService(httpClientSpy);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Prueba 1: Carga correcta de usuarios
  it('should load users from JSON file', () => {
    const mockUsers = {
      users: [
        {
          id: 1,
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
          isActive: true,
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z'
        }
      ]
    };

    // Configurar la respuesta simulada del HttpClient
    httpClientSpy.get.and.returnValue(of(mockUsers));

    service.loadUsers().subscribe(users => {
      expect(users.length).toBe(1);
      expect(users[0].email).toBe('test@example.com');
    });

    // Verificar que el método get fue llamado con la URL correcta
    expect(httpClientSpy.get).toHaveBeenCalledWith('assets/data/users.json');
    expect(httpClientSpy.get).toHaveBeenCalledTimes(1);
  });

  // Prueba 2: Autenticación exitosa
  it('should authenticate user with correct credentials', () => {
    const mockUsers = {
      users: [
        {
          id: 1,
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
          isActive: true,
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z'
        }
      ]
    };

    httpClientSpy.get.and.returnValue(of(mockUsers));

    service.authenticateUser('test@example.com', 'password123').subscribe(user => {
      expect(user).not.toBeNull();
      expect(user?.email).toBe('test@example.com');
    });

    expect(httpClientSpy.get).toHaveBeenCalledWith('assets/data/users.json');
  });

  // Prueba 3: Autenticación fallida
  it('should fail authentication with incorrect credentials', () => {
    const mockUsers = {
      users: [
        {
          id: 1,
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
          isActive: true,
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z'
        }
      ]
    };

    httpClientSpy.get.and.returnValue(of(mockUsers));

    service.authenticateUser('test@example.com', 'wrongpassword').subscribe(user => {
      expect(user).toBeNull();
    });

    expect(httpClientSpy.get).toHaveBeenCalledWith('assets/data/users.json');
  });

  // Prueba 4: Obtener usuario por email
  it('should get user by email', () => {
    const mockUsers = {
      users: [
        {
          id: 1,
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
          isActive: true,
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z'
        }
      ]
    };

    httpClientSpy.get.and.returnValue(of(mockUsers));

    service.getUserByEmail('test@example.com').subscribe(user => {
      expect(user).not.toBeNull();
      expect(user?.email).toBe('test@example.com');
    });

    expect(httpClientSpy.get).toHaveBeenCalledWith('assets/data/users.json');
  });

  // Prueba 5: Crear nuevo usuario
  it('should create a new user', () => {
    const mockUsers = {
      users: [
        {
          id: 1,
          email: 'existing@example.com',
          username: 'existinguser',
          password: 'password123',
          isActive: true,
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z'
        }
      ]
    };

    const newUser = {
      email: 'new@example.com',
      username: 'newuser',
      password: 'newpassword',
      isActive: true
    };

    httpClientSpy.get.and.returnValue(of(mockUsers));

    service.createUser(newUser).subscribe(user => {
      expect(user).not.toBeNull();
      expect(user.id).toBe(2);
      expect(user.email).toBe('new@example.com');
    });

    expect(httpClientSpy.get).toHaveBeenCalledWith('assets/data/users.json');
  });

  // Prueba 6: Error al crear usuario con email existente
  it('should throw error when creating user with existing email', () => {
    const mockUsers = {
      users: [
        {
          id: 1,
          email: 'existing@example.com',
          username: 'existinguser',
          password: 'password123',
          isActive: true,
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z'
        }
      ]
    };

    const newUser = {
      email: 'existing@example.com',
      username: 'newuser',
      password: 'newpassword',
      isActive: true
    };

    httpClientSpy.get.and.returnValue(of(mockUsers));

    service.createUser(newUser).subscribe({
      next: () => fail('Should have failed with email already exists'),
      error: (error) => {
        expect(error.message).toBe('El correo electrónico ya está registrado');
      }
    });

    expect(httpClientSpy.get).toHaveBeenCalledWith('assets/data/users.json');
  });

  // Prueba 7: Actualizar contraseña de usuario
  it('should update user password', () => {
    const mockUsers = {
      users: [
        {
          id: 1,
          email: 'test@example.com',
          username: 'testuser',
          password: 'oldpassword',
          isActive: true,
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z'
        }
      ]
    };

    httpClientSpy.get.and.returnValue(of(mockUsers));

    service.changePassword(1, 'oldpassword', 'newpassword').subscribe(user => {
      expect(user).not.toBeNull();
      expect(user.password).toBe('newpassword');
    });

    expect(httpClientSpy.get).toHaveBeenCalledWith('assets/data/users.json');
  });

  // Prueba 8: Activar/desactivar usuario
  it('should toggle user active status', () => {
    const mockUsers = {
      users: [
        {
          id: 1,
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
          isActive: true,
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z'
        }
      ]
    };

    httpClientSpy.get.and.returnValue(of(mockUsers));

    service.toggleUserActive(1).subscribe(user => {
      expect(user).not.toBeNull();
      expect(user.isActive).toBe(false);
    });

    expect(httpClientSpy.get).toHaveBeenCalledWith('assets/data/users.json');
  });
});