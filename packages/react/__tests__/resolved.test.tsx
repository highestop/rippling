import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { $value, createStore } from "@rippling/core";
import { StoreProvider } from "../src/provider";
import { StrictMode } from "react";
import { useResolved } from "../src/useResolved";

afterEach(() => {
  cleanup();
});

function makeDefered<T>(): {
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
  promise: Promise<T>;
} {
  const deferred: {
    resolve: (value: T) => void;
    reject: (error: unknown) => void;
    promise: Promise<T>;
  } = {} as {
    resolve: (value: T) => void;
    reject: (error: unknown) => void;
    promise: Promise<T>;
  };

  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });

  return deferred;
}

it("convert promise to awaited value", async () => {
  const base = $value(Promise.resolve("foo"));
  const App = () => {
    const ret = useResolved(base);
    return <div>{ret}</div>;
  };
  const store = createStore();
  render(
    <StoreProvider value={store}>
      <App />
    </StoreProvider>,
    { wrapper: StrictMode },
  );

  expect(await screen.findByText("foo")).toBeTruthy();
});

it("loading state", async () => {
  const deferred = makeDefered();
  const base = $value(deferred.promise);
  const App = () => {
    const ret = useResolved(base);
    return <div>{String(ret ?? "loading")}</div>;
  };

  const store = createStore();
  render(
    <StoreProvider value={store}>
      <App />
    </StoreProvider>,
    { wrapper: StrictMode },
  );

  expect(await screen.findByText("loading")).toBeTruthy();
  deferred.resolve("foo");
  expect(await screen.findByText("foo")).toBeTruthy();
});
