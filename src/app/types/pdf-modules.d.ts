// Tipos para jsPDF y html2canvas (que no tienen @types disponibles)
declare module 'jspdf' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, import/no-default-export
  export default any;
}

declare module 'html2canvas' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, import/no-default-export
  export default function html2canvas(element: any, options?: any): Promise<any>;
}