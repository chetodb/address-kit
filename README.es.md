# AddressKit

Librería de TypeScript para la resolución, normalización y enriquecimiento de direcciones utilizando la API Nominatim de OpenStreetMap.

[Read in English](./README.md)

## Características

- **Resolución de Direcciones**: Transforma datos parciales en información de envío estandarizada.
- **Caché Inteligente**: Caché de memoria LRU integrada con TTL configurable para mejorar el rendimiento y respetar los límites de la API.

## Instalación

```bash
npm install address-kit
```

## Uso Básico

```typescript
import { AddressKit } from 'address-kit';

const kit = new AddressKit();

async function run() {
  const result = await kit.resolve({
    street: 'Gran Vía',
    city: 'Madrid',
    country: 'España'
  });

  if (result.found && result.data) {
    console.log('Dirección:', result.data.formattedAddress);
    console.log('Coordenadas:', result.data.coordinates);
  }
}

run();
```

## Configuración

AddressKit permite personalización en su inicialización:

```typescript
const kit = new AddressKit({
  language: 'es',        // Idioma de los resultados (ISO 639-1)
  cacheTtl: 3600000      // TTL en milisegundos (0 para desactivar)
});
```

### Proveedores Personalizados

Puede implementar la interfaz `GeoProvider` para integrar otros servicios:

```typescript
const kit = new AddressKit({
  provider: 'custom',
  providerInstance: new MiProveedorPersonalizado()
});
```

## Licencia

MIT

## Fuentes de Datos y Atribución

Esta librería utiliza la **API Nominatim** proporcionada por **OpenStreetMap**.
Al usar esta librería, aceptas cumplir con:
- [Política de Uso de Nominatim](https://operations.osmfoundation.org/policies/nominatim/)
- [Requisitos de Atribución de OpenStreetMap](https://www.openstreetmap.org/copyright)

Asegúrate de proporcionar el crédito correspondiente en tu propia aplicación.
