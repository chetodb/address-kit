import { AddressKit } from '../src/index.js'

async function run() {
    const kit = new AddressKit()

    try {
        const result = await kit.resolve({
            street: 'Gran Vía',
            city: 'Madrid',
            country: 'España'
        })

        if (result.found && result.data) {
            console.log('Full address:', result.data.formattedAddress)
        }

        // Repetimos la misma búsqueda para probar la caché
        const start = Date.now()
        await kit.resolve({ street: 'Gran Vía', city: 'Madrid', country: 'España' })
        console.log('Cache:', Date.now() - start, 'ms')

    } catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : error)
    }
}

run()
