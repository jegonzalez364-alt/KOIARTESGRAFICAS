import { Injectable, isDevMode } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GallerySlide {
    id: string;
    type: 'image' | 'video' | 'youtube';
    src: string;
    alt: string;
    order: number;
}

export interface Card {
    id: string;
    number: string;
    title: string;
    description: string;
    image: string;
    btnText: string;
    btnLink: string;
    tag: string;
    order: number;
    isHalftone?: boolean;
    halftoneTitle?: string;
}

export interface SearchResult {
    cards: Card[];
    gallery: GallerySlide[];
}

export interface LoginResponse {
    token: string;
    user: { id: string; username: string; role: string };
}

@Injectable({ providedIn: 'root' })
export class ApiService {
    // If in development mode (ng serve), point to localhost:3000
    // If built for production (Render), use relative path to route to the same domain
    private baseUrl = isDevMode() ? 'http://localhost:3000/api' : '/api';

    constructor(private http: HttpClient) { }

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('koi_token');
        return new HttpHeaders({ Authorization: `Bearer ${token}` });
    }

    // Auth
    login(username: string, password: string): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, { username, password });
    }

    verifyToken(): Observable<any> {
        return this.http.get(`${this.baseUrl}/auth/me`, { headers: this.getAuthHeaders() });
    }

    // Gallery
    getGallery(): Observable<GallerySlide[]> {
        return this.http.get<GallerySlide[]>(`${this.baseUrl}/gallery`);
    }

    addGallerySlide(formData: FormData): Observable<GallerySlide> {
        return this.http.post<GallerySlide>(`${this.baseUrl}/gallery`, formData, { headers: this.getAuthHeaders() });
    }

    deleteGallerySlide(id: string): Observable<any> {
        return this.http.delete(`${this.baseUrl}/gallery/${id}`, { headers: this.getAuthHeaders() });
    }

    // Cards
    getCards(): Observable<Card[]> {
        return this.http.get<Card[]>(`${this.baseUrl}/cards`);
    }

    addCard(formData: FormData): Observable<Card> {
        return this.http.post<Card>(`${this.baseUrl}/cards`, formData, { headers: this.getAuthHeaders() });
    }

    updateCard(id: string, formData: FormData): Observable<Card> {
        return this.http.put<Card>(`${this.baseUrl}/cards/${id}`, formData, { headers: this.getAuthHeaders() });
    }

    deleteCard(id: string): Observable<any> {
        return this.http.delete(`${this.baseUrl}/cards/${id}`, { headers: this.getAuthHeaders() });
    }

    // Account settings
    updateCredentials(currentPassword: string, newUsername: string, newPassword: string): Observable<any> {
        return this.http.put(`${this.baseUrl}/auth/update`, { currentPassword, newUsername, newPassword }, { headers: this.getAuthHeaders() });
    }

    // Registration
    register(data: { username: string; password: string; nombre: string; email: string; telefono: string }): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.baseUrl}/auth/register`, data);
    }

    // Profile (for form auto-fill)
    getProfile(): Observable<any> {
        return this.http.get(`${this.baseUrl}/auth/profile`, { headers: this.getAuthHeaders() });
    }

    // Requests / Petitions
    getRequests(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/requests`, { headers: this.getAuthHeaders() });
    }

    getMyRequests(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/requests/mine`, { headers: this.getAuthHeaders() });
    }

    submitRequest(data: { nombre: string; email: string; telefono: string; asunto: string; mensaje: string }): Observable<any> {
        const headers = localStorage.getItem('koi_token') ? this.getAuthHeaders() : new HttpHeaders();
        return this.http.post(`${this.baseUrl}/requests`, data, { headers });
    }

    updateRequest(id: string, data: { status?: string; adminNotes?: string; respondedVia?: string }): Observable<any> {
        return this.http.put(`${this.baseUrl}/requests/${id}`, data, { headers: this.getAuthHeaders() });
    }

    deleteRequest(id: string): Observable<any> {
        return this.http.delete(`${this.baseUrl}/requests/${id}`, { headers: this.getAuthHeaders() });
    }

    // Users management (admin)
    getUsers(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/users`, { headers: this.getAuthHeaders() });
    }

    deleteUser(id: string): Observable<any> {
        return this.http.delete(`${this.baseUrl}/users/${id}`, { headers: this.getAuthHeaders() });
    }

    // Search
    search(query: string): Observable<SearchResult> {
        return this.http.get<SearchResult>(`${this.baseUrl}/search`, { params: { q: query } });
    }

    // Helper: get full URL for uploaded files
    getMediaUrl(src: string): string {
        if (!src) return '';
        if (src.startsWith('/uploads/')) {
            return isDevMode() ? `http://localhost:3000${src}` : src;
        }
        if (src.includes('res.cloudinary.com') && !src.includes('f_auto')) {
            return src.replace('/upload/', '/upload/f_auto,q_auto/');
        }
        return src;
    }

    // Helper: convert any YouTube URL to embed URL
    getYouTubeEmbedUrl(url: string): string {
        let videoId = '';
        // youtube.com/watch?v=ID
        const watchMatch = url.match(/[?&]v=([^&#]+)/);
        // youtu.be/ID
        const shortMatch = url.match(/youtu\.be\/([^?&#]+)/);
        // youtube.com/embed/ID
        const embedMatch = url.match(/youtube\.com\/embed\/([^?&#]+)/);
        // youtube.com/shorts/ID
        const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&#]+)/);

        if (watchMatch) videoId = watchMatch[1];
        else if (shortMatch) videoId = shortMatch[1];
        else if (embedMatch) videoId = embedMatch[1];
        else if (shortsMatch) videoId = shortsMatch[1];
        else return url; // fallback

        return `https://www.youtube.com/embed/${videoId}`;
    }

    // Check if URL is a YouTube URL
    isYouTubeUrl(url: string): boolean {
        return /youtube\.com|youtu\.be/i.test(url);
    }

    // Get YouTube thumbnail
    getYouTubeThumbnail(url: string): string {
        let videoId = '';
        const watchMatch = url.match(/[?&]v=([^&#]+)/);
        const shortMatch = url.match(/youtu\.be\/([^?&#]+)/);
        const embedMatch = url.match(/youtube\.com\/embed\/([^?&#]+)/);
        const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&#]+)/);
        if (watchMatch) videoId = watchMatch[1];
        else if (shortMatch) videoId = shortMatch[1];
        else if (embedMatch) videoId = embedMatch[1];
        else if (shortsMatch) videoId = shortsMatch[1];
        return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
    }
}
