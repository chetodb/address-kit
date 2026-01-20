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
 * Search parameters.
 * Country is required to ensure accuracy.
 */
export interface AddressQuery {
    street?: string
    city?: string
    postalCode?: string
    country: string
    state?: string
}

/**
 * Resolution service response.
 */
export interface AddressSearchResult {
    found: boolean
    data?: Address
}

/**
 * Base interface for implementing new geocoding providers.
 */
export interface GeoProvider {
    name: string
    resolveAddress(query: AddressQuery): Promise<AddressSearchResult>
}

/** Officially supported providers or custom mode */
export type SupportedProvider = 'Nominatim' | 'Google' | 'custom'

/**
 * Global library configuration.
 */
export interface AddressKitConfig {
    provider?: SupportedProvider
    language?: string
    cacheTtl?: number
    providerInstance?: GeoProvider
    apiKey?: string
}