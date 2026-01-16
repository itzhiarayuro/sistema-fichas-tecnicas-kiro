/**
 * PDFMakeGenerator - Generación de PDFs con pdfmake
 * Requirements: 7.1, 7.2, 5.1-5.5
 * 
 * Usa Helvetica como fuente estándar (incluida en PDF)
 * Integra validación, prevención de errores, manejo de recursos y monitoreo
 */

import type { TDocumentDefinitions, ContentTable } from 'pdfmake/interfaces';
import type { FichaState, FichaCustomization } from '@/types/ficha';
import type { Pozo } from '@/types/pozo';
import { validatePozoForPDF } from './pdfValidationEngine';
import { preventKnownIssues, logErrorForAnalysis } from './errorPreventionSystem';
import { estimateResources, releaseMemory, MemoryMonitor } from './resourceManagementSystem';
import { attemptRecovery, RecoveryStateManager, saveProgressState } from './recoverySystem';
import { globalMonitor } from './monitoringSystem';
import { debugLogger } from './debugLogger';
import { generatePdfContent, validatePozoForPhotoGeneration } from './designBasedPdfGenerator';
import { getPdfMakeForServer } from './pdfMakeServerInit';

const STYLES = {
  header: { fontSize: 16, bold: true, color: '#FFFFFF', alignment: 'center' as const },
  sectionTitle: { fontSize: 12, bold: true, color: '#FFFFFF', fillColor: '#1F4E79', margin: [0, 8, 0, 4] },
  label: { fontSize: 9, bold: true, color: '#666666' },
  value: { fontSize: 10, color: '#000000' },
  tableHeader: { fontSize: 9, bold: true, color: '#FFFFFF', fillColor: '#1F4E79', alignment: 'center' as const },
  tableCell: { fontSize: 9, color: '#000000' },
};

export interface PDFGeneratorOptions {
  watermark?: string;
  pageNumbers?: boolean;
  includeDate?: boolean;
  imageQuality?: number;
}

export interface PDFGenerationResult {
  success: boolean;
  blob?: Blob;
  filename?: string;
  error?: string;
  pageCount?: number;
}

function getFieldValue(field: unknown): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object' && field !== null && 'value' in field) {
    return String((field as { value: unknown }).value || '');
  }
  return '';
}

function createFieldRow(label: string, value: string): unknown[] {
  return [
    { text: label, style: 'label' },
    { text: value || '-', style: 'value' },
  ];
}

function createTwoColumnTable(rows: unknown[][]): ContentTable {
  return { table: { widths: ['40%', '60%'], body: rows }, layout: 'noBorders' };
}


export class PDFMakeGenerator {
  private defaultCustomization: FichaCustomization = {
    colors: { headerBg: '#1F4E79', headerText: '#FFFFFF', sectionBg: '#F5F5F5', sectionText: '#333333', labelText: '#666666', valueText: '#000000', borderColor: '#CCCCCC' },
    fonts: { titleSize: 14, labelSize: 9, valueSize: 10, fontFamily: 'Helvetica' },
    spacing: { sectionGap: 8, fieldGap: 4, padding: 5, margin: 15 },
    template: 'default',
    isGlobal: false,
  };

  private recoveryManager = new RecoveryStateManager();
  private memoryMonitor = new MemoryMonitor();

  async generatePDF(_ficha: FichaState, pozo: Pozo, options: PDFGeneratorOptions = {}): Promise<PDFGenerationResult> {
    const startTime = new Date();
    const pozoId = getFieldValue(pozo.idPozo) || 'unknown';
    
    debugLogger.info('PDFMakeGenerator', 'Starting PDF generation', { pozoId });

    try {
      // 1. Validar datos de entrada
      debugLogger.debug('PDFMakeGenerator', 'Validating input data', { pozoId });
      const validationResult = validatePozoForPDF(pozo);
      if (!validationResult.isValid) {
        const errors = validationResult.errors.map((e) => e.message).join('; ');
        debugLogger.error('PDFMakeGenerator', 'Validation failed', { pozoId, errors });
        throw new Error(`Validación fallida: ${errors}`);
      }
      debugLogger.info('PDFMakeGenerator', 'Validation passed', { pozoId });

      // 2. Prevenir errores conocidos
      debugLogger.debug('PDFMakeGenerator', 'Preventing known issues', { pozoId });
      const preventionResult = await preventKnownIssues(pozo);
      if (!preventionResult.canProceed) {
        const warnings = preventionResult.warnings.join('; ');
        debugLogger.error('PDFMakeGenerator', 'Prevention check failed', { pozoId, warnings });
        throw new Error('No se puede proceder: ' + warnings);
      }
      debugLogger.info('PDFMakeGenerator', 'Prevention check passed', { pozoId });

      // 3. Estimar recursos
      debugLogger.debug('PDFMakeGenerator', 'Estimating resources', { pozoId });
      const resourceEstimate = estimateResources(pozo);
      if (!resourceEstimate.canGenerate) {
        const warnings = resourceEstimate.warnings.join('; ');
        debugLogger.error('PDFMakeGenerator', 'Insufficient resources', { pozoId, warnings });
        throw new Error('Recursos insuficientes: ' + warnings);
      }
      debugLogger.info('PDFMakeGenerator', 'Resource estimation passed', {
        pozoId,
        recommendedQuality: resourceEstimate.recommendedQuality,
      });

      // 4. Crear estado de recuperación
      debugLogger.debug('PDFMakeGenerator', 'Creating recovery state', { pozoId });
      this.recoveryManager.createState(pozoId);
      this.memoryMonitor.recordSnapshot();

      // 5. Generar PDF
      debugLogger.debug('PDFMakeGenerator', 'Loading pdfmake', { pozoId });
      const pdfMake = await getPdfMakeForServer();
      
      debugLogger.debug('PDFMakeGenerator', 'Building document definition', { pozoId });
      const docDefinition: TDocumentDefinitions = {
        pageSize: 'A4',
        pageMargins: [12, 60, 12, 40],
        defaultStyle: { fontSize: 10, font: 'Helvetica' },
        styles: { header: STYLES.header, sectionTitle: STYLES.sectionTitle, label: STYLES.label, value: STYLES.value, tableHeader: STYLES.tableHeader, tableCell: STYLES.tableCell },
        header: this.buildHeader(pozo),
        content: generatePdfContent(pozo, true),
        footer: options.pageNumbers ? this.buildFooter() : undefined,
      };

      debugLogger.debug('PDFMakeGenerator', 'Creating PDF blob', { pozoId });
      const result = await new Promise<PDFGenerationResult>((resolve) => {
        pdfMake.createPdf(docDefinition).getBlob((blob: Blob) => {
          const filename = `ficha_${pozoId}_${Date.now()}.pdf`;
          
          debugLogger.info('PDFMakeGenerator', 'PDF blob created successfully', {
            pozoId,
            filename,
            blobSizeMB: (blob.size / 1024 / 1024).toFixed(2),
          });

          // Registrar en monitoreo
          const endTime = new Date();
          const duration = endTime.getTime() - startTime.getTime();
          const photoCount = 
            (pozo.fotos?.principal?.length || 0) +
            (pozo.fotos?.entradas?.length || 0) +
            (pozo.fotos?.salidas?.length || 0) +
            (pozo.fotos?.sumideros?.length || 0) +
            (pozo.fotos?.otras?.length || 0);

          globalMonitor.trackGeneration({
            pozoId,
            startTime,
            endTime,
            duration,
            success: true,
            photoCount,
            memoryUsedMB: this.memoryMonitor.getPeakMemoryUsage() / 1024 / 1024,
            browser: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
          });

          // Limpiar memoria
          releaseMemory();
          this.recoveryManager.clearState(pozoId);

          resolve({ success: true, blob, filename, pageCount: 1 });
        });
      });

      debugLogger.info('PDFMakeGenerator', 'PDF generation completed successfully', { pozoId });
      return result;
    } catch (error) {
      debugLogger.error('PDFMakeGenerator', 'PDF generation failed', {
        pozoId,
        error: error instanceof Error ? error.message : String(error),
      });

      console.error('PDF Generation Error:', error);
      
      // Registrar error en monitoreo
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      
      globalMonitor.trackGeneration({
        pozoId,
        startTime,
        endTime,
        duration,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        photoCount: 0,
        memoryUsedMB: this.memoryMonitor.getPeakMemoryUsage() / 1024 / 1024,
        browser: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
      });

      // Intentar recuperación
      const recoveryAttempt = await attemptRecovery(error, pozo, { options });
      this.recoveryManager.recordAttempt(pozoId, recoveryAttempt);

      // Guardar estado para recuperación manual
      saveProgressState(pozoId, { pozo, options, error: error instanceof Error ? error.message : String(error) });

      // Registrar para análisis
      logErrorForAnalysis(error, { pozoId, options });

      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  }

  private buildContent(pozo: Pozo): unknown[] {
    const content: unknown[] = [];
    content.push(this.buildIdentificacionSection(pozo));
    content.push({ text: '', margin: [0, 8] });
    content.push(this.buildUbicacionSection(pozo));
    content.push({ text: '', margin: [0, 8] });
    content.push(this.buildComponentesSection(pozo));
    content.push({ text: '', margin: [0, 8] });
    if (pozo.tuberias?.length > 0) {
      content.push(this.buildTuberiasSection(pozo));
      content.push({ text: '', margin: [0, 8] });
    }
    if (pozo.sumideros?.length > 0) {
      content.push(this.buildSumiderosSection(pozo));
      content.push({ text: '', margin: [0, 8] });
    }
    const obs = getFieldValue(pozo.observaciones);
    if (obs) content.push(this.buildObservacionesSection(pozo));
    return content;
  }

  private buildHeader(pozo: Pozo): unknown {
    return (currentPage: number, pageCount: number) => {
      return {
        stack: [
          {
            table: { widths: ['*'], body: [
              [{ text: 'FICHA TÉCNICA DE POZO DE INSPECCIÓN', style: 'header', fillColor: '#1F4E79', margin: [0, 8, 0, 8] }],
              [{ text: `Pozo: ${getFieldValue(pozo.idPozo)}`, fontSize: 11, bold: true, alignment: 'center', margin: [0, 4, 0, 4] }],
            ]},
            layout: 'noBorders',
          },
          { text: '', margin: [0, 4] },
        ],
      };
    };
  }

  private buildIdentificacionSection(pozo: Pozo): unknown {
    return {
      stack: [
        { text: 'IDENTIFICACIÓN', style: 'sectionTitle', margin: [0, 0, 0, 8] },
        createTwoColumnTable([
          createFieldRow('ID Pozo', getFieldValue(pozo.idPozo)),
          createFieldRow('Coordenada X', getFieldValue(pozo.coordenadaX)),
          createFieldRow('Coordenada Y', getFieldValue(pozo.coordenadaY)),
          createFieldRow('Fecha', getFieldValue(pozo.fecha)),
          createFieldRow('Levantó', getFieldValue(pozo.levanto)),
          createFieldRow('Estado', getFieldValue(pozo.estado)),
        ]),
      ],
    };
  }

  private buildUbicacionSection(pozo: Pozo): unknown {
    return {
      stack: [
        { text: 'UBICACIÓN', style: 'sectionTitle', margin: [0, 0, 0, 8] },
        createTwoColumnTable([
          createFieldRow('Dirección', getFieldValue(pozo.direccion)),
          createFieldRow('Barrio', getFieldValue(pozo.barrio)),
          createFieldRow('Elevación', getFieldValue(pozo.elevacion)),
          createFieldRow('Profundidad', getFieldValue(pozo.profundidad)),
        ]),
      ],
    };
  }


  private buildComponentesSection(pozo: Pozo): unknown {
    return {
      stack: [
        { text: 'COMPONENTES', style: 'sectionTitle', margin: [0, 0, 0, 8] },
        createTwoColumnTable([
          createFieldRow('Existe Tapa', getFieldValue(pozo.existeTapa)),
          createFieldRow('Estado Tapa', getFieldValue(pozo.estadoTapa)),
          createFieldRow('Material Tapa', getFieldValue(pozo.materialTapa)),
          createFieldRow('Existe Cilindro', getFieldValue(pozo.existeCilindro)),
          createFieldRow('Diámetro Cilindro', getFieldValue(pozo.diametroCilindro)),
          createFieldRow('Material Cilindro', getFieldValue(pozo.materialCilindro)),
          createFieldRow('Estado Cilindro', getFieldValue(pozo.estadoCilindro)),
          createFieldRow('Existe Cono', getFieldValue(pozo.existeCono)),
          createFieldRow('Tipo Cono', getFieldValue(pozo.tipoCono)),
          createFieldRow('Material Cono', getFieldValue(pozo.materialCono)),
          createFieldRow('Estado Cono', getFieldValue(pozo.estadoCono)),
          createFieldRow('Existe Cañuela', getFieldValue(pozo.existeCanuela)),
          createFieldRow('Material Cañuela', getFieldValue(pozo.materialCanuela)),
          createFieldRow('Estado Cañuela', getFieldValue(pozo.estadoCanuela)),
          createFieldRow('Existe Peldaños', getFieldValue(pozo.existePeldanos)),
          createFieldRow('Número Peldaños', getFieldValue(pozo.numeroPeldanos)),
          createFieldRow('Material Peldaños', getFieldValue(pozo.materialPeldanos)),
          createFieldRow('Estado Peldaños', getFieldValue(pozo.estadoPeldanos)),
          createFieldRow('Sistema', getFieldValue(pozo.sistema)),
          createFieldRow('Año Instalación', getFieldValue(pozo.anoInstalacion)),
          createFieldRow('Tipo Cámara', getFieldValue(pozo.tipoCamara)),
          createFieldRow('Estructura Pavimento', getFieldValue(pozo.estructuraPavimento)),
        ]),
      ],
    };
  }

  private buildTuberiasSection(pozo: Pozo): unknown {
    const tuberias = pozo.tuberias || [];
    const entradas = tuberias.filter((t) => getFieldValue(t.tipoTuberia) === 'entrada');
    const salidas = tuberias.filter((t) => getFieldValue(t.tipoTuberia) === 'salida');
    const content: unknown[] = [{ text: 'TUBERÍAS', style: 'sectionTitle', margin: [0, 0, 0, 8] }];
    if (entradas.length > 0) {
      content.push({ text: 'Entradas:', fontSize: 10, bold: true, margin: [0, 4, 0, 2] });
      content.push(this.buildTuberiasTable(entradas));
    }
    if (salidas.length > 0) {
      content.push({ text: 'Salidas:', fontSize: 10, bold: true, margin: [0, 4, 0, 2] });
      content.push(this.buildTuberiasTable(salidas));
    }
    return { stack: content };
  }

  private buildTuberiasTable(tuberias: unknown[]): ContentTable {
    const rows: unknown[][] = [[
      { text: 'Diámetro', style: 'tableHeader' },
      { text: 'Material', style: 'tableHeader' },
      { text: 'Cota', style: 'tableHeader' },
      { text: 'Estado', style: 'tableHeader' },
      { text: 'Longitud', style: 'tableHeader' },
    ]];
    tuberias.forEach((t: unknown) => {
      const tub = t as Record<string, unknown>;
      rows.push([
        { text: getFieldValue(tub.diametro), style: 'tableCell' },
        { text: getFieldValue(tub.material), style: 'tableCell' },
        { text: getFieldValue(tub.cota), style: 'tableCell' },
        { text: getFieldValue(tub.estado), style: 'tableCell' },
        { text: getFieldValue(tub.longitud), style: 'tableCell' },
      ]);
    });
    return { table: { widths: ['20%', '20%', '20%', '20%', '20%'], body: rows }, layout: 'lightHorizontalLines' };
  }

  private buildSumiderosSection(pozo: Pozo): unknown {
    return {
      stack: [
        { text: 'SUMIDEROS', style: 'sectionTitle', margin: [0, 0, 0, 8] },
        this.buildSumiderosTable(pozo.sumideros || []),
      ],
    };
  }

  private buildSumiderosTable(sumideros: unknown[]): ContentTable {
    const rows: unknown[][] = [[
      { text: 'ID', style: 'tableHeader' },
      { text: 'Tipo', style: 'tableHeader' },
      { text: 'Material', style: 'tableHeader' },
      { text: 'Diámetro', style: 'tableHeader' },
      { text: 'Alt. Salida', style: 'tableHeader' },
      { text: 'Alt. Llegada', style: 'tableHeader' },
    ]];
    sumideros.forEach((s: unknown) => {
      const sum = s as Record<string, unknown>;
      rows.push([
        { text: getFieldValue(sum.idSumidero), style: 'tableCell' },
        { text: getFieldValue(sum.tipoSumidero), style: 'tableCell' },
        { text: getFieldValue(sum.materialTuberia), style: 'tableCell' },
        { text: getFieldValue(sum.diametro), style: 'tableCell' },
        { text: getFieldValue(sum.alturaSalida), style: 'tableCell' },
        { text: getFieldValue(sum.alturaLlegada), style: 'tableCell' },
      ]);
    });
    return { table: { widths: ['15%', '20%', '20%', '15%', '15%', '15%'], body: rows }, layout: 'lightHorizontalLines' };
  }

  private buildObservacionesSection(pozo: Pozo): unknown {
    return {
      stack: [
        { text: 'OBSERVACIONES', style: 'sectionTitle', margin: [0, 0, 0, 8] },
        { text: getFieldValue(pozo.observaciones) || 'Sin observaciones', style: 'value', margin: [8, 4], alignment: 'justify' as const },
      ],
    };
  }

  private buildFooter(): unknown {
    return (currentPage: number, pageCount: number) => ({
      text: `Página ${currentPage} de ${pageCount}`,
      alignment: 'center' as const,
      fontSize: 9,
      color: '#999999',
      margin: [0, 10, 0, 0],
    });
  }

  mergeCustomization(customizations: unknown): FichaCustomization {
    if (!Array.isArray(customizations) || customizations.length === 0) return this.defaultCustomization;
    const global = customizations.find((c: unknown) => c && typeof c === 'object' && 'isGlobal' in c && (c as { isGlobal: boolean }).isGlobal);
    return (global as FichaCustomization) || this.defaultCustomization;
  }
}
