import { GeoProvider, AddressQuery, AddressSearchResult, AddressKitConfig, SupportedProvider } from './types.js'
import { Nominatim } from '../providers/Nominatim.js'
import { Google } from '../providers/Google.js'
import { CacheProvider } from './CacheProvider.js'

export class AddressKit {
    private static readonly DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days

    private provider: GeoProvider

    constructor(config: AddressKitConfig = {}) {
        const providerName = config.provider || 'Nominatim'
        const baseProvider = this.createProvider(providerName, config)

        const ttl = config.cacheTtl ?? AddressKit.DEFAULT_TTL

        if (ttl > 0) {
            this.provider = new CacheProvider(baseProvider, ttl)
        } else {
            this.provider = baseProvider
        }
    }

    private createProvider(type: SupportedProvider, config: AddressKitConfig): GeoProvider {
        switch (type) {
            case 'Nominatim':
                return new Nominatim({
                    language: config.language
                })

            case 'Google':
                return new Google({
                    apiKey: config.apiKey || '',
                    language: config.language
                })

            case 'custom':
                if (!config.providerInstance) {
                    throw new Error('AddressKit: Invalid config. You must provide "providerInstance" when using provider="custom".')
                }
                return config.providerInstance

            default:
                return new Nominatim({
                    language: config.language
                })
        }
    }

    /**
     * Replace the active provider at runtime.
     * @param provider New provider instance to use.
     */
    setProvider(provider: GeoProvider): void {
        this.provider = provider
    }

    /**
     * Resolve, enrich and validate an address.
     * @param query Address data to search (street, city, postal code...).
     * @returns Promise with the enriched and validated result.
     */
    async resolve(query: AddressQuery): Promise<AddressSearchResult> {
        if (!query.country) {
            throw new Error('AddressKit: The "country" field is required.')
        }
        return this.provider.resolveAddress(query)
    }
}
