import { expect, it } from 'vitest'
import { $computed, $effect, $value } from '..'

it('creates atoms', () => {
  // primitive atom
  const countAtom = $value(0)
  const anotherCountAtom = $value(1)
  // read-only derived atom
  const doubledCountAtom = $computed((get) => get(countAtom) * 2)
  // read-write derived atom
  const sumAtom = $computed(
    (get) => get(countAtom) + get(anotherCountAtom)
  )

  const setSumAtom = $effect(
    (get, set, num: number) => {
      set(countAtom, get(countAtom) + num / 2)
      set(anotherCountAtom, get(anotherCountAtom) + num / 2)
    }
  )

  // write-only derived atom
  const decrementCountAtom = $effect(
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
      "write": [Function],
    }
    `)

  expect(decrementCountAtom).toMatchInlineSnapshot(`
    {
      "write": [Function],
    }
    `)

  expect(sumAtom).toMatchInlineSnapshot(`
    {
      "read": [Function],
    }
    `)
})
