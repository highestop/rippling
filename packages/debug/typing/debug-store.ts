import { Computed, Store, Value } from "../../core";
import { NestedAtom } from "./util";

export interface DebugStore extends Store {
  getReadDependencies: (atom: Computed<unknown>) => NestedAtom;
  getReadDependents: (atom: Value<unknown> | Computed<unknown>) => NestedAtom;
  getSubscribeGraph: () => NestedAtom;
}
