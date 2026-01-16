import { GeoProvider, AddressQuery, AddressSearchResult } from './types.js'

interface CacheEntry {
    data: AddressSearchResult
    timestamp: number
}

export class CacheProvider implements GeoProvider {
    private cache = new Map<string, CacheEntry>()
    private wrappedProvider: GeoProvider
    private ttl: number
    private maxSize: number

    /**
     * @param provider El proveedor real a consultar
     * @param ttlMs Tiempo de vida de la caché en milisegundos
     * @param maxSize Número máximo de elementos en caché (Default: 100)
     */
    constructor(provider: GeoProvider, ttlMs: number, maxSize: number = 100) {
        this.wrappedProvider = provider
        this.ttl = ttlMs
        this.maxSize = maxSize
    }

    get name(): string {
        return `${this.wrappedProvider.name}-cached`
    }

    async resolveAddress(query: AddressQuery): Promise<AddressSearchResult> {
        const key = this.generateCacheKey(query)
        const now = Date.now()

        if (this.cache.has(key)) {
            const entry = this.cache.get(key)!

            if (now - entry.timestamp < this.ttl) {
                this.cache.delete(key)
                this.cache.set(key, entry)

                return structuredClone(entry.data)
            }

            this.cache.delete(key)
        }

        const result = await this.wrappedProvider.resolveAddress(query)

        if (result.found) { this.setCache(key, result, now) }

        return result
    }

    // Guarda en cache. Si la caché está llena, borra el más antiguo
    private setCache(key: string, data: AddressSearchResult, timestamp: number) {
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value
            if (firstKey) this.cache.delete(firstKey)
        }

        this.cache.set(key, { data, timestamp })
    }

    // Genera una clave única para la consulta
    private generateCacheKey(query: AddressQuery): string {
        return Object.entries(query)
            .filter(([_, value]) => !!value)
            .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
            .map(([key, value]) => `${key}:${String(value).trim().toLowerCase()}`)
            .join('|')
    }
}