import * as THREE from "three";

interface EditorControlsEvent {
  change: { message?: string };
}
export class OrthographicControls extends THREE.EventDispatcher<EditorControlsEvent> {
  public enabled = false;
  public center = new THREE.Vector3();
  public panSpeed = 0.002;
  public zoomSpeed = 0.1;

  public camera: THREE.OrthographicCamera;

  private delta = new THREE.Vector3();
  private box = new THREE.Box3();

  private STATE = { NONE: -1, ZOOM: 0, PAN: 1 } as const;
  private state: number = this.STATE.NONE;

  private normalMatrix = new THREE.Matrix3();
  private pointer = new THREE.Vector2();
  private pointerOld = new THREE.Vector2();
  private sphere = new THREE.Sphere();

  private pointers: Array<number> = [];
  private pointerPositions: Record<number, THREE.Vector2> = {};

  private domElement: HTMLElement;
  // touch
  private prevDistance: number | null = null;
  private touches = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  private prevTouches = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];

  constructor(camera: THREE.OrthographicCamera, domElement: HTMLElement) {
    super();
    this.camera = camera;
    this.domElement = domElement;

    this.contextmenu = this.contextmenu.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseWheel = this.onMouseWheel.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);

    domElement.addEventListener("contextmenu", this.contextmenu);
    domElement.addEventListener("dblclick", this.onMouseUp);
    domElement.addEventListener("wheel", this.onMouseWheel, {
      passive: false,
    });
    domElement.addEventListener("pointerdown", this.onPointerDown);
  }

  public updateCamera(camera: THREE.OrthographicCamera) {
    this.camera = camera;
  }

  public focus(target: THREE.Object3D): void {
    if (this.enabled === false) return;
    let distance: number;
    this.box.setFromObject(target, false);

    if (this.box.isEmpty() === false) {
      this.box.getCenter(this.center);
      distance = this.box.getBoundingSphere(this.sphere).radius;
    } else {
      // Focusing on an Group, AmbientLight, etc
      this.center.setFromMatrixPosition(target.matrixWorld);
      distance = 0.1;
    }

    this.delta.set(0, 0, 1);
    this.delta.applyQuaternion(this.camera.quaternion);
    this.delta.multiplyScalar(distance * 4);
    this.camera.position.copy(this.center).add(this.delta);

    this.dispatchEvent({ type: "change" });
  }

  private pan(delta: THREE.Vector3): void {
    if (this.enabled === false) return;

    const distance = this.camera.position.distanceTo(this.center);
    const cameraZoom = this.camera.zoom * 1.5;

    delta.multiplyScalar((distance * this.panSpeed) / cameraZoom);
    delta.applyMatrix3(this.normalMatrix.getNormalMatrix(this.camera.matrix));

    this.camera.position.add(delta);

    this.center.add(delta);
    this.dispatchEvent({ type: "change" });
  }

  private zoom(delta: THREE.Vector3): void {
    if (this.enabled === false) return;
    const zoomChange = delta.z < 0 ? 0.008 : -0.008;
    this.camera.zoom = Math.max(0.02, Math.min(0.9, this.camera.zoom + zoomChange));
    this.camera.updateProjectionMatrix();
    this.dispatchEvent({ type: "change" });
  }

  // pointer
  private onPointerDown(event: PointerEvent): void {
    if (this.enabled === false) return;

    if (this.pointers.length === 0) {
      this.domElement.setPointerCapture(event.pointerId);
      this.domElement.ownerDocument.addEventListener("pointermove", this.onPointerMove);
      this.domElement.ownerDocument.addEventListener("pointerup", this.onPointerUp);
    }

    if (this.isTrackingPointer(event)) return;
    this.addPointer(event);

    if (event.pointerType === "touch") {
      this.onTouchStart(event);
    } else {
      this.onMouseDown(event);
    }
  }
  private onPointerMove(event: PointerEvent): void {
    if (this.enabled === false) return;

    if (event.pointerType === "touch") {
      this.onTouchMove(event);
    } else {
      this.onMouseMove(event);
    }
  }
  private onPointerUp(event: PointerEvent): void {
    this.removePointer(event);

    switch (this.pointers.length) {
      case 0:
        this.domElement.releasePointerCapture(event.pointerId);

        this.domElement.ownerDocument.removeEventListener("pointermove", this.onPointerMove);
        this.domElement.ownerDocument.removeEventListener("pointerup", this.onPointerUp);

        break;

      case 1: {
        const pointerId = this.pointers[0];
        const position = this.pointerPositions[pointerId];
        // minimal placeholder event - allows state correction on pointer-up
        this.onTouchStart({
          pointerId: pointerId,
          pageX: position.x,
          pageY: position.y,
        });
        break;
      }
    }
  }

  // mouse
  private onMouseDown(event: MouseEvent): void {
    if (this.enabled === false) return;
    if (event.button === 0) {
      //
    } else if (event.button === 1) {
      this.state = this.STATE.ZOOM;
    } else if (event.button === 2) {
      this.state = this.STATE.PAN;
    }
    this.pointerOld.set(event.clientX, event.clientY);
  }

  private onMouseMove(event: MouseEvent): void {
    if (this.enabled === false) return;
    this.pointer.set(event.clientX, event.clientY);

    const movementX = this.pointer.x - this.pointerOld.x;
    const movementY = this.pointer.y - this.pointerOld.y;

    if (this.state === this.STATE.ZOOM) {
      this.zoom(this.delta.set(0, 0, movementY));
    } else if (this.state === this.STATE.PAN) {
      this.pan(this.delta.set(-movementX, movementY, 0));
    }

    this.pointerOld.set(event.clientX, event.clientY);
  }
  private onMouseUp(): void {
    this.state = this.STATE.NONE;
  }
  private onMouseWheel(event: WheelEvent): void {
    if (this.enabled === false) return;

    // event.preventDefault();

    // Normalize deltaY due to https://bugzilla.mozilla.org/show_bug.cgi?id=1392460

    this.zoom(this.delta.set(0, 0, event.deltaY > 0 ? 1 : -1));
  }
  private contextmenu(event: MouseEvent): void {
    event.preventDefault();
  }

  public connect() {
    this.domElement.addEventListener("contextmenu", this.contextmenu);
    this.domElement.addEventListener("dblclick", this.onMouseUp);
    this.domElement.addEventListener("wheel", this.onMouseWheel);
    this.domElement.addEventListener("pointerdown", this.onPointerDown);
  }

  public dispose(): void {
    this.domElement.removeEventListener("contextmenu", this.contextmenu);
    this.domElement.removeEventListener("dblclick", this.onMouseUp);
    this.domElement.removeEventListener("wheel", this.onMouseWheel);
    this.domElement.removeEventListener("pointerdown", this.onPointerDown);
  }

  private onTouchStart(event): void {
    if (this.enabled === false) return;
    this.trackPointer(event);

    switch (this.pointers.length) {
      case 1:
        this.touches[0].set(event.pageX, event.pageY, 0).divideScalar(window.devicePixelRatio);
        this.touches[1].set(event.pageX, event.pageY, 0).divideScalar(window.devicePixelRatio);
        break;

      case 2: {
        const position = this.getSecondPointerPosition(event);

        this.touches[0].set(event.pageX, event.pageY, 0).divideScalar(window.devicePixelRatio);
        this.touches[1].set(position.x, position.y, 0).divideScalar(window.devicePixelRatio);
        this.prevDistance = this.touches[0].distanceTo(this.touches[1]);
        break;
      }
    }

    this.prevTouches[0].copy(this.touches[0]);
    this.prevTouches[1].copy(this.touches[1]);
  }
  private onTouchMove(event): void {
    if (this.enabled === false) return;
    this.trackPointer(event);

    function getClosest(touch, touches: THREE.Vector3[]): THREE.Vector3 {
      let closest = touches[0];

      for (const touch2 of touches) {
        if (closest.distanceTo(touch) > touch2.distanceTo(touch)) closest = touch2;
      }

      return closest;
    }

    switch (this.pointers.length) {
      case 1:
        this.touches[0].set(event.pageX, event.pageY, 0).divideScalar(window.devicePixelRatio);
        this.touches[1].set(event.pageX, event.pageY, 0).divideScalar(window.devicePixelRatio);
        break;

      case 2: {
        const position = this.getSecondPointerPosition(event);

        this.touches[0].set(event.pageX, event.pageY, 0).divideScalar(window.devicePixelRatio);
        this.touches[1].set(position.x, position.y, 0).divideScalar(window.devicePixelRatio);
        const distance = this.touches[0].distanceTo(this.touches[1]);
        this.zoom(this.delta.set(0, 0, this.prevDistance ?? 0 - distance));
        this.prevDistance = distance;

        const offset0 = this.touches[0].clone().sub(getClosest(this.touches[0], this.prevTouches));
        const offset1 = this.touches[1].clone().sub(getClosest(this.touches[1], this.prevTouches));
        offset0.x = -offset0.x;
        offset1.x = -offset1.x;

        this.pan(offset0.add(offset1));

        break;
      }
    }

    this.prevTouches[0].copy(this.touches[0]);
    this.prevTouches[1].copy(this.touches[1]);
  }
  private addPointer(event): void {
    if (this.enabled === false) return;
    this.pointers.push(event.pointerId);
  }
  private removePointer(event): void {
    if (this.enabled === false) return;
    delete this.pointerPositions[event.pointerId];

    for (let i = 0; i < this.pointers.length; i++) {
      if (this.pointers[i] == event.pointerId) {
        this.pointers.splice(i, 1);
        return;
      }
    }
  }
  private isTrackingPointer(event): boolean {
    if (this.enabled === false) return false;
    for (let i = 0; i < this.pointers.length; i++) {
      if (this.pointers[i] == event.pointerId) return true;
    }
    return false;
  }
  private trackPointer(event): void {
    if (this.enabled === false) return;
    let position = this.pointerPositions[event.pointerId];
    if (position === undefined) {
      position = new THREE.Vector2();
      this.pointerPositions[event.pointerId] = position;
    }

    position.set(event.pageX, event.pageY);
  }
  private getSecondPointerPosition(event): THREE.Vector2 {
    if (this.enabled === false) return new THREE.Vector2();
    const pointerId = event.pointerId === this.pointers[0] ? this.pointers[1] : this.pointers[0];
    return this.pointerPositions[pointerId];
  }

  public render = () => {
    this.camera.updateProjectionMatrix();
  };
}
