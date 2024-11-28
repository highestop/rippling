import { bench, describe } from 'vitest'
import { setupJotaiSetCase, setupJotaiSetCaseWithOutMount, setupRipplingSetCase, setupRipplingSetCaseWithOutMount } from './case'

const PROP_GRAPH_DEPTH = 4
const { update: updateRippling } = setupRipplingSetCase(PROP_GRAPH_DEPTH)
const { update: updateJotai } = setupJotaiSetCase(PROP_GRAPH_DEPTH)
const { update: updateRipplingWithOutMount } = setupRipplingSetCaseWithOutMount(PROP_GRAPH_DEPTH)
const { update: updateJotaiWithOutMount } = setupJotaiSetCaseWithOutMount(PROP_GRAPH_DEPTH)

describe(`set with mount, ${String(PROP_GRAPH_DEPTH)} layer states, each computed has 10 children`, () => {
    bench('rippling', () => {
        updateRippling()
    })

    bench('jotai', () => {
        updateJotai()
    })
})

describe(`set without mount, ${String(PROP_GRAPH_DEPTH)} layer states, each computed has 10 children`, () => {
    bench('rippling', () => {
        updateRipplingWithOutMount()
    })

    bench('jotai', () => {
        updateJotaiWithOutMount()
    })
})
