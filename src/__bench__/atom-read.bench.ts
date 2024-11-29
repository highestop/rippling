import { bench, describe } from 'vitest'
import { setupJotaiSetCase, setupJotaiSetCaseWithoutMount, setupRipplingSetCase, setupRipplingSetCaseWithoutMount, setupRipplingSetCaseWithoutNotify } from './case'

const PROP_GRAPH_DEPTH = 5
const { update: updateRippling } = setupRipplingSetCase(PROP_GRAPH_DEPTH)
const { update: updateJotai } = setupJotaiSetCase(PROP_GRAPH_DEPTH)
const { update: updateRipplingWithoutMount } = setupRipplingSetCaseWithoutMount(PROP_GRAPH_DEPTH)
const { update: updateJotaiWithoutMount } = setupJotaiSetCaseWithoutMount(PROP_GRAPH_DEPTH)
const { update: updateRipplingWithoutNotify } = setupRipplingSetCaseWithoutNotify(PROP_GRAPH_DEPTH)

describe(`set with mount, ${String(PROP_GRAPH_DEPTH)} layer states, each computed has 10 children`, () => {
    bench('rippling', () => {
        updateRippling()
    }, { time: 1000 })

    bench('jotai', () => {
        updateJotai()
    }, { time: 1000 })
})

describe(`set without notify, ${String(PROP_GRAPH_DEPTH)} layer states, each computed has 10 children`, () => {
    bench('rippling', () => {
        updateRipplingWithoutNotify()
    })

    bench('jotai', () => {
        updateJotai()
    })
})

describe(`set without mount, ${String(PROP_GRAPH_DEPTH)} layer states, each computed has 10 children`, () => {
    bench('rippling', () => {
        updateRipplingWithoutMount()
    })

    bench('jotai', () => {
        updateJotaiWithoutMount()
    })
})
