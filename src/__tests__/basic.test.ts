import { expect, it } from 'vitest'
import { computed, effect, state } from '..'

it('creates atoms', () => {
  // primitive atom
  const countAtom = state(0)
  const anotherCountAtom = state(1)
  // read-only derived atom
  const doubledCountAtom = computed((get) => get(countAtom) * 2)
  // read-write derived atom
  const sumAtom = computed(
    (get) => get(countAtom) + get(anotherCountAtom)
  )

  const setSumAtom = effect(
    (get, set, value: number) => {
      set(countAtom, get(countAtom) + value / 2)
      set(anotherCountAtom, get(anotherCountAtom) + value / 2)
    }
  )

  // write-only derived atom
  const decrementCountAtom = effect(
    (get, set) => {
      set(countAtom, get(countAtom) - 1)
    }
  )

  expect(countAtom).toMatchInlineSnapshot(`
    {
      "init": 0,
    }
    `)

  expect(doubledCountAtom).toMatchInlineSnapshot(`
    {
      "read": [Function],
    }
    `)

  expect(setSumAtom).toMatchInlineSnapshot(`
    {
      "read": [Function],
      "write": [Function],
    }
    `)

  expect(decrementCountAtom).toMatchInlineSnapshot(`
    {
      "read": [Function],
      "write": [Function],
    }
    `)

  expect(sumAtom).toMatchInlineSnapshot(`
    {
      "read": [Function],
    }
    `)
})
