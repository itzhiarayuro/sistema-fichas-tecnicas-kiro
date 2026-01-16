# Fuentes Inter para pdfmake

## Descarga

1. Ve a [Google Fonts - Inter](https://fonts.google.com/specimen/Inter)
2. Click en "Download family"
3. Extrae el ZIP

## Archivos

Google Fonts proporciona Variable Fonts:

```
public/fonts/
├── Inter-VariableFont_opsz,wght.ttf         ✅ (requerido)
├── Inter-Italic-VariableFont_opsz,wght.ttf  ✅ (requerido)
└── README.md
```

## Generar VFS

Después de colocar los archivos, ejecuta:

```bash
npm run build:vfs
```

Esto generará `src/lib/pdf/fonts/vfs_fonts.ts` con las fuentes en base64.

## Variable Fonts

Las Variable Fonts incluyen todos los pesos (100-900) en un solo archivo.
El script automáticamente:
- Usa la Variable Font para normal y bold
- Usa la Variable Font Italic para italics y bolditalics

## Características de Inter

- Números tabulares (alineación perfecta en tablas)
- Soporte UTF-8 completo (tildes, ñ, €, °, µ)
- Legibilidad técnica optimizada
- Licencia OFL (Open Font License)
