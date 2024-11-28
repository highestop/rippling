import { expect, test } from "vitest"
import { setupRipplingSetCase, setupJotaiSetCase } from "./case"

test('atom write scenario', () => {
    const { cleanup, update } = setupRipplingSetCase()
    expect(() => { update() }).not.toThrow()
    cleanup()
})

test('jotai atom write scenario', () => {
    const { cleanup, update } = setupJotaiSetCase()
    expect(() => { update() }).not.toThrow()
    cleanup()
})