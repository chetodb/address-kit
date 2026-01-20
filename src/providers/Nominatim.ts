import { AddressQuery, AddressSearchResult, GeoProvider, Address } from '../core/types.js'

export interface NominatimOptions {
    language?: string
}

interface NominatimResponse {
    lat: string
    lon: string
    display_name: string
    address: Record<string, string>
}

export class Nominatim implements GeoProvider {
    private static readonly BASE_URL = 'https://nominatim.openstreetmap.org/search'
    private static readonly USER_AGENT = 'AddressKit-Library/1.0'

    private static lastRequest: Promise<void> = Promise.resolve()
    public static MIN_INTERVAL = 1000

    public readonly name = 'Nominatim'
    private readonly language: string

    constructor(options: NominatimOptions = {}) {
        this.language = options.language || 'es'
    }

    async resolveAddress(query: AddressQuery): Promise<AddressSearchResult> {
        const wait = Nominatim.lastRequest
            .catch(() => { })
            .then(() => new Promise<void>(resolve => setTimeout(resolve, Nominatim.MIN_INTERVAL)))

        Nominatim.lastRequest = wait

        await wait
        return this.executeRequest(query)
    }

    private async executeRequest(query: AddressQuery): Promise<AddressSearchResult> {
        const params = this.buildParams(query)

        try {
            const response = await fetch(`${Nominatim.BASE_URL}?${params.toString()}`, {
                headers: {
                    'User-Agent': Nominatim.USER_AGENT,
                    'Accept-Language': this.language
                }
            })

            if (response.status === 429) {
                throw new Error('AddressKit [Nominatim]: Rate limit exceeded. Please wait a few seconds before retrying.')
            }

            if (!response.ok) {
                throw new Error(`AddressKit [Nominatim]: API returned an error (${response.status}: ${response.statusText}).`)
            }

            const data = await response.json()

            if (!Array.isArray(data) || data.length === 0) {
                return { found: false }
            }

            return {
                found: true,
                data: this.normalize(data[0])
            }
        } catch (error) {
            if (error instanceof Error) {
                if (error.message.startsWith('AddressKit')) throw error

                if (error.name === 'TypeError') {
                    throw new Error('AddressKit [Nominatim]: Network error. Could not contact OpenStreetMap.')
                }

                throw new Error(`AddressKit [Nominatim]: ${error.message}`)
            }
            throw new Error('AddressKit [Nominatim]: Unexpected error during resolution.')
        }
    }

    private buildParams(query: AddressQuery): URLSearchParams {
        const params = new URLSearchParams({
            format: 'json',
            addressdetails: '1',
            limit: '1',
            country: query.country
        })

        if (query.street) params.append('street', query.street)
        if (query.city) params.append('city', query.city)
        if (query.postalCode) params.append('postalcode', query.postalCode)
        if (query.state) params.append('state', query.state)

        return params
    }

    private normalize(raw: NominatimResponse): Address {
        const addr = raw.address || {}

        const street = addr.road || addr.pedestrian || addr.footway ||
            addr.path || addr.street || addr.square || addr.cycleway || ''

        const city = addr.city || addr.town || addr.village || addr.hamlet ||
            addr.municipality || addr.city_district || addr.suburb || ''

        return {
            street: street.trim(),
            streetNumber: addr.house_number,
            city: city.trim(),
            state: addr.state || addr.region || addr.province || addr.county,
            postalCode: addr.postcode,
            country: addr.country || '',
            countryCode: (addr.country_code || '').toUpperCase(),
            coordinates: {
                lat: parseFloat(raw.lat),
                lon: parseFloat(raw.lon)
            },
            formattedAddress: raw.display_name
        }
    }
}
