import { ReactiveController, ReactiveControllerHost } from "lit";

export class HTMLForController implements ReactiveController {
  htmlFor: string | null | undefined;
  host: ReactiveControllerHost;

  control: HTMLElement | null | undefined;
  currentControl: HTMLElement | null | undefined;

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
    const forAttribute = (this.host as unknown as HTMLElement).getAttribute(
      "for",
    );
    if (forAttribute) {
      const target = (this.host as unknown as HTMLElement)
        .getRootNode()
        .getElementById(forAttribute);
      this.setCurrentControl(target);
    } else {
      const target = this.host.getRootNode();
      this.setCurrentControl(target);
    }
  }

  hostDisconnected() {
    this.setCurrentControl(null);
    // Clean up
  }

  private setCurrentControl(control: HTMLElement | null) {
    this.onControlChange(this.currentControl, control);
    this.currentControl = control;
  }
}
