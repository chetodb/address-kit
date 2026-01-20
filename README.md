# AddressKit

TypeScript library for address resolution, normalization, and enrichment using OpenStreetMap's Nominatim API.

[Leer en Español](./README.es.md)

## Features

- **Address Resolution**: Transforms partial input into standardized shipping data.
- **Smart Caching**: Built-in LRU memory cache with configurable TTL to improve performance and respect API limits.

## Installation

```bash
npm install address-kit
```

## Basic Usage

```typescript
import { AddressKit } from 'address-kit';

const kit = new AddressKit();

async function run() {
  const result = await kit.resolve({
    street: 'Gran Vía',
    city: 'Madrid',
    country: 'Spain'
  });

  if (result.found && result.data) {
    console.log('Address:', result.data.formattedAddress);
    console.log('Coordinates:', result.data.coordinates);
  }
}

run();
```

## Configuration

AddressKit can be initialized with custom options:

```typescript
const kit = new AddressKit({
  language: 'en',        // Result language (ISO 639-1)
  cacheTtl: 3600000      // TTL in milliseconds (0 to disable)
});
```

### Google Maps Provider

To use Google Maps, you'll need an API Key:

```typescript
const kit = new AddressKit({
  provider: 'Google',
  apiKey: 'YOUR_GOOGLE_MAPS_API_KEY'
});
```

### Custom Providers

You can implement the `GeoProvider` interface to use other services:

```typescript
const kit = new AddressKit({
  provider: 'custom',
  providerInstance: new YourCustomProvider()
});
```

## License

MIT

## Data Sources and Attribution

This library uses the **Nominatim API** provided by **OpenStreetMap**. 
By using this library, you agree to comply with:
- [Nominatim Usage Policy](https://operations.osmfoundation.org/policies/nominatim/)
- [OpenStreetMap Attribution Requirements](https://www.openstreetmap.org/copyright)

Please ensure you provide appropriate credit in your own application.
