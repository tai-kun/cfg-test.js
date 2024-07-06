import React from "react";

// the implementation
export function App() {
  return <h1>Hello</h1>;
}

// in-source test suites
if (cfgTest && cfgTest.url === import.meta.url) {
  const { createRoot } = await import("react-dom/client");
  const { flushSync } = await import("react-dom");
  const { assert, describe, test } = cfgTest;

  function renderToString(node: any): string {
    const div = document.createElement("div");
    const root = createRoot(div);
    flushSync(() => {
      root.render(node);
    });
    const string = div.innerHTML;
    root.unmount();

    return string;
  }

  describe("App", () => {
    test("can be rendered", () => {
      assert.equal(renderToString(<App />), "<h1>Hello</h1>");
    });
  });
}
