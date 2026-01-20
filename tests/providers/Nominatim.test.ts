import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Nominatim } from '../../src/providers/Nominatim.js'

describe('Nominatim', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn())
    })

    it('should resolve and normalize a successful response', async () => {
        const mockResponse = [{
            display_name: 'Calle Falsa',
            lat: '40',
            lon: '-3',
            address: { road: 'Calle Falsa', city: 'Madrid', country: 'España', country_code: 'es' }
        }]

        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => mockResponse
        } as Response)

        const provider = new Nominatim()
        const result = await provider.resolveAddress({ country: 'Spain' })

        expect(result.found).toBe(true)
        expect(result.data?.street).toBe('Calle Falsa')
    })

    it('should handle when no results are found', async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => []
        } as Response)

        const provider = new Nominatim()
        const result = await provider.resolveAddress({ country: 'Spain' })

        expect(result.found).toBe(false)
    })

    it('should throw a specific error on Rate Limit (429)', async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: false,
            status: 429,
            statusText: 'Too Many Requests'
        } as Response)

        const provider = new Nominatim()
        await expect(provider.resolveAddress({ country: 'Spain' }))
            .rejects.toThrow('Rate limit exceeded')
    })

    it('should handle network errors', async () => {
        vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'))

        const provider = new Nominatim()
        await expect(provider.resolveAddress({ country: 'Spain' }))
            .rejects.toThrow('Network error')
    })

    it('should queue requests respecting the interval', async () => {
        Nominatim.MIN_INTERVAL = 100

        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => []
        } as Response)

        const provider = new Nominatim()

        const start = Date.now()
        const p1 = provider.resolveAddress({ country: 'Spain' })
        const p2 = provider.resolveAddress({ country: 'France' })

        await Promise.all([p1, p2])
        const duration = Date.now() - start

        expect(duration).toBeGreaterThanOrEqual(100)
        expect(fetch).toHaveBeenCalledTimes(2)
    })
})
