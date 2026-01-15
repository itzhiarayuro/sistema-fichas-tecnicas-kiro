# Próximo Paso: Integración con Diseñador HTML

## 📋 Estado Actual

✅ **Completado:**
- Paginación automática
- Encabezados reimprimibles
- Ajuste automático de layout
- Validaciones mejoradas
- Documentación completa
- 4 commits realizados

---

## 🎯 Próximo Paso: Integración

### Fase 1: Interfaz de Usuario (UI)

**Archivo a modificar**: `diseñador de fichas/editor.html`

#### 1.1 Panel de Configuración de Paginación
```html
<div class="pagination-config">
  <h3>Configuración de Paginación</h3>
  
  <label>
    Máximo de entradas por página:
    <input type="number" id="maxEntradas" value="10" min="1" max="50">
  </label>
  
  <label>
    Máximo de salidas por página:
    <input type="number" id="maxSalidas" value="2" min="1" max="10">
  </label>
  
  <label>
    Máximo de sumideros por página:
    <input type="number" id="maxSumideros" value="6" min="1" max="20">
  </label>
  
  <label>
    Máximo de fotos por página:
    <input type="number" id="maxFotos" value="4" min="1" max="20">
  </label>
</div>
```

#### 1.2 Panel de Encabezados Reimprimibles
```html
<div class="repeatable-header-config">
  <h3>Encabezados Reimprimibles</h3>
  
  <label>
    <input type="checkbox" id="enableHeaders" checked>
    Habilitar encabezados reimprimibles
  </label>
  
  <div id="headerFields">
    <label>
      <input type="checkbox" value="idPozo" checked>
      ID del Pozo
    </label>
    
    <label>
      <input type="checkbox" value="fecha" checked>
      Fecha de Inspección
    </label>
    
    <label>
      <input type="checkbox" value="direccion" checked>
      Dirección
    </label>
    
    <label>
      <input type="checkbox" value="tipoCamara">
      Tipo de Cámara
    </label>
    
    <!-- Más campos... -->
  </div>
  
  <div class="header-style">
    <label>
      Color de fondo:
      <input type="color" id="headerBgColor" value="#F5F5F5">
    </label>
    
    <label>
      Color de texto:
      <input type="color" id="headerTextColor" value="#333333">
    </label>
    
    <label>
      Tamaño de fuente:
      <input type="number" id="headerFontSize" value="9" min="6" max="14">
    </label>
  </div>
</div>
```

#### 1.3 Vista Previa de Paginación
```html
<div class="pagination-preview">
  <h3>Vista Previa de Paginación</h3>
  
  <div id="previewInfo">
    <p>Total de páginas: <span id="totalPages">1</span></p>
    <p>Entradas: <span id="previewEntradas">0</span> en <span id="pagesEntradas">0</span> página(s)</p>
    <p>Salidas: <span id="previewSalidas">0</span> en <span id="pagesSalidas">0</span> página(s)</p>
    <p>Sumideros: <span id="previewSumideros">0</span> en <span id="pagesSumideros">0</span> página(s)</p>
    <p>Fotos: <span id="previewFotos">0</span> en <span id="pagesFotos">0</span> página(s)</p>
  </div>
</div>
```

---

### Fase 2: Lógica JavaScript

**Archivo a crear/modificar**: `diseñador de fichas/js/paginationConfig.js`

```javascript
/**
 * Gestión de configuración de paginación
 */

class PaginationConfigManager {
  constructor() {
    this.config = {
      limits: {
        maxEntradasPorPagina: 10,
        maxSalidasPorPagina: 2,
        maxSumiderosPorPagina: 6,
        maxFotosPorPagina: 4,
      },
      repeatableHeader: {
        enabled: true,
        fields: ['idPozo', 'fecha', 'direccion'],
        style: {
          backgroundColor: '#F5F5F5',
          textColor: '#333333',
          fontSize: 9,
        },
      },
    };
    
    this.initializeUI();
    this.attachEventListeners();
  }
  
  /**
   * Inicializar UI con valores guardados
   */
  initializeUI() {
    // Cargar de localStorage si existe
    const saved = localStorage.getItem('paginationConfig');
    if (saved) {
      this.config = JSON.parse(saved);
    }
    
    // Actualizar inputs
    document.getElementById('maxEntradas').value = this.config.limits.maxEntradasPorPagina;
    document.getElementById('maxSalidas').value = this.config.limits.maxSalidasPorPagina;
    document.getElementById('maxSumideros').value = this.config.limits.maxSumiderosPorPagina;
    document.getElementById('maxFotos').value = this.config.limits.maxFotosPorPagina;
    
    // Actualizar checkboxes de encabezados
    document.querySelectorAll('#headerFields input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = this.config.repeatableHeader.fields.includes(checkbox.value);
    });
    
    // Actualizar colores
    document.getElementById('headerBgColor').value = this.config.repeatableHeader.style.backgroundColor;
    document.getElementById('headerTextColor').value = this.config.repeatableHeader.style.textColor;
    document.getElementById('headerFontSize').value = this.config.repeatableHeader.style.fontSize;
  }
  
  /**
   * Adjuntar event listeners
   */
  attachEventListeners() {
    // Límites de paginación
    document.getElementById('maxEntradas').addEventListener('change', (e) => {
      this.config.limits.maxEntradasPorPagina = parseInt(e.target.value);
      this.saveConfig();
      this.updatePreview();
    });
    
    // Encabezados reimprimibles
    document.getElementById('enableHeaders').addEventListener('change', (e) => {
      this.config.repeatableHeader.enabled = e.target.checked;
      this.saveConfig();
    });
    
    // Campos de encabezado
    document.querySelectorAll('#headerFields input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        this.config.repeatableHeader.fields = Array.from(
          document.querySelectorAll('#headerFields input[type="checkbox"]:checked')
        ).map(cb => cb.value);
        this.saveConfig();
      });
    });
    
    // Estilos de encabezado
    document.getElementById('headerBgColor').addEventListener('change', (e) => {
      this.config.repeatableHeader.style.backgroundColor = e.target.value;
      this.saveConfig();
    });
  }
  
  /**
   * Guardar configuración en localStorage
   */
  saveConfig() {
    localStorage.setItem('paginationConfig', JSON.stringify(this.config));
  }
  
  /**
   * Actualizar vista previa
   */
  updatePreview() {
    // Aquí se llamaría al servicio de paginación
    // para mostrar información de paginación
  }
  
  /**
   * Obtener configuración
   */
  getConfig() {
    return this.config;
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.paginationConfigManager = new PaginationConfigManager();
});
```

---

### Fase 3: Integración con Generador de PDF

**Archivo a modificar**: `src/app/api/pdf/route.ts`

```typescript
import { PaginatedPDFGenerator } from '@/lib/pdf/paginatedPdfGenerator';
import type { PaginationConfig } from '@/types/paginationConfig';

export async function POST(request: Request) {
  const { ficha, pozo, paginationConfig } = await request.json();
  
  try {
    // Usar configuración personalizada si se proporciona
    const generator = new PaginatedPDFGenerator(paginationConfig);
    
    const result = await generator.generatePaginatedPDF(ficha, pozo, {
      pageNumbers: true,
      includeDate: true,
    });
    
    return new Response(result.blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${result.filename}"`,
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
```

---

## 📝 Checklist de Integración

- [ ] Crear panel de configuración de paginación en HTML
- [ ] Crear panel de encabezados reimprimibles en HTML
- [ ] Crear vista previa de paginación
- [ ] Implementar PaginationConfigManager en JavaScript
- [ ] Guardar configuración en localStorage
- [ ] Cargar configuración al iniciar sesión
- [ ] Integrar con generador de PDF
- [ ] Probar con múltiples pozos
- [ ] Validar paginación automática
- [ ] Validar encabezados reimprimibles
- [ ] Actualizar documentación
- [ ] Hacer commit de cambios

---

## 🚀 Cómo Proceder

### Paso 1: Crear la UI
```bash
# Editar diseñador de fichas/editor.html
# Agregar paneles de configuración
```

### Paso 2: Implementar Lógica
```bash
# Crear diseñador de fichas/js/paginationConfig.js
# Implementar PaginationConfigManager
```

### Paso 3: Integrar con PDF
```bash
# Modificar src/app/api/pdf/route.ts
# Usar PaginatedPDFGenerator con configuración
```

### Paso 4: Probar
```bash
# Crear pozo de prueba
# Generar PDF con diferentes configuraciones
# Verificar paginación y encabezados
```

### Paso 5: Commit
```bash
# git add .
# git commit -m "feat: Integrar paginación con diseñador HTML"
```

---

## 📚 Recursos Disponibles

- `GUIA_PAGINACION_ENCABEZADOS_REIMPRIMIBLES.md` - Guía de paginación
- `GUIA_DISEÑO_CON_AJUSTE_AUTOMATICO.md` - Guía de ajuste
- `src/lib/pdf/paginatedPdfGenerator.example.ts` - Ejemplos de uso
- `src/lib/pdf/layoutAdjustment.example.ts` - Ejemplos de ajuste
- `INSTRUCCIONES_COMMITS_Y_COMENTARIOS.md` - Cómo hacer commits

---

## 💡 Notas Importantes

1. **Almacenamiento Local**: Usar `localStorage` para guardar configuración
2. **Commits**: Hacer commit después de cada fase
3. **Comentarios**: Explicar el "por qué" en el código
4. **Tests**: Actualizar tests si es necesario
5. **Documentación**: Actualizar guías con cambios

---

## ✅ Próxima Sesión

Cuando regreses, puedes:
1. Continuar con la integración del diseñador
2. Implementar la UI de configuración
3. Probar con datos reales
4. Hacer commits de cada cambio

**¡Listo para continuar!** 🚀
