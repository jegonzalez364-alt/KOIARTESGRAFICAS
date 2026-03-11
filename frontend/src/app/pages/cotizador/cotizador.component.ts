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
      costo3D_material,
      costo3D_impresion,
      costoLaser_material,
      costoLaser_impresion,
      costoNormal_m2,
      costoFraccionado_m2,
      precioPendon_m2,
      minimoPendon
    } = this.settings;

    let precio = 0;

    switch (this.tipoProducto) {
      case '3d':
        precio = this.precioKoi3D(this.anchoCm, this.altoCm, costo3D_material, costo3D_impresion);
        break;
      case 'laser':
        precio = this.precioKoi3D(this.anchoCm, this.altoCm, costoLaser_material, costoLaser_impresion);
        break;
      case 'normal':
        precio = this.precioKoi(this.anchoCm, this.altoCm, costoNormal_m2);
        break;
      case 'fraccionado':
        precio = this.precioKoiFraccionado(this.anchoCm, this.altoCm, costoFraccionado_m2);
        break;
      case 'pendon':
        precio = this.precioPendon(this.anchoCm, this.altoCm, precioPendon_m2, minimoPendon);
        break;
    }

    this.precioCalculado = precio;
  }

  /* --- Fórmulas Replicadas --- */

  private getInterpolatedMultiplier(area: number, stops: { a: number, m: number }[]): number {
    if (area <= stops[0].a) return stops[0].m;
    if (area >= stops[stops.length - 1].a) return stops[stops.length - 1].m;

    for (let i = 0; i < stops.length - 1; i++) {
        if (area >= stops[i].a && area <= stops[i + 1].a) {
            const slope = (stops[i + 1].m - stops[i].m) / (stops[i + 1].a - stops[i].a);
            return stops[i].m + slope * (area - stops[i].a);
        }
    }
    return stops[stops.length - 1].m;
  }

  private precioKoi3D(ancho_cm: number, alto_cm: number, material: number, impresion: number): number {
    const area = (ancho_cm / 100) * (alto_cm / 100);
    const costo_m2 = (material * 2) + (impresion * 2);

    // Tamaños exactos para obtener redondeos KOI perfectos (calculados sobre base 164.360)
    const layouts = [
        { w: 14, h: 20, m: 7.604 },  // ~35.000
        { w: 20, h: 30, m: 4.563 },  // ~45.000
        { w: 30, h: 40, m: 3.295 },  // ~65.000
        { w: 40, h: 50, m: 2.737 },  // ~90.000
        { w: 40, h: 60, m: 2.788 },  // ~110.000
        { w: 60, h: 80, m: 2.028 },  // ~160.000
        { w: 100, h: 100, m: 1.581 } // ~260.000
    ];

    let multiplicador = null;
    
    // 1. Detección de diseño exacto (conmutativo)
    for (const l of layouts) {
        if ((ancho_cm == l.w && alto_cm == l.h) || (ancho_cm == l.h && alto_cm == l.w)) {
            multiplicador = l.m;
            break;
        }
    }

    // 2. Si es una medida personalizada, usar interpolación matemática suave
    if (multiplicador === null) {
        const stops = layouts.map(l => ({ a: (l.w / 100) * (l.h / 100), m: l.m })).sort((a, b) => a.a - b.a);
        multiplicador = this.getInterpolatedMultiplier(area, stops);
    }

    const precio = area * costo_m2 * multiplicador;
    return Math.ceil(precio / 5000) * 5000;
  }

  private precioKoiFraccionado(ancho_cm: number, alto_cm: number, costo_m2: number): number {
    const area = (ancho_cm / 100) * (alto_cm / 100);
    
    // Puntos de calibración para obtener redondeos exactos (sobre base 53.180)
    const layouts = [
        { w: 100, h: 50, m: 4.136 },  // ~110.000
        { w: 120, h: 60, m: 3.656 },  // ~140.000
        { w: 150, h: 80, m: 2.977 },  // ~190.000
        { w: 100, h: 200, m: 2.444 }  // ~260.000
    ];

    let multiplicador = null;

    // 1. Detección (conmutativo)
    for (const l of layouts) {
        if ((ancho_cm == l.w && alto_cm == l.h) || (ancho_cm == l.h && alto_cm == l.w)) {
            multiplicador = l.m;
            break;
        }
    }

    // 2. Interpolación si es personalizado
    if (multiplicador === null) {
        const stops = layouts.map(l => ({ a: (l.w / 100) * (l.h / 100), m: l.m })).sort((a, b) => a.a - b.a);
        multiplicador = this.getInterpolatedMultiplier(area, stops);
    }

    const precio = area * costo_m2 * multiplicador;
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
    if (this.tipoProducto === 'laser') nombreProducto = 'Cuadro Corte Láser';
    if (this.tipoProducto === 'normal') nombreProducto = 'Cuadro Normal';
    if (this.tipoProducto === 'fraccionado') nombreProducto = 'Cuadro Fraccionado';
    if (this.tipoProducto === 'pendon') nombreProducto = 'Pendón';

    const texto = `Hola, quiero hacer un pedido de un ${nombreProducto} con las medidas ${this.anchoCm}cm de ancho y ${this.altoCm}cm de alto. Me aparece un valor cotizado de $${this.precioCalculado}. ¿Podemos coordinar?`;

    const url = `https://wa.me/573186909433?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  }

}
