import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { UserService } from '../../services/user.service';
import { of, throwError } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { User } from '../../models/user';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['authenticateUser']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule
      ],
      providers: [
        FormBuilder,
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Prueba 1: Formulario inválido cuando está vacío
  it('should have an invalid form when empty', () => {
    expect(component.loginForm.valid).toBeFalsy();
  });

  // Prueba 2: Validación de email requerido
  it('should validate email is required', () => {
    const email = component.loginForm.controls['email'];
    expect(email.valid).toBeFalsy();
    expect(email.errors?.['required']).toBeTruthy();
  });

  // Prueba 3: Validación de formato de email
  it('should validate email format', () => {
    const email = component.loginForm.controls['email'];
    email.setValue('test');
    expect(email.valid).toBeFalsy();
    expect(email.errors?.['email']).toBeTruthy();

    email.setValue('test@example.com');
    expect(email.valid).toBeTruthy();
  });

  // Prueba 4: Validación de contraseña requerida
  it('should validate password is required', () => {
    const password = component.loginForm.controls['password'];
    expect(password.valid).toBeFalsy();
    expect(password.errors?.['required']).toBeTruthy();
  });

  // Prueba 5: Formulario válido con datos correctos
  it('should have a valid form with correct data', () => {
    const email = component.loginForm.controls['email'];
    const password = component.loginForm.controls['password'];
    
    email.setValue('test@example.com');
    password.setValue('password123');
    
    expect(component.loginForm.valid).toBeTruthy();
  });

  // Prueba 6: Autenticación exitosa
  it('should navigate to main page on successful login', () => {
    const mockUser: User = {
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    userService.authenticateUser.and.returnValue(of(mockUser));
    
    component.loginForm.controls['email'].setValue('test@example.com');
    component.loginForm.controls['password'].setValue('password123');
    
    component.onSubmit();
    
    expect(userService.authenticateUser).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(router.navigate).toHaveBeenCalledWith(['/main']);
  });

  // Prueba 7: Autenticación fallida
  it('should show error message on failed login', () => {
    userService.authenticateUser.and.returnValue(of(null));
    
    component.loginForm.controls['email'].setValue('wrong@example.com');
    component.loginForm.controls['password'].setValue('wrongpassword');
    
    component.onSubmit();
    
    expect(userService.authenticateUser).toHaveBeenCalledWith('wrong@example.com', 'wrongpassword');
    expect(component.errorMessage).toBe('Credenciales inválidas');
    expect(router.navigate).not.toHaveBeenCalled();
  });
});