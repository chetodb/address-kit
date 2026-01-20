import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Google } from '../../src/providers/Google.js'

describe('Google', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn())
    })

    it('should throw error if apiKey is missing', () => {
        // @ts-ignore
        expect(() => new Google({})).toThrow('API Key is required')
    })

    it('should resolve and normalize a successful response', async () => {
        const mockResponse = {
            status: 'OK',
            results: [{
                formatted_address: 'Calle Falsa 123, Madrid, Spain',
                address_components: [
                    { long_name: '123', short_name: '123', types: ['street_number'] },
                    { long_name: 'Calle Falsa', short_name: 'Calle Falsa', types: ['route'] },
                    { long_name: 'Madrid', short_name: 'Madrid', types: ['locality', 'political'] },
                    { long_name: 'Madrid', short_name: 'M', types: ['administrative_area_level_2', 'political'] },
                    { long_name: 'Spain', short_name: 'ES', types: ['country', 'political'] },
                    { long_name: '28001', short_name: '28001', types: ['postal_code'] }
                ],
                geometry: {
                    location: { lat: 40.4168, lng: -3.7038 }
                }
            }]
        }

        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => mockResponse
        } as Response)

        const provider = new Google({ apiKey: 'secret' })
        const result = await provider.resolveAddress({ country: 'Spain' })

        expect(result.found).toBe(true)
        expect(result.data?.street).toBe('Calle Falsa')
        expect(result.data?.streetNumber).toBe('123')
        expect(result.data?.countryCode).toBe('ES')
        expect(result.data?.coordinates.lat).toBe(40.4168)
    })

    it('should handle ZERO_RESULTS', async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ status: 'ZERO_RESULTS', results: [] })
        } as Response)

        const provider = new Google({ apiKey: 'secret' })
        const result = await provider.resolveAddress({ country: 'Spain' })

        expect(result.found).toBe(false)
    })

    it('should handle OVER_QUERY_LIMIT', async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({ status: 'OVER_QUERY_LIMIT' })
        } as Response)

        const provider = new Google({ apiKey: 'secret' })
        await expect(provider.resolveAddress({ country: 'Spain' }))
            .rejects.toThrow('Rate limit exceeded')
    })
})
