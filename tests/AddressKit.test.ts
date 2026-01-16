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
    it('debería resolver una dirección usando un provider inyectado', async () => {
        const kit = new AddressKit()
        kit.setProvider(new MockGeoProvider())

        const result = await kit.resolve({ country: 'Spain' })

        expect(result.found).toBe(true)
        expect(result.data?.street).toBe('Calle Falsa')
    })

    it('debería fallar si no se indica el país', async () => {
        const kit = new AddressKit()
        // @ts-ignore
        await expect(kit.resolve({})).rejects.toThrow('campo "country" es obligatorio')
    })

    it('debería instanciarse correctamente con un proveedor custom', async () => {
        const kit = new AddressKit({
            provider: 'custom',
            providerInstance: new MockGeoProvider()
        })

        const result = await kit.resolve({ country: 'Spain' })
        expect(result.found).toBe(true)
    })

    it('debería lanzar error si falta la instancia en modo custom', () => {
        expect(() => new AddressKit({ provider: 'custom' }))
            .toThrow('Debe proporcionar "providerInstance"')
    })

    it('debería usar la caché por defecto (7 días)', async () => {
        const provider = new MockGeoProvider()
        const spy = vi.spyOn(provider, 'resolveAddress')

        const kit = new AddressKit({
            provider: 'custom',
            providerInstance: provider
        })

        // Primera llamada: consulta al provider
        await kit.resolve({ country: 'France' })
        // Segunda llamada: viene de caché
        await kit.resolve({ country: 'France' })

        expect(spy).toHaveBeenCalledTimes(1)
    })
})
