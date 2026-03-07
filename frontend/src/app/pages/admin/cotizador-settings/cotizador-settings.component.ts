import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-cotizador-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cotizador-settings.component.html',
  styleUrls: ['./cotizador-settings.component.css']
})
export class CotizadorSettingsComponent implements OnInit {
  settings: any = {
    costo3D_m2: null,
    costoNormal_m2: null,
    costoFraccionado_m2: null,
    precioPendon_m2: null,
    minimoPendon: null
  };

  loading: boolean = true;
  saving: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading = true;
    this.apiService.getCotizadorSettings().subscribe({
      next: (data) => {
        this.settings = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading settings', err);
        this.errorMessage = 'Error al cargar la configuración.';
        this.loading = false;
      }
    });
  }

  saveSettings(): void {
    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.apiService.updateCotizadorSettings(this.settings).subscribe({
      next: (data) => {
        this.settings = data;
        this.saving = false;
        this.successMessage = 'Ajustes guardados correctamente.';

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        console.error('Error saving settings', err);
        this.errorMessage = 'Error al guardar los ajustes.';
        this.saving = false;
      }
    });
  }
}
