import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { UserService } from './user.service';
import { User } from '../models/user';

describe('UserService', () => {
  let service: UserService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;

  const mockUserData = {
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

  beforeEach(() => {
    // Crear espía para HttpClient
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    
    // Configurar respuesta por defecto
    httpClientSpy.get.and.returnValue(of(mockUserData));

    // Configurar el módulo de pruebas
    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: HttpClient, useValue: httpClientSpy }
      ]
    });
    
    // Obtener instancia del servicio
    service = TestBed.inject(UserService);
    
    // Limpiar el contador de llamadas después de la inicialización
    httpClientSpy.get.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Prueba 1: Carga correcta de usuarios
  it('should load users from JSON file', () => {
    // Configurar respuesta específica para esta prueba
    httpClientSpy.get.and.returnValue(of(mockUserData));

    service.loadUsers().subscribe(users => {
      expect(users.length).toBe(1);
      expect(users[0].email).toBe('test@example.com');
    });

    // Verificar que se llamó con la URL correcta
    expect(httpClientSpy.get).toHaveBeenCalledWith('assets/data/users.json');
    // No verificamos la cantidad de llamadas, solo que se haya llamado con los parámetros correctos
  });

  // Prueba 2: Autenticación exitosa
  it('should authenticate user with correct credentials', () => {
    httpClientSpy.get.and.returnValue(of(mockUserData));

    service.authenticateUser('test@example.com', 'password123').subscribe(user => {
      expect(user).not.toBeNull();
      expect(user?.email).toBe('test@example.com');
    });

    expect(httpClientSpy.get).toHaveBeenCalledWith('assets/data/users.json');
  });

  // Prueba 3: Autenticación fallida
  it('should fail authentication with incorrect credentials', () => {
    httpClientSpy.get.and.returnValue(of(mockUserData));

    service.authenticateUser('test@example.com', 'wrongpassword').subscribe(user => {
      expect(user).toBeNull();
    });

    expect(httpClientSpy.get).toHaveBeenCalledWith('assets/data/users.json');
  });

  // Prueba 4: Obtener usuario por email
  it('should get user by email', () => {
    httpClientSpy.get.and.returnValue(of(mockUserData));

    service.getUserByEmail('test@example.com').subscribe(user => {
      expect(user).not.toBeNull();
      expect(user?.email).toBe('test@example.com');
    });

    expect(httpClientSpy.get).toHaveBeenCalledWith('assets/data/users.json');
  });

  // Prueba 5: Crear nuevo usuario
  it('should create a new user', () => {
    const newUser = {
      email: 'new@example.com',
      username: 'newuser',
      password: 'newpassword',
      isActive: true
    };

    httpClientSpy.get.and.returnValue(of(mockUserData));

    service.createUser(newUser).subscribe(user => {
      expect(user).not.toBeNull();
      expect(user.id).toBe(2);
      expect(user.email).toBe('new@example.com');
    });

    expect(httpClientSpy.get).toHaveBeenCalledWith('assets/data/users.json');
  });

  // Prueba 6: Error al crear usuario con email existente
  it('should throw error when creating user with existing email', () => {
    const existingUser = {
      email: 'test@example.com', // Email ya existente
      username: 'newuser',
      password: 'newpassword',
      isActive: true
    };

    httpClientSpy.get.and.returnValue(of(mockUserData));

    service.createUser(existingUser).subscribe({
      next: () => fail('Should have failed with email already exists'),
      error: (error) => {
        expect(error.message).toBe('El correo electrónico ya está registrado');
      }
    });

    expect(httpClientSpy.get).toHaveBeenCalledWith('assets/data/users.json');
  });

  // Prueba 7: Actualizar contraseña de usuario
  it('should update user password', () => {
    // Modificar los datos para esta prueba específica
    const passwordTestData = {
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

    httpClientSpy.get.and.returnValue(of(passwordTestData));

    service.changePassword(1, 'oldpassword', 'newpassword').subscribe(user => {
      expect(user).not.toBeNull();
      expect(user.password).toBe('newpassword');
    });

    expect(httpClientSpy.get).toHaveBeenCalledWith('assets/data/users.json');
  });

  // Prueba 8: Activar/desactivar usuario
  it('should toggle user active status', () => {
    httpClientSpy.get.and.returnValue(of(mockUserData));

    service.toggleUserActive(1).subscribe(user => {
      expect(user).not.toBeNull();
      expect(user.isActive).toBe(false);
    });

    expect(httpClientSpy.get).toHaveBeenCalledWith('assets/data/users.json');
  });
});