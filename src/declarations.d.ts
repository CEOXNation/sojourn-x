// Module declaration shims for packages whose subpath exports are not
// visible under the classic "node" moduleResolution strategy used by
// this Expo project. Each re-exports the real types from the package's
// built declaration file so TypeScript still gets full type safety.

declare module "@vercel/analytics/react" {
  export {
    Analytics,
    type AnalyticsProps,
    type BeforeSend,
    type BeforeSendEvent,
    track
  } from "@vercel/analytics";
}
