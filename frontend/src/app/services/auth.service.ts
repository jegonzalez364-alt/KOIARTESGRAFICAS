import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {

    constructor(private api: ApiService, private router: Router) { }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('koi_token');
    }

    getToken(): string | null {
        return localStorage.getItem('koi_token');
    }

    getUser(): any {
        const u = localStorage.getItem('koi_user');
        return u ? JSON.parse(u) : null;
    }

    login(username: string, password: string): Promise<boolean> {
        return new Promise((resolve) => {
            this.api.login(username, password).subscribe({
                next: (res) => {
                    localStorage.setItem('koi_token', res.token);
                    localStorage.setItem('koi_user', JSON.stringify(res.user));
                    resolve(true);
                },
                error: () => resolve(false)
            });
        });
    }

    logout(): void {
        localStorage.removeItem('koi_token');
        localStorage.removeItem('koi_user');
        this.router.navigate(['/login']);
    }
}
