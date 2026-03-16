# ✂️ Arturo Juárez — Estilista

**Barbería premium en Acapulco y Ciudad de México.**

> "Donde el Estilo se Convierte en Arte"

## 📁 Estructura

```
arturo-juarez-estilista/
├── index.html          # Página principal — hero, servicios, reconocimientos
├── calendario.html     # Sistema de calendario y agenda de citas
├── sucursales.html     # Información de sucursales (Acapulco + CDMX)
├── style.css           # Estilos completos — dark navy + gold theme
├── app.js              # Funcionalidad del calendario + interacciones
└── README.md           # Este archivo
```

## 🎨 Diseño

- **Paleta:** Dark navy (#1a2332) + Gold (#c9a050)
- **Tipografía:** Playfair Display (headings) + Inter (body) + Cormorant Garamond (accents)
- **Estilo:** Barbería premium, masculino, sofisticado — inspirado en mrwinstons.com
- **Responsive:** Mobile-first, adaptable a todos los dispositivos

## 📅 Sistema de Calendario

La pieza clave del sitio. Funcionalidades:

- **Vista mensual** con navegación prev/next
- **Tabs por sucursal:** Acapulco | CDMX
- **Estados por día:** Disponible (verde), Ocupado (rojo), Vacaciones (morado), Viaje (naranja)
- **Slots de tiempo:** 9 AM a 8 PM en intervalos de 1 hora
- **Vista Admin:** Control total de calendario, notas, estados
- **Vista Cliente:** Solo muestra disponibilidad, con botón de WhatsApp para reservar
- **Planificador de vacaciones:** Seleccionar rangos de fechas
- **Estadísticas:** Días por ciudad, vacaciones, slots disponibles
- **Persistencia:** localStorage (sin backend necesario)

## 💰 Servicios y Precios (MXN)

| Servicio | Precio |
|----------|--------|
| Corte Clásico | $350 |
| Corte + Barba | $500 |
| Afeitado Clásico | $400 |
| Recorte de Barba | $250 |
| Fade / Degradado | $400 |
| Corte Infantil | $250 |
| Tratamiento Capilar | $600 |
| Tinte / Grey Blending | $550 |
| Cera de Cejas | $150 |
| Paquete VIP | $900 |

## 🏠 Sucursales

- **Acapulco, Guerrero** (principal) — Av. Costera Miguel Alemán #123
- **Ciudad de México** — Calle Masaryk #456, Col. Polanco

## 🚀 Uso

Sitio estático — solo abrir `index.html` en cualquier navegador. No requiere servidor, build tools, ni dependencias.

Para desarrollo local:
```bash
# Python
python3 -m http.server 8000

# Node
npx serve .
```

## 📝 Próximos Pasos

- [ ] Agregar imágenes reales del local y del equipo
- [ ] Embeds de Google Maps en sucursales
- [ ] Integración con WhatsApp Business API
- [ ] Backend para persistencia de citas (Supabase/Firebase)
- [ ] Sistema de notificaciones por SMS/WhatsApp
- [ ] Galería de trabajos realizados
