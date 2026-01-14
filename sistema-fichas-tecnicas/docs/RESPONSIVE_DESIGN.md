# Responsive Design Guide

## Breakpoints

El sistema utiliza los breakpoints estándar de Tailwind CSS:

```
sm: 640px   - Teléfonos pequeños
md: 768px   - Tablets
lg: 1024px  - Laptops
xl: 1280px  - Desktops
2xl: 1536px - Desktops grandes
```

## Estrategia por Pantalla

### Mobile (<640px)
- **Layout**: Stack vertical
- **Navegación**: Hamburger menu
- **Paneles**: Uno a la vez (tabs o modal)
- **Tablas**: Scroll horizontal o cards
- **Botones**: Full width o grid 2 columnas
- **Tipografía**: Reducida (base 14px)

### Tablet (640px - 1024px)
- **Layout**: 2 columnas cuando sea posible
- **Navegación**: Visible pero compacta
- **Paneles**: 2 paneles lado a lado
- **Tablas**: Scroll horizontal con sticky header
- **Botones**: Tamaño normal
- **Tipografía**: Normal (base 16px)

### Desktop (1024px+)
- **Layout**: 3+ columnas
- **Navegación**: Completa
- **Paneles**: Todos visibles
- **Tablas**: Completas
- **Botones**: Tamaño normal
- **Tipografía**: Normal (base 16px)

## Componentes Responsive

### Dashboard
```
Desktop:
┌─────────────────────────────────────┐
│ Header                              │
├─────────────────────────────────────┤
│ Sidebar │ Main Content              │
│         │ ┌──────────────────────┐  │
│         │ │ Stats Cards          │  │
│         │ ├──────────────────────┤  │
│         │ │ Pozos Table          │  │
│         │ └──────────────────────┘  │
└─────────────────────────────────────┘

Tablet:
┌─────────────────────────────────────┐
│ Header                              │
├─────────────────────────────────────┤
│ Main Content                        │
│ ┌──────────────────────────────────┐│
│ │ Stats Cards (2 cols)             ││
│ ├──────────────────────────────────┤│
│ │ Pozos Table (scroll)             ││
│ └──────────────────────────────────┘│
└─────────────────────────────────────┘

Mobile:
┌─────────────────────────────────────┐
│ Header (hamburger)                  │
├─────────────────────────────────────┤
│ Main Content                        │
│ ┌──────────────────────────────────┐│
│ │ Stats Cards (1 col)              ││
│ ├──────────────────────────────────┤│
│ │ Pozos List (cards)               ││
│ └──────────────────────────────────┘│
└─────────────────────────────────────┘
```

### Editor Visual
```
Desktop:
┌──────────────────────────────────────────┐
│ Toolbar                                  │
├──────────────────────────────────────────┤
│ Sections │ Editor │ Preview              │
│ (25%)    │ (50%)  │ (25%)                │
└──────────────────────────────────────────┘

Tablet:
┌──────────────────────────────────────────┐
│ Toolbar                                  │
├──────────────────────────────────────────┤
│ Sections │ Editor/Preview (tabs)         │
│ (30%)    │ (70%)                         │
└──────────────────────────────────────────┘

Mobile:
┌──────────────────────────────────────────┐
│ Toolbar (compacto)                       │
├──────────────────────────────────────────┤
│ Sections/Editor/Preview (tabs)           │
│ (100%)                                   │
└──────────────────────────────────────────┘
```

### Diseñador de Fichas
```
Desktop:
┌──────────────────────────────────────────┐
│ Toolbar + Drawing Tools                  │
├──────────────────────────────────────────┤
│ Fields │ Canvas │ Properties             │
│ (20%)  │ (60%)  │ (20%)                  │
└──────────────────────────────────────────┘

Tablet:
┌──────────────────────────────────────────┐
│ Toolbar + Drawing Tools (scroll)         │
├──────────────────────────────────────────┤
│ Fields/Canvas/Props (tabs)               │
│ (100%)                                   │
└──────────────────────────────────────────┘

Mobile:
┌──────────────────────────────────────────┐
│ Toolbar (compacto)                       │
├──────────────────────────────────────────┤
│ Fields/Canvas/Props (tabs)               │
│ (100%)                                   │
└──────────────────────────────────────────┘
```

## Patrones Comunes

### Tablas
```tsx
// Desktop: Tabla normal
<table className="hidden lg:table w-full">
  {/* Columnas completas */}
</table>

// Tablet: Scroll horizontal
<div className="hidden md:block lg:hidden overflow-x-auto">
  <table className="w-full">
    {/* Columnas reducidas */}
  </table>
</div>

// Mobile: Cards
<div className="md:hidden space-y-4">
  {data.map(item => (
    <Card key={item.id} {...item} />
  ))}
</div>
```

### Paneles
```tsx
// Desktop: Lado a lado
<div className="flex gap-4">
  <div className="w-1/3">Panel 1</div>
  <div className="w-2/3">Panel 2</div>
</div>

// Tablet: Uno debajo del otro
<div className="md:flex md:gap-4">
  <div className="md:w-1/3">Panel 1</div>
  <div className="md:w-2/3">Panel 2</div>
</div>

// Mobile: Stack vertical
<div className="space-y-4">
  <div>Panel 1</div>
  <div>Panel 2</div>
</div>
```

### Navegación
```tsx
// Desktop: Sidebar
<div className="flex">
  <nav className="w-64 bg-gray-100">
    {/* Links */}
  </nav>
  <main className="flex-1">
    {/* Content */}
  </main>
</div>

// Mobile: Hamburger
<div>
  <button onClick={() => setOpen(!open)}>☰</button>
  {open && (
    <nav className="fixed inset-0 bg-white">
      {/* Links */}
    </nav>
  )}
  <main>{/* Content */}</main>
</div>
```

## Testing Responsive

### Herramientas
- Chrome DevTools (F12 → Toggle device toolbar)
- Firefox Responsive Design Mode (Ctrl+Shift+M)
- Safari Responsive Design Mode (Cmd+Ctrl+R)

### Breakpoints a Probar
- 375px (iPhone SE)
- 768px (iPad)
- 1024px (iPad Pro)
- 1280px (Laptop)
- 1920px (Desktop)

### Checklist
- [ ] Navegación funciona en todos los tamaños
- [ ] Texto es legible (min 14px en mobile)
- [ ] Botones son clickeables (min 44x44px)
- [ ] Imágenes se escalan correctamente
- [ ] No hay scroll horizontal innecesario
- [ ] Espaciado es consistente
- [ ] Formularios son usables en mobile
- [ ] Modales se adaptan al tamaño

## Performance

### Optimizaciones
- Lazy load de imágenes
- Code splitting por ruta
- Minificación de CSS
- Compresión de imágenes
- Caché de assets estáticos

### Métricas
- First Contentful Paint (FCP): <1.8s
- Largest Contentful Paint (LCP): <2.5s
- Cumulative Layout Shift (CLS): <0.1
- Time to Interactive (TTI): <3.8s

## Accesibilidad

### Mobile
- Touch targets mínimo 44x44px
- Suficiente contraste (WCAG AA)
- Navegación por teclado funcional
- Screen reader compatible

### Orientación
- Soportar portrait y landscape
- No forzar orientación
- Adaptar layout según orientación

## Ejemplos de Uso

### Componente Responsive
```tsx
export function ResponsiveComponent() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Cards que se adaptan */}
      <Card />
      <Card />
      <Card />
    </div>
  );
}
```

### Ocultar/Mostrar Elementos
```tsx
export function AdaptiveUI() {
  return (
    <>
      {/* Solo en mobile */}
      <div className="md:hidden">Mobile Menu</div>
      
      {/* Solo en tablet y desktop */}
      <div className="hidden md:block">Desktop Menu</div>
      
      {/* Solo en desktop */}
      <div className="hidden lg:block">Sidebar</div>
    </>
  );
}
```

## Recursos

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [MDN Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Web.dev Responsive Web Design Basics](https://web.dev/responsive-web-design-basics/)
