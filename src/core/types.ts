export interface Address {
    street: string
    streetNumber?: string
    city: string
    state?: string
    postalCode?: string
    country: string
    countryCode: string
    coordinates: {
        lat: number
        lon: number
    }
    formattedAddress: string
}

/**
 * Parámetros de búsqueda. 
 * El país es obligatorio para garantizar la precisión.
 */
export interface AddressQuery {
    street?: string
    city?: string
    postalCode?: string
    country: string
    state?: string
}

/**
 * Respuesta del servicio de resolución.
 */
export interface AddressSearchResult {
    found: boolean
    data?: Address
}

/**
 * Interfaz base para implementar nuevos proveedores de geocodificación.
 */
export interface GeoProvider {
    name: string
    resolveAddress(query: AddressQuery): Promise<AddressSearchResult>
}

/** Proveedores soportados oficialmente o modo personalizado */
export type SupportedProvider = 'Nominatim' | 'custom'

/**
 * Configuración global de la librería.
 */
export interface AddressKitConfig {
    provider?: SupportedProvider
    language?: string
    cacheTtl?: number
    providerInstance?: GeoProvider
}