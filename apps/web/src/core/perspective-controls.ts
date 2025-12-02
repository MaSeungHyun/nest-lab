import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import {
  CONTROLS_SPEED,
  MICRO_SECOND,
  MOUSE_LEFT,
  MOUSE_MOVE_THRESHOLD,
  MOUSE_RIGHT,
  MOUSE_WHEEL,
  PAN_SPEED,
} from "../constants/controls";
import pointerlock from "../assets/controls/pointerlock.svg";
import { Context } from "./context";

const HALF_IMAGE_SIZE = 15;
export interface ControlsEvent {
  change: { message?: string };
}

export class PerspectiveControls extends THREE.EventDispatcher<ControlsEvent> {
  private _controls: PointerLockControls | null = null;
  public enabled: boolean = true;
  private _dom!: HTMLElement;
  private _camera!: THREE.PerspectiveCamera;

  public speed = CONTROLS_SPEED;
  public pointerSpeed = this.speed / (MICRO_SECOND * 2);

  // 키보드 방향 관련 상태 변수
  private _moveForward: boolean = false;
  private _moveBackward: boolean = false;
  private _moveLeft: boolean = false;
  private _moveRight: boolean = false;
  private _moveUp: boolean = false;
  private _moveDown: boolean = false;
  private _slowDown: boolean = false;

  // 이동 관련 변수
  private _prevTime: number = 0;
  private _velocity: THREE.Vector3 = new THREE.Vector3();
  private _direction: THREE.Vector3 = new THREE.Vector3();

  // 포커스 관련 변수
  private box = new THREE.Box3();
  private center = new THREE.Vector3();
  private sphere = new THREE.Sphere();

  // 드래그를 통한 Controls Lock 감지 변수
  private _pointerLockImage: HTMLImageElement = new Image();
  private _dragging: boolean = false;
  private _dragStart: { x: number; y: number } = { x: 0, y: 0 };
  private _dragEnd: { x: number; y: number } = { x: 0, y: 0 };

  private _active_pointer_left: boolean = false;
  private _active_pointer_right: boolean = false;
  private _active_mouse_wheel: boolean = false;

  constructor(camera: THREE.PerspectiveCamera, dom: HTMLElement) {
    super();
    // if (PerspectiveControls.instance) {
    //   return PerspectiveControls.instance;
    // }
    // PerspectiveControls.instance = this;

    this._controls = new PointerLockControls(camera, dom);
    this._controls.pointerSpeed = this.pointerSpeed;
    this._dom = dom;
    this.enabled = true;
    this._camera = camera;

    this._moveForward = false;
    this._moveBackward = false;
    this._moveLeft = false;
    this._moveRight = false;
    this._moveUp = false;
    this._moveDown = false;
    this._prevTime = 0;
    this._velocity.set(0, 0, 0);
    this._direction.set(0, 0, 0);

    this._dragging = false;
    this._dragStart = { x: 0, y: 0 };
    this.box = new THREE.Box3();

    this._pointerLockImage.src = pointerlock;
    this._pointerLockImage.style.width = "30px";
    this._pointerLockImage.style.height = "30px";
    this._pointerLockImage.style.position = "absolute";

    // 이벤트 바인딩
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);

    dom.addEventListener("pointerdown", this.onPointerDown);
    dom.addEventListener("pointermove", this.onPointerMove);
    dom.addEventListener("pointerup", this.onPointerUp);

    dom.addEventListener("wheel", this.zoom.bind(this));

    window.addEventListener("keydown", this.focus.bind(this));
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  // public static getInstance(): PerspectiveControls {
  // if (!PerspectiveControls.instance) {
  //   throw new Error("Controls must be initialized with camera and dom first");
  // }
  // return PerspectiveControls.instance;
  // }

  public updateCamera(camera: THREE.PerspectiveCamera) {
    this._camera = camera;
    if (this._controls) {
      this._controls.object = camera;
    }
  }

  get moveForward() {
    return this._moveForward;
  }
  get moveBackward() {
    return this._moveBackward;
  }
  get moveLeft() {
    return this._moveLeft;
  }
  get moveRight() {
    return this._moveRight;
  }

  get controls() {
    return this._controls;
  }

  public init() {
    // this._moveForward = false;
    // this._moveBackward = false;
    // this._moveLeft = false;
    // this._moveRight = false;
    // this._prevTime = 0;
    // this._velocity.set(0, 0, 0);
    // this._direction.set(0, 0, 0);
  }

  set enable(enable: boolean) {
    this.enabled = enable;
  }

  get enable() {
    return this.enabled;
  }

  get camera() {
    return this._camera;
  }
  set camera(camera: THREE.PerspectiveCamera) {
    this._camera = camera;
  }

  public zoom(event: WheelEvent): void {
    if (this.enabled === false) return;

    const context = Context.getInstance();
    if (this._controls?.object !== context.camera) {
      return;
    }

    const direction = new THREE.Vector3();
    this._controls?.object.getWorldDirection(direction);

    // 카메라와 대상 사이의 거리 계산
    const cameraPosition = this._controls!.object.position;

    const targetPosition = new THREE.Vector3(0, 0, 0);
    const distance = cameraPosition.distanceTo(targetPosition);

    const delta = event.deltaY > 0 ? -1 : 1;

    // 거리 비례 이동 거리 설정
    const moveDistance = distance * 0.1 * delta; // 0.1은 조정 가능한 비율입니다

    this._controls?.object?.position.addScaledVector(direction, moveDistance);
  }

  public pan(event: MouseEvent): void {
    const context = Context.getInstance();
    if (this._controls?.object !== context.camera) {
      return;
    }
    if (this._active_mouse_wheel) {
      const right = new THREE.Vector3();
      const up = new THREE.Vector3();

      this._controls?.object.matrix.extractBasis(
        right,
        up,
        new THREE.Vector3()
      );

      // 카메라와 원점 사이의 거리 계산
      const distance = this._controls!.object.position.length() / 10;

      // 거리 비례 팬 속도 설정
      const basePanSpeed = PAN_SPEED;
      const panSpeed = basePanSpeed * (distance || 1); // 거리에 비례하여 팬 속도 조정

      const deltaX = -event.movementX * panSpeed;
      const deltaY = event.movementY * panSpeed;

      this._controls?.object?.position.addScaledVector(right, deltaX);
      this._controls?.object?.position.addScaledVector(up, deltaY);
    }
  }

  set object(object: THREE.Object3D) {
    this._controls!.object = object;
  }
  public focus(event: KeyboardEvent): void {
    const target = this._controls?.object;

    if (target === undefined) {
      return;
    }

    if (event.code === "KeyF") {
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

      this._velocity.set(0, 0, 1);
      this._velocity.applyQuaternion(this._camera.quaternion);
      this._velocity.multiplyScalar(distance * 4);
      this._camera.position.copy(this.center).add(this._velocity);

      // this.dispatchEvent({ type: "change" });
    }
  }

  private onPointerDown(event: MouseEvent) {
    this.init();
    document.body.style.cursor = "default";
    if (this.enabled) {
      if (event.button === MOUSE_LEFT) {
        this._active_pointer_left = true;
        this.onPointerLeftDown();
      } else if (event.button === MOUSE_RIGHT) {
        this._active_pointer_right = true;
        this.onPointerRightDown(event);
      } else if (event.button === MOUSE_WHEEL) {
        this._active_mouse_wheel = true;
        this.onMouseWheelDown();
      }
    }
  }

  private onPointerMove(event: MouseEvent) {
    if (this.enabled === false) return;
    if (this._active_pointer_left) {
      this.onPointerLeftMove();
    } else if (this._active_pointer_right) {
      this.onPointerRightMove(event);
    } else if (this._active_mouse_wheel) {
      this.onMouseWheelMove(event);
    }
  }

  private onPointerUp(event: MouseEvent) {
    if (this.enabled === false) return;
    if (event.button === MOUSE_LEFT) {
      this._active_pointer_left = false;
      this.onPointerLeftUp();
    } else if (event.button === MOUSE_RIGHT) {
      this._active_pointer_right = false;
      this.onPointerRightUp();
    } else if (event.button === MOUSE_WHEEL) {
      this._active_mouse_wheel = false;
      this.onMouseWheelUp();
    }
  }
  // TODO
  // LEFT BUTTON 이벤트 처리
  public onPointerLeftDown() {}
  public onPointerLeftMove() {}
  public onPointerLeftUp() {
    this._active_pointer_left = false;
  }

  private onPointerRightDown(event: MouseEvent) {
    if (this.enabled === false) return;
    this._dragStart = { x: event.clientX, y: event.clientY };
  }
  private onPointerRightMove(event: MouseEvent) {
    if (this.enabled === false) return;
    if (this._active_pointer_right && !this._dragging) {
      const deltaX = Math.abs(this._dragStart.x - event.clientX);
      const deltaY = Math.abs(this._dragStart.y - event.clientY);

      const rect = this._dom.getBoundingClientRect();
      this._pointerLockImage.style.top = `${event.clientY - rect.top + HALF_IMAGE_SIZE}px`;
      this._pointerLockImage.style.left = `${event.clientX - rect.left + HALF_IMAGE_SIZE}px`;

      if (deltaX >= MOUSE_MOVE_THRESHOLD || deltaY >= MOUSE_MOVE_THRESHOLD) {
        this._dragging = true;
        this._dom.appendChild(this._pointerLockImage);
      }
    }

    if (this._dragging) {
      this._controls?.lock(true);
    }
  }

  private onPointerRightUp() {
    if (this.enabled === false) return;

    // this.init();
    this._dragging = false;
    if (this._pointerLockImage.parentElement) {
      this._dom.removeChild(this._pointerLockImage);
    }
    this._controls?.unlock();
  }

  private onMouseWheelDown() {
    this._dom.style.cursor = "grab";
  }

  private onMouseWheelMove(event: MouseEvent) {
    this._dom.style.cursor = "grabbing";
    this.pan(event);
  }

  private onMouseWheelUp() {
    this._dom.style.cursor = "default";
    if (this._active_mouse_wheel) {
      this._active_mouse_wheel = false;
    }
  }

  public onKeyDown(event: KeyboardEvent) {
    if (this.enabled === false) return;
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        this._moveForward = true;
        break;

      case "ArrowLeft":
      case "KeyA":
        this._moveLeft = true;
        break;

      case "ArrowDown":
      case "KeyS":
        this._moveBackward = true;
        break;

      case "ArrowRight":
      case "KeyD":
        this._moveRight = true;
        break;

      case "Space":
      case "KeyE":
        this._moveUp = true;
        break;

      case "KeyQ":
        this._moveDown = true;
        break;

      case "ShiftLeft":
        this._slowDown = true;
        break;
    }
  }
  public onKeyUp(event: KeyboardEvent) {
    if (this.enabled === false) return;
    switch (event.code) {
      case "ArrowUp":
      case "KeyW":
        this._moveForward = false;
        break;

      case "ArrowLeft":
      case "KeyA":
        this._moveLeft = false;
        break;

      case "ArrowDown":
      case "KeyS":
        this._moveBackward = false;
        break;

      case "ArrowRight":
      case "KeyD":
        this._moveRight = false;
        break;

      case "Space":
      case "KeyE":
        this._moveUp = false;
        break;

      case "KeyQ":
        this._moveDown = false;
        break;

      case "ShiftLeft":
        this._slowDown = false;
        break;
    }
  }

  public render = () => {
    if (this.enabled === false) return;
    if (!this._active_pointer_right) {
      return;
    }
    const time = performance.now();

    const delta = Math.min((time - this._prevTime) / MICRO_SECOND, 0.02);

    this._prevTime = time;

    // if (this._controls?.isLocked === true) {
    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(
      this._camera.quaternion
    );
    const right = new THREE.Vector3().crossVectors(
      direction,
      new THREE.Vector3(0, 1, 0)
    );

    // 이동 방향 설정
    const moveForward = Number(this._moveForward);
    const moveBackward = Number(this._moveBackward);
    const moveLeft = Number(this._moveLeft);
    const moveRight = Number(this._moveRight);
    const moveUp = Number(this._moveUp);
    const moveDown = Number(this._moveDown);

    // 대각선 이동을 위한 방향 벡터 합산
    this._velocity.set(0, 0, 0); // 방향 전환 시 즉시 속도 리셋
    if (moveForward || moveBackward) {
      this._velocity.addScaledVector(
        direction,
        (moveForward - moveBackward) * CONTROLS_SPEED * delta
      );
    }
    if (moveLeft || moveRight) {
      this._velocity.addScaledVector(
        right,
        (moveRight - moveLeft) * CONTROLS_SPEED * delta
      );
    }
    if (moveUp || moveDown) {
      this._velocity.addScaledVector(
        new THREE.Vector3(0, 0.5, 0),
        (moveUp - moveDown) * CONTROLS_SPEED * delta
      );
    }

    if (this._slowDown) {
      this._velocity.multiplyScalar(0.1);
    }

    // 이동 적용
    if (this._velocity.length() > 0) {
      this._controls!.object.position.addScaledVector(this._velocity, delta);
    }
    // }
  };

  public connect() {
    window.addEventListener("keydown", this.focus.bind(this));
    window.addEventListener("keydown", this.onKeyDown.bind(this));
    window.addEventListener("keyup", this.onKeyUp.bind(this));
    this._dom.addEventListener("pointerdown", this.onPointerDown.bind(this));
    this._dom.addEventListener("pointermove", this.onPointerMove.bind(this));
    this._dom.addEventListener("pointerup", this.onPointerUp.bind(this));
    this._dom.addEventListener("wheel", this.zoom.bind(this));
  }
  public dispose = () => {
    window.removeEventListener("keydown", this.focus.bind(this));
    window.removeEventListener("keydown", this.onKeyDown.bind(this));
    window.removeEventListener("keyup", this.onKeyUp.bind(this));
    this._dom.removeEventListener("pointerdown", this.onPointerDown.bind(this));
    this._dom.removeEventListener("pointermove", this.onPointerMove.bind(this));
    this._dom.removeEventListener("pointerup", this.onPointerUp.bind(this));
    this._dom.removeEventListener("wheel", this.zoom.bind(this));
  };
}
