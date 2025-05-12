import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { User } from '../models/user'; // Importar la interfaz User correcta desde tu modelo

describe('UserService', () => {
  let service: UserService;
  let httpTestingController: HttpTestingController;
  
  // Datos de prueba basados en el archivo users.json proporcionado
  const mockUsers: User[] = [
    {
      id: 1,
      email: 'admin@example.com',
      username: 'admin',
      password: 'admin123',
      isActive: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    },
    {
      id: 2,
      email: 'user@example.com',
      username: 'user',
      password: 'user123',
      isActive: true,
      createdAt: '2023-01-02T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z'
    }
  ];

  beforeEach(() => {
    // Configuración del módulo de testing con los nuevos providers
    TestBed.configureTestingModule({
      providers: [
        UserService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    
    // Inyección del servicio y el controlador HTTP
    service = TestBed.inject(UserService);
    httpTestingController = TestBed.inject(HttpTestingController);
    
    // Responder a la solicitud inicial de carga que ocurre en el constructor
    const req = httpTestingController.expectOne('assets/data/users.json');
    req.flush({ users: mockUsers });
  });

  // Verificar que no haya solicitudes pendientes después de cada prueba
  afterEach(() => {
    httpTestingController.verify();
  });

  // Test básico para verificar que el servicio se crea correctamente
  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  //1. Tests para authenticateUser
  describe('authenticateUser', () => {
    //1.1 debería autenticar a un usuario con credenciales válidas
    it('debería autenticar a un usuario con credenciales válidas', () => {
      // Preparación
      const email = 'admin@example.com';
      const password = 'admin123';
      let result: User | null = null;
      
      // Ejecución
      service.authenticateUser(email, password).subscribe(user => {
        // Usar cast de tipo para asegurar que TypeScript reconozca el tipo
        result = user as User;
      });
      
      // Interceptar la petición HTTP
      const req = httpTestingController.expectOne('assets/data/users.json');
      expect(req.request.method).toBe('GET');
      req.flush({ users: mockUsers });
      
      // Verificación
      expect(result).not.toBeNull();
      expect(result!.id).toBe(1);
      expect(result!.email).toBe(email);
    });

    //1.2 debería devolver null para credenciales inválidas
    it('debería devolver null para credenciales inválidas', () => {
      // Preparación
      const email = 'admin@example.com';
      const password = 'contraseñaIncorrecta';
      let result: User | null = null;
      
      // Ejecución
      service.authenticateUser(email, password).subscribe(user => {
        result = user;
      });
      
      // Interceptar la petición HTTP
      const req = httpTestingController.expectOne('assets/data/users.json');
      expect(req.request.method).toBe('GET');
      req.flush({ users: mockUsers });
      
      // Verificación
      expect(result).toBeNull();
    });

    //1.3 debería devolver null para un usuario inactivo
    it('debería devolver null para un usuario inactivo', () => {
      // Preparación
      const inactiveUser: User = {
        ...mockUsers[0],
        id: 3,
        email: 'inactive@example.com',
        isActive: false
      };
      
      const testUsers = [...mockUsers, inactiveUser];
      let result: User | null = null;
      
      // Ejecución
      service.authenticateUser('inactive@example.com', 'admin123').subscribe(user => {
        result = user;
      });
      
      // Interceptar la petición HTTP
      const req = httpTestingController.expectOne('assets/data/users.json');
      expect(req.request.method).toBe('GET');
      req.flush({ users: testUsers });
      
      // Verificación
      expect(result).toBeNull();
    });
  });

  //2. Tests para getUserByEmail
  describe('getUserByEmail', () => {
    //2.1 debería encontrar un usuario por email
    it('debería encontrar un usuario por email', () => {
      // Preparación
      const email = 'user@example.com';
      let result: User | null = null;
      
      // Ejecución
      service.getUserByEmail(email).subscribe(user => {
        result = user as User;
      });
      
      // Interceptar la petición HTTP
      const req = httpTestingController.expectOne('assets/data/users.json');
      expect(req.request.method).toBe('GET');
      req.flush({ users: mockUsers });
      
      // Verificación
      expect(result).not.toBeNull();
      expect(result!.id).toBe(2);
      expect(result!.email).toBe(email);
    });
    //2.2 debería devolver null para un email inexistente
    it('debería devolver null para un email inexistente', () => {
      // Preparación
      const email = 'noexiste@example.com';
      let result: User | null = null;
      
      // Ejecución
      service.getUserByEmail(email).subscribe(user => {
        result = user;
      });
      
      // Interceptar la petición HTTP
      const req = httpTestingController.expectOne('assets/data/users.json');
      expect(req.request.method).toBe('GET');
      req.flush({ users: mockUsers });
      
      // Verificación
      expect(result).toBeNull();
    });
  });

  
  //3. Tests para createUser
  describe('createUser', () => {
    //3.1 debería crear un nuevo usuario con ID automático
    it('debería crear un nuevo usuario con ID automático', () => {
      // Preparación
      const newUser = {
        email: 'nuevo@example.com',
        username: 'nuevo',
        password: 'nuevo123',
        isActive: true
      };
      
      let result: User | null = null;
      
      // Mock de fecha para testing predecible
      jasmine.clock().install();
      const baseTime = new Date(2023, 3, 15);
      jasmine.clock().mockDate(baseTime);
      
      // Ejecución
      service.createUser(newUser).subscribe(user => {
        result = user;
      });
      
      // Interceptar la petición HTTP
      const req = httpTestingController.expectOne('assets/data/users.json');
      expect(req.request.method).toBe('GET');
      req.flush({ users: mockUsers });
      
      // Verificación
      expect(result).not.toBeNull();
      expect(result!.id).toBe(3); // siguiente ID después del 2
      expect(result!.email).toBe('nuevo@example.com');
      expect(result!.username).toBe('nuevo');
      expect(result!.createdAt).toBeTruthy();
      expect(result!.updatedAt).toBeTruthy();
      
      jasmine.clock().uninstall();
    });

    //3.2 debería arrojar error si el email ya existe
    it('debería arrojar error si el email ya existe', (done) => {
      // Preparación
      const duplicateUser = {
        email: 'admin@example.com', // email que ya existe
        username: 'duplicate',
        password: 'duplicate123',
        isActive: true
      };
      
      // Ejecución
      service.createUser(duplicateUser).subscribe({
        next: () => {
          fail('Debería haber lanzado un error');
          done();
        },
        error: (error: Error) => {
          // Verificación
          expect(error instanceof Error).toBeTrue();
          expect(error.message).toEqual('El correo electrónico ya está registrado');
          done();
        }
      });
      
      // Interceptar la petición HTTP
      const req = httpTestingController.expectOne('assets/data/users.json');
      expect(req.request.method).toBe('GET');
      req.flush({ users: mockUsers });
    });
  });

  //4. Tests para updateUser
  describe('updateUser', () => {
    //4.1 debería actualizar los datos de un usuario existente
    it('debería actualizar los datos de un usuario existente', () => {
      // Preparación
      const userId = 2;
      const updates = {
        username: 'usuarioActualizado',
        isActive: false
      };
      
      let result: User | null = null;
      
      // Ejecución
      service.updateUser(userId, updates).subscribe(user => {
        result = user;
      });
      
      // Interceptar la petición HTTP
      const req = httpTestingController.expectOne('assets/data/users.json');
      expect(req.request.method).toBe('GET');
      req.flush({ users: mockUsers });
      
      // Verificación - usamos el operador ! (non-null assertion) después de comprobar que no es null
      expect(result).not.toBeNull();
      expect(result!.id).toBe(userId);
      expect(result!.username).toBe('usuarioActualizado');
      expect(result!.isActive).toBe(false);
      expect(result!.email).toBe('user@example.com'); // No debería cambiar
      //expect(new Date(result!.updatedAt)).toBeGreaterThan(new Date(mockUsers[1].updatedAt).toDateString);
    });

    //4.2 debería arrojar error si el usuario no existe
    it('debería arrojar error si el usuario no existe', (done) => {
      // Preparación
      const userId = 999; // ID que no existe
      const updates = {
        username: 'noExiste'
      };
      
      // Ejecución
      service.updateUser(userId, updates).subscribe({
        next: () => {
          fail('Debería haber lanzado un error');
          done();
        },
        error: (error: Error) => {
          // Verificación
          expect(error instanceof Error).toBeTrue();
          expect(error.message).toEqual('Usuario no encontrado');
          done();
        }
      });
      
      // Interceptar la petición HTTP
      const req = httpTestingController.expectOne('assets/data/users.json');
      expect(req.request.method).toBe('GET');
      req.flush({ users: mockUsers });
    });
  });

  //5. Tests para changePassword
  describe('changePassword', () => {
    //5.1 debería cambiar la contraseña si la contraseña actual es correcta
    it('debería cambiar la contraseña si la contraseña actual es correcta', () => {
      // Preparación
      const userId = 1;
      const oldPassword = 'admin123';
      const newPassword = 'nueva123';
      
      let result: User | null = null;
      
      // Ejecución
      service.changePassword(userId, oldPassword, newPassword).subscribe(user => {
        result = user;
      });
      
      // Interceptar la petición HTTP
      const req = httpTestingController.expectOne('assets/data/users.json');
      expect(req.request.method).toBe('GET');
      req.flush({ users: mockUsers });
      
      // Verificación - usando el operador non-null assertion (!) después de comprobar que no es null
      expect(result).not.toBeNull();
      expect(result!.id).toBe(userId);
      expect(result!.password).toBe(newPassword);
      //expect(new Date(result!.updatedAt)).toBeGreaterThan(new Date(mockUsers[0].updatedAt));
    });

    //5.2 debería arrojar error si la contraseña actual es incorrecta
    it('debería arrojar error si la contraseña actual es incorrecta', (done) => {
      // Preparación
      const userId = 1;
      const oldPassword = 'contraseñaIncorrecta';
      const newPassword = 'nueva123';
      
      // Ejecución
      service.changePassword(userId, oldPassword, newPassword).subscribe({
        next: () => {
          fail('Debería haber lanzado un error');
          done();
        },
        error: (error: Error) => {
          // Verificación
          expect(error instanceof Error).toBeTrue();
          expect(error.message).toEqual('Contraseña actual incorrecta');
          done();
        }
      });
      
      // Interceptar la petición HTTP
      const req = httpTestingController.expectOne('assets/data/users.json');
      expect(req.request.method).toBe('GET');
      req.flush({ users: mockUsers });
    });

    //5.3 debería arrojar error si el usuario no existe
    it('debería arrojar error si el usuario no existe', (done) => {
      // Preparación
      const userId = 999; // ID que no existe
      const oldPassword = 'admin123';
      const newPassword = 'nueva123';
      
      // Ejecución
      service.changePassword(userId, oldPassword, newPassword).subscribe({
        next: () => {
          fail('Debería haber lanzado un error');
          done();
        },
        error: (error: Error) => {
          // Verificación
          expect(error instanceof Error).toBeTrue();
          expect(error.message).toEqual('Usuario no encontrado');
          done();
        }
      });
      
      // Interceptar la petición HTTP
      const req = httpTestingController.expectOne('assets/data/users.json');
      expect(req.request.method).toBe('GET');
      req.flush({ users: mockUsers });
    });
  });
});