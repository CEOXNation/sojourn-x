// No-op stub for react-dom — not used on native iOS.
// This prevents Metro from attempting to bundle the browser-only react-dom package
// when traversing imports that are conditionally guarded by Platform.OS === "web".
module.exports = {
  render: () => null,
  createPortal: (_children, _container) => null,
  findDOMNode: () => null,
  unmountComponentAtNode: () => false,
  flushSync: (fn) => fn()
};
