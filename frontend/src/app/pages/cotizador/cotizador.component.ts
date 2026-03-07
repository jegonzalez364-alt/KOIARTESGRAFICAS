import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-cotizador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cotizador.component.html',
  styleUrls: ['./cotizador.component.css']
})
export class CotizadorComponent implements OnInit {

  anchoCm: number | null = null;
  altoCm: number | null = null;
  tipoProducto: string = '';
  precioCalculado: number | null = null;

  settings: any = null;
  loading: boolean = true;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.apiService.getCotizadorSettings().subscribe({
      next: (data) => {
        this.settings = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading cotizador settings:', err);
        this.loading = false; // allow to show error or defaults
      }
    });
  }

  calcular(): void {
    if (!this.anchoCm || !this.altoCm || !this.tipoProducto || !this.settings) {
      this.precioCalculado = null;
      return;
    }

    const {
      costo3D_m2,
      costoNormal_m2,
      costoFraccionado_m2,
      precioPendon_m2,
      minimoPendon
    } = this.settings;

    let precio = 0;

    switch (this.tipoProducto) {
      case '3d':
        precio = this.precioKoi3D(this.anchoCm, this.altoCm, costo3D_m2);
        break;
      case 'normal':
        precio = this.precioKoi(this.anchoCm, this.altoCm, costoNormal_m2);
        break;
      case 'fraccionado':
        // Fraccionado expects meters in the original formula, so convert
        precio = this.precioKoiFraccionado(this.anchoCm / 100, this.altoCm / 100, costoFraccionado_m2);
        break;
      case 'pendon':
        precio = this.precioPendon(this.anchoCm, this.altoCm, precioPendon_m2, minimoPendon);
        break;
    }

    this.precioCalculado = precio;
  }

  /* --- Fórmulas Replicadas --- */

  private precioKoi3D(ancho_cm: number, alto_cm: number, costo3D_m2: number): number {
    const area = (ancho_cm / 100) * (alto_cm / 100);
    let multiplicador = 12.2 - (area * 9.8);
    if (multiplicador > 12.0) multiplicador = 12.0;
    if (multiplicador < 2.4) multiplicador = 2.4;
    let precio = area * costo3D_m2 * multiplicador;
    return Math.ceil(precio / 5000) * 5000;
  }

  private precioKoiFraccionado(ancho_m: number, alto_m: number, costo_m2: number): number {
    const area = ancho_m * alto_m;
    let multiplicador = 4.28 - (area * 1.05);
    if (multiplicador > 4.20) multiplicador = 4.20;
    if (multiplicador < 2.44) multiplicador = 2.44;
    let precio = area * costo_m2 * multiplicador;
    return Math.ceil(precio / 5000) * 5000;
  }

  private precioKoi(ancho_cm: number, alto_cm: number, costo_m2: number): number {
    const area = (ancho_cm / 100) * (alto_cm / 100);
    let multiplicador = 4.0; // default (extra grandes)

    if (area <= 0.07) multiplicador = 9.4;
    else if (area <= 0.11) multiplicador = 7.2;
    else if (area <= 0.17) multiplicador = 6.3;
    else if (area <= 0.20) multiplicador = 5.6;
    else if (area <= 0.30) multiplicador = 4.2;
    else if (area <= 0.45) multiplicador = 4.5;

    let precio = area * costo_m2 * multiplicador;
    return Math.ceil(precio / 5000) * 5000;
  }

  private precioPendon(ancho_cm: number, alto_cm: number, precio_m2: number, minimo: number): number {
    const area = (ancho_cm / 100) * (alto_cm / 100);
    let precio = 0;
    if (area <= 0.5) {
      precio = minimo;
    } else {
      precio = area * precio_m2;
    }
    return Math.ceil(precio / 5000) * 5000;
  }

  /* --- Utils para UI --- */

  getProporcionMuestra(): any {
    if (!this.anchoCm || !this.altoCm) {
      return { 'width': '100px', 'height': '100px' };
    }

    // Calcula la relación de aspecto, pero limitada a una caja máxima de 250px
    const maxSize = 250;
    const ratio = this.anchoCm / this.altoCm;

    let w, h;
    if (ratio > 1) { // Más ancho que alto
      w = maxSize;
      h = maxSize / ratio;
    } else { // Más alto que ancho o cuadrado
      h = maxSize;
      w = maxSize * ratio;
    }

    return {
      'width': `${w}px`,
      'height': `${h}px`
    };
  }

  enviarWhatsApp(): void {
    if (!this.precioCalculado) return;

    let nombreProducto = '';
    if (this.tipoProducto === '3d') nombreProducto = 'Cuadro 3D';
    if (this.tipoProducto === 'normal') nombreProducto = 'Cuadro Normal';
    if (this.tipoProducto === 'fraccionado') nombreProducto = 'Cuadro Fraccionado';
    if (this.tipoProducto === 'pendon') nombreProducto = 'Pendón';

    const texto = `Hola, quiero hacer un pedido de un ${nombreProducto} con las medidas ${this.anchoCm}cm de ancho y ${this.altoCm}cm de alto. Me aparece un valor cotizado de $${this.precioCalculado}. ¿Podemos coordinar?`;

    const url = `https://wa.me/573186909433?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  }

}
