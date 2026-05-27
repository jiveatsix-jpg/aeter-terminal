# Bulk Import to Library — Quick Fill Masivo

Añadir un modal de **importación masiva** que permita al usuario pegar un bloque de texto con múltiples entries (generado por una IA o manualmente) y crear automáticamente todas las entradas en la biblioteca.

## Flujo de Uso

1. El usuario abre el modal **BULK IMPORT**
2. Elige el modo de la plantilla (TEXTO, ARTIST, etc.) → **COPY** copia la plantilla al clipboard
3. Envía la plantilla + sus datos en bruto a una IA
4. La IA devuelve un bloque formateado con N entries separadas por `---`
5. El usuario pega el bloque en el textarea izquierdo → **IMPORT**
6. La app parsea cada entry, genera hash, crea las entradas en la biblioteca
7. El usuario luego edita, genera PNGs, etc. desde la biblioteca

## Formato de Entrada

Cada entry separada por `---` en línea propia. Todas del **mismo modo** (una plantilla por modo):

```
MODE: TEXTO
ID: #001
TITLE: El Arte de la Guerra
MAKER: Sun Tzu
CATEGORY: [LIBRO]
DATE: 500 AC
REGION: East Asia
OPERATIVE_NOTES: Tratado militar clásico
ACTIVE_LINK: https://example.com/libro1
---
MODE: TEXTO
ID: #002
TITLE: Dune
MAKER: Frank Herbert
CATEGORY: [LIBRO]
DATE: 1965
REGION: North America
OPERATIVE_NOTES: Ciencia ficción clásica
ACTIVE_LINK: https://example.com/dune
```

## Proposed Changes

### [MODIFY] [AETHER_TERMINAL.html](file:///C:/Users/ander/Desktop/Proyecto%20Aeter/Logística%20de%20Información%20y%20Activos%20(LIA)/04_INDEX_DB/UPDATED/AETHER_TERMINAL.html)

---

### 1. CSS — Nuevos estilos

```css
/* BULK IMPORT MODAL */
#bulk-modal { /* reutiliza patrón de #qf-modal */ }

/* 4 rectángulos de colores por modo */
.bulk-mode-card {
  border: 1px solid;
  padding: 8px 10px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

/* Colores por modo */
.bulk-card-TEXTO     { color: #33ff00; border-color: #33ff00; }
.bulk-card-ARTIST    { color: #ff00ff; border-color: #ff00ff; }
.bulk-card-ARTEFACTO { color: #ffff00; border-color: #ffff00; }
.bulk-card-SOFTWARE  { color: #00ccff; border-color: #00ccff; }
```

### 2. HTML — Modal `#bulk-modal`

Layout de dos columnas:

**Columna izquierda** — Input:
- Hint text explicativo
- Textarea grande para pegar datos (múltiples entries)
- Botones: `⟩ IMPORT` + `✕ CANCEL`

**Columna derecha** — Plantillas por modo:

```
┌──────────────────────────────────────────┐
│  [ AI TEMPLATES ]                        │
│                                          │
│  ┌─ #33ff00 ──────────────────────────┐  │
│  │  ■ TEXT          [COPY] [VIEW]     │  │
│  └────────────────────────────────────┘  │
│  ┌─ #ff00ff ──────────────────────────┐  │
│  │  ◆ ARTIST        [COPY] [VIEW]    │  │
│  └────────────────────────────────────┘  │
│  ┌─ #ffff00 ──────────────────────────┐  │
│  │  ▲ ARTIFACT      [COPY] [VIEW]    │  │
│  └────────────────────────────────────┘  │
│  ┌─ #00ccff ──────────────────────────┐  │
│  │  ▶ SOFTWARE      [COPY] [VIEW]    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌─ Vista de plantilla (toggle) ──────┐  │
│  │  (se muestra la plantilla del      │  │
│  │   modo seleccionado con VIEW)      │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

> [!IMPORTANT]
> **COPY** → copia la plantilla del modo directamente al clipboard (sin mostrarla).
> **VIEW** → muestra/oculta la plantilla en un área de preview debajo de los 4 rectángulos. Solo una plantilla visible a la vez (toggle).

### 3. JavaScript — Nuevas funciones

| Función | Descripción |
|---------|-------------|
| `openBulkImport()` | Abre modal |
| `closeBulkImport()` | Cierra modal |
| `buildModeTemplate(mode)` | Genera texto de plantilla con 2 entries de ejemplo para el modo dado |
| `copyBulkTemplate(mode)` | Genera la plantilla del modo y la copia al clipboard + toast |
| `viewBulkTemplate(mode)` | Muestra/oculta la plantilla del modo en el área de preview |
| `parseBulkImport()` | Divide texto por `---`, parsea cada bloque, crea entries en la biblioteca |

**Lógica de `buildModeTemplate(mode)`:**
- Header con instrucciones para la IA
- 2 entries de ejemplo del modo seleccionado, separadas por `---`
- Cada entry incluye TODOS los campos del modo (de `MODE_FIELDS[mode]`) + NOTES + LINK

**Lógica de `parseBulkImport()`:**
```
1. Split text by líneas que solo contienen '---'
2. Filtrar bloques vacíos
3. Para cada bloque:
   a. Parsear key-value (misma lógica que Quick Fill)
   b. Determinar MODE (default: currentMode)
   c. Mapear campos a MODE_FIELDS[mode]
   d. Generar hash con generateHash(field1, field2)
   e. Crear entry:
      {
        mode, fields, notas, enlace, hash,
        assetId, fileHash: 'N/A',
        savedAt: now, _savedTs: Date.now() + i,
        assetName: firstFieldValue,
        category: parsedCategory || 'BULK_IMPORT'
      }
   f. Push a library[]
4. updateMemCount(), renderLibrary()
5. Toast: "X ASSETS IMPORTED"
6. Auto-switch a Library view
```

### 4. Botón de activación

En `#lib-search-wrap` (library view), añadir botón **⚡ BULK** junto al sort select:

```html
<button id="bulk-btn" class="btn-action btn-sync" onclick="openBulkImport()">
  ⚡ BULK IMPORT
</button>
```

## Decisiones de Diseño

| Decisión | Razón |
|----------|-------|
| **4 tarjetas separadas por color** | Cada modo con su identidad visual, imposible confundir campos |
| **COPY sin mostrar** | Flujo rápido: copia → pega al AI → recibe respuesta |
| **VIEW toggle** | Solo muestra una plantilla a la vez, sin clutter |
| **Separador `---`** | Estándar, limpio, fácil para cualquier IA |
| **Category fallback `BULK_IMPORT`** | Identifica fácilmente qué vino de import masivo |
| **Colores de MODE_CFG** | Consistencia con el sistema de modos existente |

## Verification Plan

### Manual Verification
1. Abrir Library → click BULK IMPORT
2. Verificar los 4 rectángulos con colores correctos
3. Click COPY en TEXT → verificar que clipboard tiene plantilla correcta
4. Click VIEW en ARTIST → verificar que se muestra plantilla con campos de ARTIST
5. Pegar un bloque con 3+ entries → click IMPORT
6. Verificar que todas aparecen en la biblioteca con datos correctos
7. Cargar una entry → verificar campos → generar PNG
