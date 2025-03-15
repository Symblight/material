export function createDataGrid(el: HTMLElement, options) {
  const containerHeight = 0;
}

import { ReactiveController, ReactiveControllerHost } from "lit";

export class HTMLContainerController implements ReactiveController {
  host: ReactiveControllerHost;

  constructor(
    host: ReactiveControllerHost,
    private readonly onControlChange: (
      prev: HTMLElement | null,
      next: HTMLElement | null,
    ) => void,
  ) {
    (this.host = host).addController(this);
  }

  hostConnected() {
    const target = this.host.getRootNode();
  }

  hostDisconnected() {
    // Clean up
  }
}
