import { Injectable } from '@angular/core';
import { from, Observable, EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private libsLoaded = false;

  private async loadLibs(): Promise<void> {
    if (this.libsLoaded) return;

    const scripts = [
      'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
    ];

    for (const src of scripts) {
      await this.loadScript(src);
    }
    this.libsLoaded = true;
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  }

  generarPdfDesdeElemento(
    elemento: HTMLElement,
    nombreArchivo: string
  ): Observable<void> {
    return from(this.generarPdf(elemento, nombreArchivo)).pipe(
      catchError(err => {
        console.error('Error generando PDF:', err);
        alert('Error al generar el PDF. Intentá de nuevo.');
        return EMPTY;
      })
    );
  }

  private async generarPdf(elemento: HTMLElement, nombreArchivo: string): Promise<void> {
    await this.loadLibs();

    // Cast window to any to avoid TypeScript errors
    const win = window as any;
    
    const canvas = await win.html2canvas(elemento, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // Try different ways to access jsPDF
    let jsPDFClass: any;
    if (win.jspdf && win.jspdf.jsPDF) {
      jsPDFClass = win.jspdf.jsPDF;
    } else if (win.jsPDF) {
      jsPDFClass = win.jsPDF;
    } else {
      throw new Error('jsPDF not loaded');
    }
    
    const pdf = new jsPDFClass('p', 'mm', 'a4');

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(nombreArchivo);
  }
}