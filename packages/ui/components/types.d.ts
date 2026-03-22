declare module "*.css?inline" {
  import { CSSResultGroup } from "lit";
  const content: CSSResultGroup;
  export default content;
}

declare module "*.svg?raw" {
  const content: string;
  export default content;
}
