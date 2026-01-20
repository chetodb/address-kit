import { AddressQuery, AddressSearchResult, GeoProvider, Address } from '../core/types.js'

export interface GoogleOptions {
    apiKey: string
    language?: string
}

interface GoogleResponse {
    results: Array<{
        address_components: Array<{
            long_name: string
            short_name: string
            types: string[]
        }>
        formatted_address: string
        geometry: {
            location: {
                lat: number
                lng: number
            }
        }
    }>
    status: string
    error_message?: string
}

export class Google implements GeoProvider {
    private static readonly BASE_URL = 'https://maps.googleapis.com/maps/api/geocode/json'

    public readonly name = 'Google'
    private readonly apiKey: string
    private readonly language: string

    constructor(options: GoogleOptions) {
        if (!options.apiKey) {
            throw new Error('AddressKit [Google]: API Key is required for Google provider.')
        }
        this.apiKey = options.apiKey
        this.language = options.language || 'es'
    }

    async resolveAddress(query: AddressQuery): Promise<AddressSearchResult> {
        const params = this.buildParams(query)

        try {
            const response = await fetch(`${Google.BASE_URL}?${params.toString()}`)

            if (!response.ok) {
                throw new Error(`AddressKit [Google]: API returned an error (${response.status}: ${response.statusText}).`)
            }

            const data: GoogleResponse = await response.json()

            if (data.status === 'ZERO_RESULTS') {
                return { found: false }
            }

            if (data.status === 'OVER_QUERY_LIMIT') {
                throw new Error('AddressKit [Google]: Rate limit exceeded.')
            }

            if (data.status !== 'OK') {
                throw new Error(`AddressKit [Google]: API error (${data.status}). ${data.error_message || ''}`)
            }

            return {
                found: true,
                data: this.normalize(data.results[0])
            }
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.startsWith('AddressKit')) throw error
                throw new Error(`AddressKit [Google]: ${error.message}`)
            }
            throw new Error('AddressKit [Google]: Unexpected error during resolution.')
        }
    }

    private buildParams(query: AddressQuery): URLSearchParams {
        const addressParts = []
        if (query.street) addressParts.push(query.street)
        if (query.city) addressParts.push(query.city)
        if (query.state) addressParts.push(query.state)

        const components = []
        components.push(`country:${query.country}`)
        if (query.postalCode) components.push(`postal_code:${query.postalCode}`)

        const params = new URLSearchParams({
            address: addressParts.join(', '),
            components: components.join('|'),
            language: this.language,
            key: this.apiKey
        })

        return params
    }

    private normalize(result: GoogleResponse['results'][0]): Address {
        const components = result.address_components

        const getComponent = (types: string[]) =>
            components.find(c => types.every(t => c.types.includes(t)))?.long_name || ''

        const getCountryCode = () =>
            components.find(c => c.types.includes('country'))?.short_name || ''

        return {
            street: getComponent(['route']) || getComponent(['establishment']) || '',
            streetNumber: getComponent(['street_number']),
            city: getComponent(['locality']) || getComponent(['administrative_area_level_2']) || '',
            state: getComponent(['administrative_area_level_1']),
            postalCode: getComponent(['postal_code']),
            country: getComponent(['country']),
            countryCode: getCountryCode().toUpperCase(),
            coordinates: {
                lat: result.geometry.location.lat,
                lon: result.geometry.location.lng
            },
            formattedAddress: result.formatted_address
        }
    }
}
