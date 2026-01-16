/**
 * Generador de PDF basado en Diseño
 * Requirements: 7.1, 7.2, 6.1-6.4
 * 
 * Leer diseño guardado
 * Leer datos del pozo
 * Renderizar HTML según diseño
 * Convertir a PDF respetando posiciones y estilos
 * Manejar campos repetibles (N tuberías, N sumideros, N fotos)
 */

import type { FichaDesign, Pozo, DesignPDFExportConfig } from '@/types';

/**
 * Generar PDF desde un diseño
 */
export async function generatePDFFromDesign(
  config: DesignPDFExportConfig
): Promise<Blob> {
  const { design, pozoData, dpi = 300, includeBleed = false, compressImages = true } = config;
  
  // Crear HTML renderizado
  const html = renderDesignToHTML(design, pozoData);
  
  // Convertir a PDF (requiere librería como jsPDF o html2pdf)
  // Por ahora, retornamos un placeholder
  return new Blob([html], { type: 'text/html' });
}

/**
 * Renderizar diseño a HTML
 */
export function renderDesignToHTML(design: FichaDesign, pozoData: Record<string, any>): string {
  const { pageConfig, theme, fieldPlacements } = design;
  
  // Calcular dimensiones en mm
  const pageWidthMm = pageConfig.width;
  const pageHeightMm = pageConfig.height;
  
  // Crear HTML
  let html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${design.name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: ${theme.fontFamily}, Arial, sans-serif;
      background-color: #f5f5f5;
      padding: 20px;
    }
    
    .page {
      width: ${pageWidthMm}mm;
      height: ${pageHeightMm}mm;
      background-color: ${theme.backgroundColor};
      color: ${theme.textColor};
      position: relative;
      margin: 0 auto 20px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      page-break-after: always;
    }
    
    @media print {
      body {
        padding: 0;
        background-color: white;
      }
      .page {
        margin: 0;
        box-shadow: none;
        page-break-after: always;
      }
    }
    
    .page-content {
      width: 100%;
      height: 100%;
      position: relative;
      padding: ${pageConfig.margins.top}mm ${pageConfig.margins.right}mm ${pageConfig.margins.bottom}mm ${pageConfig.margins.left}mm;
    }
    
    .field {
      position: absolute;
      font-size: ${theme.baseFontSize}pt;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .field-label {
      font-weight: bold;
      font-size: ${theme.baseFontSize - 1}pt;
      color: ${theme.primaryColor};
      margin-bottom: 2px;
    }
    
    .field-value {
      font-size: ${theme.baseFontSize}pt;
      color: ${theme.textColor};
    }
    
    .field-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    
    .repeatable-group {
      margin-bottom: 10px;
      padding: 5px;
      border: 1px solid ${theme.borderColor};
      border-radius: 3px;
    }
    
    .repeatable-item {
      margin-bottom: 5px;
      padding: 3px;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="page-content">
`;
  
  // Agregar campos colocados
  fieldPlacements.forEach((placement) => {
    if (!placement.visible) return;
    
    const value = getFieldValue(pozoData, placement.fieldId);
    
    // Convertir posición de píxeles a mm
    const xMm = (placement.position.x / 96) * 25.4; // 96 DPI a mm
    const yMm = (placement.position.y / 96) * 25.4;
    const widthMm = (placement.position.width / 96) * 25.4;
    const heightMm = (placement.position.height / 96) * 25.4;
    
    const fieldStyle = `
      position: absolute;
      left: ${xMm}mm;
      top: ${yMm}mm;
      width: ${widthMm}mm;
      height: ${heightMm}mm;
      font-size: ${placement.style.fontSize}pt;
      font-family: ${placement.style.fontFamily};
      color: ${placement.style.color};
      background-color: ${placement.style.backgroundColor};
      border-radius: ${placement.style.borderRadius}px;
      padding: ${placement.style.padding}px;
      z-index: ${placement.zIndex};
    `;
    
    if (placement.isRepeatable && Array.isArray(value)) {
      // Manejar campos repetibles
      html += `<div class="field repeatable-group" style="${fieldStyle}">`;
      value.forEach((item, index) => {
        if (placement.repeatableConfig?.showNumbering) {
          html += `<div class="repeatable-item"><strong>${index + 1}.</strong> ${escapeHTML(String(item))}</div>`;
        } else {
          html += `<div class="repeatable-item">${escapeHTML(String(item))}</div>`;
        }
      });
      html += `</div>`;
    } else if (placement.fieldType === 'image' && value) {
      // Manejar imágenes
      html += `<div class="field" style="${fieldStyle}">
        <img src="${value}" alt="${placement.fieldName}" class="field-image">
      </div>`;
    } else {
      // Manejar campos de texto
      html += `<div class="field" style="${fieldStyle}">
        <div class="field-label">${escapeHTML(placement.customLabel || placement.fieldName)}</div>
        <div class="field-value">${escapeHTML(String(value || ''))}</div>
      </div>`;
    }
  });
  
  html += `
    </div>
  </div>
</body>
</html>`;
  
  return html;
}

/**
 * Obtener valor de campo del objeto de datos
 */
function getFieldValue(data: Record<string, any>, fieldId: string): any {
  // Buscar en estructura anidada
  const keys = fieldId.split('.');
  let value = data;
  
  for (const key of keys) {
    if (value && typeof value === 'object') {
      value = value[key];
    } else {
      return undefined;
    }
  }
  
  return value;
}

/**
 * Escapar HTML
 */
function escapeHTML(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Comprimir imagen
 */
export async function compressImage(
  imageData: string,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(imageData);
      }
    };
    img.src = imageData;
  });
}

/**
 * Generar múltiples PDFs (lote)
 */
export async function generatePDFBatch(
  designs: FichaDesign[],
  pozos: Pozo[],
  onProgress?: (current: number, total: number) => void
): Promise<Blob[]> {
  const pdfs: Blob[] = [];
  
  for (let i = 0; i < pozos.length; i++) {
    const pozo = pozos[i];
    const design = designs[0]; // Usar primer diseño para todos
    
    const config: DesignPDFExportConfig = {
      design,
      pozoData: pozoToObject(pozo),
      dpi: 300,
      includeBleed: false,
      compressImages: true,
    };
    
    const pdf = await generatePDFFromDesign(config);
    pdfs.push(pdf);
    
    onProgress?.(i + 1, pozos.length);
  }
  
  return pdfs;
}

/**
 * Convertir Pozo a objeto plano
 */
function pozoToObject(pozo: Pozo): Record<string, any> {
  return {
    id: pozo.id,
    identificacion: {
      idPozo: pozo.identificacion?.idPozo?.value || pozo.idPozo?.value || '',
      coordenadaX: pozo.identificacion?.coordenadaX?.value || '',
      coordenadaY: pozo.identificacion?.coordenadaY?.value || '',
      fecha: pozo.identificacion?.fecha?.value || '',
      levanto: pozo.identificacion?.levanto?.value || '',
      estado: pozo.identificacion?.estado?.value || '',
    },
    ubicacion: {
      direccion: pozo.ubicacion?.direccion?.value || '',
      barrio: pozo.ubicacion?.barrio?.value || '',
      elevacion: pozo.ubicacion?.elevacion?.value || '',
      profundidad: pozo.ubicacion?.profundidad?.value || '',
    },
    componentes: {
      existeTapa: pozo.componentes?.existeTapa?.value || '',
      estadoTapa: pozo.componentes?.estadoTapa?.value || '',
      existeCilindro: pozo.componentes?.existeCilindro?.value || '',
      diametroCilindro: pozo.componentes?.diametroCilindro?.value || '',
      sistema: pozo.componentes?.sistema?.value || '',
      anoInstalacion: pozo.componentes?.anoInstalacion?.value || '',
    },
    tuberias: (pozo.tuberias?.tuberias || []).map((t) => ({
      idTuberia: t.idTuberia?.value || '',
      tipoTuberia: t.tipoTuberia?.value || '',
      diametro: t.diametro?.value || '',
      material: t.material?.value || '',
      estado: t.estado?.value || '',
    })),
    sumideros: (pozo.sumideros?.sumideros || []).map((s) => ({
      idSumidero: s.idSumidero?.value || '',
      tipoSumidero: s.tipoSumidero?.value || '',
      diametro: s.diametro?.value || '',
    })),
    fotos: (pozo.fotos?.fotos || []).map((f) => ({
      idFoto: f.idFoto?.value || '',
      tipoFoto: f.tipoFoto?.value || '',
      rutaArchivo: f.rutaArchivo?.value || '',
      dataUrl: f.dataUrl,
    })),
  };
}
