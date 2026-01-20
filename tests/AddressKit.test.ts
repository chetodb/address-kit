import { describe, expect, it, vi } from 'vitest'
import { AddressKit, AddressQuery, AddressSearchResult, GeoProvider } from '../src/index.js'

class MockGeoProvider implements GeoProvider {
    name = 'mock'
    async resolveAddress(_query: AddressQuery): Promise<AddressSearchResult> {
        return {
            found: true,
            data: {
                street: 'Calle Falsa',
                city: 'Valencia',
                country: 'Spain',
                countryCode: 'ES',
                coordinates: { lat: 40, lon: -3 },
                formattedAddress: 'Calle Falsa 123, Valencia, Spain'
            }
        }
    }
}

describe('AddressKit', () => {
    it('should resolve an address using an injected provider', async () => {
        const kit = new AddressKit()
        kit.setProvider(new MockGeoProvider())

        const result = await kit.resolve({ country: 'Spain' })

        expect(result.found).toBe(true)
        expect(result.data?.street).toBe('Calle Falsa')
    })

    it('should fail if country is not provided', async () => {
        const kit = new AddressKit()
        // @ts-ignore
        await expect(kit.resolve({})).rejects.toThrow('"country" field is required')
    })

    it('should instantiate correctly with a custom provider', async () => {
        const kit = new AddressKit({
            provider: 'custom',
            providerInstance: new MockGeoProvider()
        })

        const result = await kit.resolve({ country: 'Spain' })
        expect(result.found).toBe(true)
    })

    it('should throw error if providerInstance is missing in custom mode', () => {
        expect(() => new AddressKit({ provider: 'custom' }))
            .toThrow('providerInstance')
    })

    it('should use cache by default (7 days)', async () => {
        const provider = new MockGeoProvider()
        const spy = vi.spyOn(provider, 'resolveAddress')

        const kit = new AddressKit({
            provider: 'custom',
            providerInstance: provider
        })

        await kit.resolve({ country: 'France' })
        await kit.resolve({ country: 'France' })

        expect(spy).toHaveBeenCalledTimes(1)
    })
})
