/*
//
// Scene-Editor에서 사용되는
// Scene(Multi-Scene), Camera를 관리합니다.
// 카메라는 다른 Scene이 겹쳐질 경우
// 같은 카메라에서 어떻게 보이는지 확인을 위해 각 카메라 공유
//
*/

import * as THREE from "three";
import { Scene } from "./scene";
import { PerspectiveControls } from "./perspective-controls";
import { TransformControls } from "./transform-controls";
import { OrthographicControls } from "./orthographic-controls";
import { DEFAULT_CAMERA_SPEC } from "../constants/camera";
import { ViewHelper } from "./view-helper";
import JEASINGS from "jeasings";
import { progress } from "../hooks/useProgress";
import { Selector } from "./selector";
import { getSocket } from "../utils/socket";

export class Context {
  private static instance: Context;
  private _renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  private _id: number = 0;
  private _scenes: Scene[] = [];
  private _scene: Scene | null = null;
  private _cameras: THREE.Camera[] = [];
  private _camera: THREE.Camera | null = null;
  private _controls: PerspectiveControls | OrthographicControls | null = null;
  private _persepectiveControls: PerspectiveControls | null = null;
  private _orthographicControls: OrthographicControls | null = null;
  private _dom: HTMLDivElement | null = null;
  private _transformControls: TransformControls | null = null;
  private _listeners: (() => void)[] = [];
  private _viewHelper: ViewHelper | null = null;
  private _selector: Selector | null = null;
  private _transformChangeHandler: (() => void) | null = null;

  constructor() {
    console.log("%cInitialize Scene Editor Context", "color: #00ffff;");
    this._renderer.setClearColor(0x000000, 0);
  }

  public async didMount(dom: HTMLDivElement) {
    console.log("%cMounted SceneView", "color: #00ffff;");
    const p = progress();
    p.setTitle("Project Setting")
      .setDescription("초기 프로젝트 환경을 설정하는 중입니다.")
      .setIcon("Settings")
      .open();

    this._dom = dom;

    const scene = new Scene(`Scene`);
    const scene2 = new Scene(`Scene 2`);

    await new Promise((resolve) => setTimeout(resolve, 200));

    this._scenes = [scene, scene2];
    // scene setter를 통해 TransformControls 생성 및 소켓 리스너 설정
    this.scene = scene;
    p.setProgress(30).setDescription("Scene을 설정하는 중입니다.");

    await new Promise((resolve) => setTimeout(resolve, 300));

    this._cameras = [scene.camera];
    this._camera = scene.camera;
    p.setProgress(70).setDescription("Camera를 설정하는 중입니다.");

    await new Promise((resolve) => setTimeout(resolve, 300));

    // 새로운 DOM 요소로 controls 재생성
    if (this._scene) {
      this._persepectiveControls = new PerspectiveControls(
        this._scene.camera as THREE.PerspectiveCamera,
        this._dom!
      );

      this._orthographicControls = new OrthographicControls(
        this._scene.camera as THREE.OrthographicCamera,
        this._dom!
      );

      // controls 초기화 후 카메라 타입에 맞게 설정
      this.updateControls(this._scene.camera);

      this._viewHelper = new ViewHelper(
        this._camera as THREE.PerspectiveCamera | THREE.OrthographicCamera,
        dom
      );

      this._selector = new Selector(
        this._renderer,
        this._camera as THREE.Camera,
        this._scene,
        dom
      );
      this._selector.connect();
    }
    p.setProgress(100).setDescription("Event를 설정하는 중입니다.");

    this._renderer.setAnimationLoop(() => this.render());

    p.close();
  }

  public static getInstance(): Context {
    if (!Context.instance) {
      Context.instance = new Context();
    }
    return Context.instance;
  }

  get renderer() {
    return this._renderer;
  }

  get dom() {
    if (!this._dom) {
      throw new Error("DOM is not initialized");
    }
    return this._dom;
  }

  set dom(dom: HTMLDivElement | null) {
    this._dom = dom;
  }

  public addScene(scene: Scene) {
    this._scenes = [...this._scenes, scene];
  }
  get scenes() {
    return this._scenes;
  }

  get transformControls() {
    if (!this._transformControls) {
      throw new Error("TransformControls is not initialized");
    }
    return this._transformControls;
  }
  set transformControls(transformControls: TransformControls) {
    this._transformControls = transformControls;
  }

  get scene(): Scene | null {
    if (!this._scene) {
      return null;
    }
    return this._scene;
  }

  set controls(controls: PerspectiveControls | OrthographicControls) {
    this._controls = controls;
  }

  get persepectiveControls() {
    if (!this._persepectiveControls) {
      throw new Error("PerspectiveControls is not initialized");
    }
    return this._persepectiveControls;
  }

  get orthographicControls() {
    if (!this._orthographicControls) {
      throw new Error("OrthographicControls is not initialized");
    }
    return this._orthographicControls;
  }

  public updateControls(camera: THREE.Camera) {
    // controls가 초기화되지 않았으면 아무것도 하지 않음
    if (!this._persepectiveControls || !this._orthographicControls) {
      return;
    }

    this._persepectiveControls.enabled = true;
    this._orthographicControls.enabled = false;
    if (camera instanceof THREE.PerspectiveCamera) {
      this._controls = this._persepectiveControls;

      this._camera = camera;
      this._persepectiveControls.updateCamera(camera);
    } else if (camera instanceof THREE.OrthographicCamera) {
      this._persepectiveControls.enabled = false;
      this._orthographicControls.enabled = true;
      this._controls = this._orthographicControls;
      this._camera = camera;
      this._orthographicControls.updateCamera(camera);
    }
  }

  set scene(scene: Scene) {
    console.log("%cchange Scene", "color: orange;");
    this._scene = scene;
    this._camera = scene.camera;

    // 카메라 타입에 따라 적절한 컨트롤러 설정 (controls가 초기화된 경우에만)
    if (this._persepectiveControls && this._orthographicControls) {
      this.updateControls(scene.camera);
    }

    // Scene의 TransformControls를 사용 (이미 씬에 추가되어 있음)
    // Context의 TransformControls는 Scene의 것을 참조
    this._transformControls = scene.transformControls;
    this._camera = this._scene!.camera;

    // TransformControls의 change 이벤트 리스너 추가
    this._setupTransformControlsSocketListener();

    this.notify();
  }

  /**
   * 이름으로 오브젝트를 찾는 메서드
   * TransformControls 그룹 내부도 검색
   */
  public findObjectByName(name: string): THREE.Object3D | null {
    if (!this._scene) return null;

    // 먼저 scene에서 직접 찾기
    let foundObject = this._scene.getObjectByProperty(
      "name",
      name
    ) as THREE.Object3D | null;

    // 찾지 못했으면 TransformControls 그룹 내부 검색
    if (
      !foundObject &&
      this._transformControls?.object instanceof THREE.Group
    ) {
      const group = this._transformControls.object;
      foundObject = group.getObjectByProperty(
        "name",
        name
      ) as THREE.Object3D | null;
    }

    // 여전히 찾지 못했으면 scene 전체를 재귀적으로 검색
    if (!foundObject) {
      this._scene.traverse((child) => {
        if (child.name === name && !foundObject) {
          foundObject = child as THREE.Object3D;
        }
      });
    }

    return foundObject || null;
  }

  /**
   * 소켓으로 받은 transformUpdate를 처리하여 오브젝트 업데이트
   */
  public updateObjectTransform(transformData: {
    name: string;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    quaternion: { x: number; y: number; z: number; w: number };
    scale: { x: number; y: number; z: number };
    mode?: string;
  }) {
    console.log(
      "[Context] updateObjectTransform called for:",
      transformData.name
    );
    const object = this.findObjectByName(transformData.name);
    if (!object) {
      console.warn(
        `[Context] ❌ Object with Name "${transformData.name}" not found in scene`
      );
      console.log(
        "[Context] Available objects in scene:",
        this._scene?.children.map((child) => child.name || child.uuid)
      );
      return;
    }
    console.log(`[Context] ✅ Found object: ${transformData.name}`, object);

    // TransformControls가 현재 이 오브젝트를 조작 중이면 업데이트하지 않음
    // (자신이 보낸 업데이트는 무시)
    const transformControlsObject = this._transformControls?.object;
    if (transformControlsObject) {
      // TransformControls는 그룹을 사용하므로, 그룹의 children 확인
      if (transformControlsObject instanceof THREE.Group) {
        const isControlling = transformControlsObject.children.some(
          (child) =>
            child === object ||
            (child as THREE.Object3D).name === transformData.name
        );
        if (isControlling) {
          console.log(
            `[TransformControls] Ignoring own transform update for ${transformData.name}`
          );
          return;
        }
      } else if (transformControlsObject === object) {
        console.log(
          `[TransformControls] Ignoring own transform update (direct object)`
        );
        return;
      }
    }

    // 오브젝트가 그룹 내부에 있는지 확인
    const isInGroup = !!(object.parent && object.parent !== this._scene);
    console.log(
      `[Context] Object parent:`,
      object.parent?.constructor.name,
      `isInGroup:`,
      isInGroup
    );

    // 즉시 업데이트 적용 (동기적으로 바로 적용)
    this._applyTransformUpdate(object, transformData, isInGroup);
  }

  /**
   * Transform 업데이트를 실제로 적용하는 내부 메서드
   */
  private _applyTransformUpdate(
    object: THREE.Object3D,
    transformData: {
      name: string;
      position: { x: number; y: number; z: number };
      rotation: { x: number; y: number; z: number };
      quaternion: { x: number; y: number; z: number; w: number };
      scale: { x: number; y: number; z: number };
    },
    isInGroup: boolean
  ) {
    // matrixAutoUpdate가 false일 수 있으므로 일시적으로 활성화
    const wasMatrixAutoUpdate = object.matrixAutoUpdate;
    object.matrixAutoUpdate = true;

    if (isInGroup && object.parent) {
      // 그룹 내부에 있는 경우: 월드 좌표를 로컬 좌표로 변환
      console.log(
        `[Context] Object is in group, converting world to local coordinates`
      );
      console.log(`[Context] Group position:`, object.parent.position);
      console.log(`[Context] Object current local position:`, object.position);

      // 부모의 월드 매트릭스 업데이트
      object.parent.updateMatrixWorld(true);

      // 부모의 역변환 매트릭스 계산
      const parentMatrixInv = new THREE.Matrix4();
      parentMatrixInv.copy(object.parent.matrixWorld).invert();

      // 월드 position을 로컬 position으로 변환
      const worldPosition = new THREE.Vector3(
        transformData.position.x,
        transformData.position.y,
        transformData.position.z
      );
      const localPosition = worldPosition.applyMatrix4(parentMatrixInv);
      object.position.copy(localPosition);

      // 월드 quaternion을 로컬 quaternion으로 변환
      if (transformData.quaternion) {
        const worldQuaternion = new THREE.Quaternion(
          transformData.quaternion.x,
          transformData.quaternion.y,
          transformData.quaternion.z,
          transformData.quaternion.w
        );
        const parentQuaternion = new THREE.Quaternion();
        object.parent.getWorldQuaternion(parentQuaternion);
        parentQuaternion.invert();
        const localQuaternion = parentQuaternion.multiply(worldQuaternion);
        object.quaternion.copy(localQuaternion);
      } else {
        // rotation을 quaternion으로 변환 후 처리
        const worldEuler = new THREE.Euler(
          transformData.rotation.x,
          transformData.rotation.y,
          transformData.rotation.z
        );
        const worldQuaternion = new THREE.Quaternion().setFromEuler(worldEuler);
        const parentQuaternion = new THREE.Quaternion();
        object.parent.getWorldQuaternion(parentQuaternion);
        parentQuaternion.invert();
        const localQuaternion = parentQuaternion.multiply(worldQuaternion);
        object.quaternion.copy(localQuaternion);
      }

      // Scale은 부모의 scale을 고려
      const worldScale = new THREE.Vector3(
        transformData.scale.x,
        transformData.scale.y,
        transformData.scale.z
      );
      const parentScale = new THREE.Vector3();
      object.parent.getWorldScale(parentScale);
      const localScale = new THREE.Vector3(
        worldScale.x / parentScale.x,
        worldScale.y / parentScale.y,
        worldScale.z / parentScale.z
      );
      object.scale.copy(localScale);
    } else {
      // Scene에 직접 있는 경우: 직접 설정
      console.log(`[Context] Object is directly in scene, setting directly`);
      object.position.set(
        transformData.position.x,
        transformData.position.y,
        transformData.position.z
      );

      // Quaternion이 있으면 quaternion 사용, 없으면 rotation 사용
      if (transformData.quaternion) {
        object.quaternion.set(
          transformData.quaternion.x,
          transformData.quaternion.y,
          transformData.quaternion.z,
          transformData.quaternion.w
        );
      } else {
        object.rotation.set(
          transformData.rotation.x,
          transformData.rotation.y,
          transformData.rotation.z
        );
      }

      object.scale.set(
        transformData.scale.x,
        transformData.scale.y,
        transformData.scale.z
      );
    }

    // Matrix 업데이트
    object.updateMatrix();
    object.updateMatrixWorld(true);

    // 원래 matrixAutoUpdate 상태 복원
    object.matrixAutoUpdate = wasMatrixAutoUpdate;

    console.log(
      `[Context] ✅ Object "${transformData.name}" updated from socket`
    );
    console.log(`[Context] New position:`, object.position.clone());
    console.log(`[Context] New rotation:`, object.rotation.clone());
    console.log(`[Context] New scale:`, object.scale.clone());
    console.log(
      `[Context] Matrix auto-update: ${wasMatrixAutoUpdate} -> true -> ${wasMatrixAutoUpdate}`
    );
  }

  /**
   * TransformControls의 change 이벤트를 리스닝하여 소켓으로 전송
   */
  private _setupTransformControlsSocketListener() {
    if (!this._transformControls) {
      console.warn(
        "TransformControls is not initialized, cannot setup socket listener"
      );
      return;
    }

    // 기존 리스너가 있다면 제거
    if (this._transformChangeHandler) {
      this._transformControls.removeEventListener(
        "change",
        this._transformChangeHandler
      );
    }

    const handleChange = () => {
      console.log("[TransformControls] Change event fired");
      const object = this._transformControls?.object;
      if (!object) {
        console.warn(
          "[TransformControls] No object attached to TransformControls"
        );
        return;
      }

      // TransformControls는 그룹을 사용하므로, 실제 오브젝트의 name을 가져옴
      let actualObject: THREE.Object3D | null = null;
      let objectName: string = "";

      // 그룹인 경우 children에서 실제 오브젝트 찾기
      if (object instanceof THREE.Group && object.children.length > 0) {
        // 첫 번째 child가 실제 오브젝트
        const firstChild = object.children[0];
        actualObject = firstChild as THREE.Object3D;
        objectName = (firstChild as THREE.Object3D).name || object.name || "";
      } else {
        actualObject = object as THREE.Object3D;
        objectName = object.name || "";
      }

      if (!objectName) {
        console.warn(
          "[TransformControls] Object has no name, cannot send transform update",
          { object, actualObject, objectType: object.constructor.name }
        );
        return;
      }

      if (!actualObject) {
        console.warn("[TransformControls] Could not determine actual object");
        return;
      }

      const socket = getSocket(); // useSocket과 같은 인스턴스 사용
      if (!socket) {
        console.warn("[TransformControls] Socket instance not found");
        return;
      }

      console.log("[TransformControls] Socket instance:", {
        id: socket.id,
        connected: socket.connected,
      });

      if (!socket.connected) {
        console.warn(
          "[TransformControls] Socket is not connected, attempting to connect..."
        );
        socket.connect();
        // 연결 시도 후 바로 전송하면 실패할 수 있으므로 잠시 대기
        setTimeout(() => {
          if (socket.connected) {
            console.log(
              "[TransformControls] Socket connected, sending transform update"
            );
            this._sendTransformUpdate(socket, actualObject!, objectName);
          } else {
            console.warn(
              "[TransformControls] Socket connection failed, skipping transform update"
            );
          }
        }, 100);
        return;
      }

      this._sendTransformUpdate(socket, actualObject!, objectName);
    };

    // 핸들러 저장 및 이벤트 리스너 추가
    this._transformChangeHandler = handleChange;
    this._transformControls.addEventListener("change", handleChange);
    console.log("[TransformControls] Socket listener setup complete");
  }

  /**
   * Transform 데이터를 소켓으로 전송하는 헬퍼 메서드
   */
  private _sendTransformUpdate(
    socket: ReturnType<typeof getSocket>,
    object: THREE.Object3D,
    objectName: string
  ) {
    // 오브젝트의 월드 좌표 가져오기 (그룹 내부에 있어도 월드 좌표 사용)
    const worldPosition = new THREE.Vector3();
    const worldQuaternion = new THREE.Quaternion();
    const worldScale = new THREE.Vector3();

    object.updateMatrixWorld(true);
    object.getWorldPosition(worldPosition);
    object.getWorldQuaternion(worldQuaternion);
    object.getWorldScale(worldScale);

    // 로컬 rotation도 가져오기 (fallback용)
    const rotation = object.rotation.clone();

    // 소켓으로 전송할 데이터 (월드 좌표 사용)
    const transformData = {
      name: objectName,
      position: {
        x: worldPosition.x,
        y: worldPosition.y,
        z: worldPosition.z,
      },
      rotation: {
        x: rotation.x,
        y: rotation.y,
        z: rotation.z,
      },
      quaternion: {
        x: worldQuaternion.x,
        y: worldQuaternion.y,
        z: worldQuaternion.z,
        w: worldQuaternion.w,
      },
      scale: {
        x: worldScale.x,
        y: worldScale.y,
        z: worldScale.z,
      },
      mode:
        (this._transformControls as TransformControls & { mode?: string })
          .mode || "translate", // 'translate' | 'rotate' | 'scale'
    };

    // 소켓 이벤트 전송
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📤 [TransformControls] Sending transformUpdate to server");
    console.log("Socket ID:", socket.id);
    console.log("Socket Connected:", socket.connected);
    console.log("Object Name:", transformData.name);
    console.log("Position:", transformData.position);
    console.log("Rotation:", transformData.rotation);
    console.log("Quaternion:", transformData.quaternion);
    console.log("Scale:", transformData.scale);
    console.log("Mode:", transformData.mode);
    console.log("Full Data:", transformData);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    socket.emit("transformUpdate", transformData);

    console.log("[TransformControls] ✅ transformUpdate event emitted");
  }

  get cameras() {
    return this._cameras;
  }

  set cameras(cameras: THREE.Camera[]) {
    this._cameras = [...this._cameras, ...cameras];
  }

  get viewHelper() {
    if (!this._viewHelper) {
      throw new Error("ViewHelper is not initialized");
    }
    return this._viewHelper;
  }

  set viewHelper(viewHelper: ViewHelper) {
    this._viewHelper = viewHelper;
  }

  get camera() {
    if (!this._camera) {
      throw new Error("Camera is not initialized");
    }
    return this._camera;
  }

  set camera(camera: THREE.Camera) {
    this._camera = camera;
  }

  get id() {
    return this._id;
  }

  set id(id: number) {
    this._id = id;
  }

  public subscribe(listener: () => void) {
    this._listeners = [...this._listeners, listener];
  }
  public unsubscribe(listener: () => void) {
    this._listeners = this._listeners.filter((l) => l !== listener);
  }
  public notify() {
    this._listeners.forEach((listener) => listener());
  }

  public resize() {
    if (!this._scene) {
      throw new Error("Scene is not initialized");
    } else {
      this._renderer.setSize(this._dom!.clientWidth, this._dom!.clientHeight);
      const perspectiveCamera = this._scene.camera as THREE.PerspectiveCamera;
      perspectiveCamera.aspect =
        this._dom!.clientWidth / this._dom!.clientHeight;
      perspectiveCamera.updateProjectionMatrix();
    }
    if (this._camera instanceof THREE.OrthographicCamera) {
      const frustumSize =
        2 *
        Math.tan((DEFAULT_CAMERA_SPEC.fov * Math.PI) / 180 / 2) *
        this._scene.perspectiveCamera.position.z;
      const aspect = this._dom!.clientWidth / this._dom!.clientHeight;

      this._camera.left = (-frustumSize * aspect) / 2;
      this._camera.right = (frustumSize * aspect) / 2;
      this._camera.top = frustumSize / 2;
      this._camera.bottom = -frustumSize / 2;

      this._camera.updateProjectionMatrix();
    }
  }

  public render() {
    if (!this._scene) {
      throw new Error("Scene is not initialized");
    } else {
      this.resize();

      this._scene!.camera!.updateMatrixWorld();

      this._renderer.autoClear = false;
      this._renderer.render(this._scene, this._scene.camera);

      this._scene.render();

      // 외곽선 위치 업데이트 (오브젝트 이동/회전/스케일 변경 시 동기화)
      this._selector?.updateOutlinePositions();

      this._controls?.render();
      this._renderer.render(this._scene.sceneHelper, this._scene.camera);
      this._viewHelper?.render(this._renderer);
      this._renderer.autoClear = true;

      JEASINGS.update();
    }
  }

  public dispose() {
    // TransformControls 이벤트 리스너 제거
    if (this._transformControls && this._transformChangeHandler) {
      this._transformControls.removeEventListener(
        "change",
        this._transformChangeHandler
      );
      this._transformChangeHandler = null;
    }

    this._renderer.dispose();
    if (this._dom) {
      while (this._dom.firstChild) {
        this._dom.removeChild(this._dom.firstChild);
      }
    }
    this._scenes.forEach((scene) => {
      scene.dispose();
    });
    this._scenes = [];
    this._scene = null;
    this._cameras = [];
    this._camera = null;
    this._controls?.dispose();
    this._listeners = [];
  }
}
