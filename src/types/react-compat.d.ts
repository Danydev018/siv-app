declare module "react" {
  export type ReactNode = import("preact").ComponentChildren;
  export type ReactElement = import("preact").VNode<any>;
}
