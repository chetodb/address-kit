import { GeoProvider, AddressQuery, AddressSearchResult, AddressKitConfig, SupportedProvider } from './types.js'
import { Nominatim } from '../providers/Nominatim.js'
import { CacheProvider } from './CacheProvider.js'

export class AddressKit {
    private provider: GeoProvider
    private DEFAULT_TTL: number = 1000 * 60 * 60 * 24 * 7

    constructor(config: AddressKitConfig = {}) {
        const providerName = config.provider || 'Nominatim'
        const baseProvider = this.createProvider(providerName, config)

        const ttl = config.cacheTtl ?? this.DEFAULT_TTL

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

            case 'custom':
                if (!config.providerInstance) {
                    throw new Error('Configuración inválida: Debe proporcionar "providerInstance" cuando usa provider="custom"')
                }
                return config.providerInstance

            default:
                return new Nominatim({
                    language: config.language
                })
        }
    }

    /**
     * Cambia el proveedor activo en tiempo de ejecución.
     * @param provider Nueva instancia de proveedor a utilizar.
     */
    setProvider(provider: GeoProvider): void {
        this.provider = provider
    }

    /**
     * Busca, obtiene y verifica una dirección.
     * @param query Datos de la dirección a buscar (calle, ciudad, CP...).
     * @returns Promesa con el resultado enriquecido y validado.
     */
    async resolve(query: AddressQuery): Promise<AddressSearchResult> {
        if (!query.country) {
            throw new Error('AddressKit: El campo "country" es obligatorio para realizar una búsqueda.')
        }
        return this.provider.resolveAddress(query)
    }
}
