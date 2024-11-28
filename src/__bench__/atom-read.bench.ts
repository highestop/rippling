import { bench, describe } from 'vitest'
import { setupJotaiSetCase, setupJotaiSetCaseWithOutMount, setupRipplingSetCase, setupRipplingSetCaseWithOutMount } from './case'

const { update: updateRippling } = setupRipplingSetCase(6)
const { update: updateJotai } = setupJotaiSetCase(6)
const { update: updateRipplingWithOutMount } = setupRipplingSetCaseWithOutMount(5)
const { update: updateJotaiWithOutMount } = setupJotaiSetCaseWithOutMount(5)

describe('set with mount, 6 layer states, each computed has 10 children', () => {
    bench('rippling', () => {
        updateRippling()
    })

    bench('jotai', () => {
        updateJotai()
    })
})

describe('set without mount, 5 layer states, each computed has 10 children', () => {
    bench('rippling', () => {
        updateRipplingWithOutMount()
    })

    bench('jotai', () => {
        updateJotaiWithOutMount()
    })
})
