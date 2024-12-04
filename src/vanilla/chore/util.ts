import { NestedAtom, NestedString } from "../typing/util";

export function nestedAtomToString(atoms: NestedAtom): NestedString {
    return atoms.map((atom) => {
        if (Array.isArray(atom)) {
            return nestedAtomToString(atom)
        }
        return atom.debugLabel ?? 'anonymous'
    })
}
