import { Context } from "./context";
import * as THREE from "three";

import {
  DEFAULT_CAMERA_POSITION,
  DEFAULT_CAMERA_SPEC,
  DEFAULT_CAMERA_TARGET,
} from "../constants/camera";
import { Grid } from "./grid";

import { TransformControls } from "./transform-controls";

import { createMesh } from "./mesh";

import JEASINGS from "jeasings";

import { SCENE_BACKGROUND_COLOR } from "../constants/color";

import hdr from "../assets/envMap.jpg";
import Loader from "./loader";
import { CameraTypes } from "../utils/camera";

export class Scene extends THREE.Scene {
  private _sceneGraph: THREE.Object3D[] = [];
  private _sceneHelper: THREE.Scene;
  private _camera: CameraTypes;
  private _perspectiveCamera: THREE.PerspectiveCamera;
  private _orthographicCamera: THREE.OrthographicCamera;
  private _originalCamera: THREE.Camera | null = null;
  private _helpers: Array<THREE.BoxHelper | THREE.DirectionalLightHelper> = [];
  private _renderer: THREE.WebGLRenderer;
  private _is2DView: boolean = false;
  private _transformControls: TransformControls | null = null;

  private _registedCamera: THREE.Camera | null = null;
  private _selectCamera: THREE.Camera | null = null;

  private _selectedObject: THREE.Object3D[] = [];

  private _hdrTexture: THREE.Texture | null = null;

  private _listener: (() => void)[] = [];

  constructor(name: string) {
    super();
    const context = Context.getInstance();
    const dom: HTMLDivElement = context.dom!;
    this._renderer = context.renderer;

    this._is2DView = false;
    this._sceneGraph = [...this.children];
    this._sceneHelper = new THREE.Scene();

    // this.background = new THREE.Color(0x000000);
    this.name = name;
    this.fog = new THREE.Fog("#1A1E21", 1, 100);
    this._sceneHelper.fog = new THREE.Fog("#1A1E21", 1, 100);
    this.fog = new THREE.Fog(SCENE_BACKGROUND_COLOR, 1, 100);
    this._sceneHelper.fog = new THREE.Fog(SCENE_BACKGROUND_COLOR, 1, 100);

    Loader.getInstance()
      .loadTexture(hdr)
      .then((texture) => {
        this.backgroundRotation.z = (Math.PI / 180) * 180;
        this._hdrTexture = texture;
        this.background = this._hdrTexture;
        this.backgroundIntensity = 0.5;
      });

    this._perspectiveCamera = new THREE.PerspectiveCamera(
      DEFAULT_CAMERA_SPEC.fov,
      dom.clientWidth / dom.clientHeight,
      DEFAULT_CAMERA_SPEC.near,
      DEFAULT_CAMERA_SPEC.far
    );
    this._perspectiveCamera.name = "Perspective Camera";
    this._perspectiveCamera.position.set(
      DEFAULT_CAMERA_POSITION.x,
      DEFAULT_CAMERA_POSITION.y,
      DEFAULT_CAMERA_POSITION.z
    );
    this._perspectiveCamera.lookAt(
      DEFAULT_CAMERA_TARGET.x,
      DEFAULT_CAMERA_TARGET.y,
      DEFAULT_CAMERA_TARGET.z
    );

    this._camera = this._perspectiveCamera;

    const frustumSize =
      2 *
      Math.tan((DEFAULT_CAMERA_SPEC.fov * Math.PI) / 180 / 2) *
      this._perspectiveCamera.position.z;
    const aspect = dom.clientWidth / dom.clientHeight;

    this._orthographicCamera = new THREE.OrthographicCamera(
      (-frustumSize * aspect) / 2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      -frustumSize / 2,
      this._perspectiveCamera.near,
      this._perspectiveCamera.far
    );
    this._orthographicCamera.name = "Orthographic Camera";
    this._orthographicCamera.position.set(0, 0, 10);

    this.add(this._orthographicCamera);

    this.defaultScene();

    this._transformControls = new TransformControls(this._camera, dom);
    // this._transformControls.setSpace("local");
    this._sceneHelper.add(this._transformControls.getHelper());

    // const axesHelper = new THREE.AxesHelper(1000);
    // axesHelper.setColors(RGB_COLOR.r, RGB_COLOR.g, RGB_COLOR.b);
    // this.sceneHelper.add(axesHelper);
    dom.appendChild(this._renderer.domElement);
  }

  get camera() {
    return this._camera;
  }

  get sceneHelper() {
    return this._sceneHelper;
  }

  get sceneGraph() {
    return this._sceneGraph;
  }

  get originalCamera() {
    return this._originalCamera;
  }

  get perspectiveCamera() {
    return this._perspectiveCamera;
  }

  get orthographicCamera() {
    return this._orthographicCamera;
  }

  set originalCamera(camera: THREE.Camera | null) {
    this._originalCamera = camera;
  }

  get transformControls() {
    return this._transformControls;
  }

  get registedCamera() {
    return this._registedCamera;
  }
  set registedCamera(camera: THREE.Camera | null) {
    this._registedCamera = camera;
  }

  get selectedCamera() {
    return this._selectCamera;
  }
  set selectedCamera(camera: THREE.Camera | null) {
    this._selectCamera = camera;
  }

  get is2DView() {
    return this._is2DView;
  }

  set is2DView(value: boolean) {
    this._is2DView = value;
  }

  get selectedObject(): THREE.Object3D[] {
    return this._selectedObject;
  }

  set selectedObject(object: THREE.Object3D[]) {
    console.log("📢select notify");

    // this.removeObject(this._transformControls?.group as THREE.Group, false);

    // this.attachTransformControls(object);
    this._transformControls?.detach();

    this._selectedObject = object;

    this.updateSceneGraph();
    this.notify();
    // this._transformControls?.attach(object);
    this._transformControls?.attach(object);
  }

  public addObject(object: THREE.Object3D, update: boolean = true): this {
    super.add(object);
    if (update) {
      this.updateSceneGraph();
    }

    return this;
  }

  public attachObject = (
    object: THREE.Object3D,
    update: boolean = false
  ): this => {
    this.attach(object);

    if (update) {
      this.updateSceneGraph();
    }

    return this;
  };

  public removeObject = (
    object: THREE.Object3D,
    update: boolean = true
  ): this => {
    super.remove(object);
    if (update) {
      this.updateSceneGraph();
    }
    return this;
  };

  public updateSceneGraph() {
    this._sceneGraph = [...this.children];

    // const context = Context.getInstance();
    // context.notify();
    this.notify();
  }

  public defaultScene = () => {
    const camera = new THREE.PerspectiveCamera(50, 64 / 24, 0.5, 50);
    camera.name = "Perspective Camera";
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
    this.add(camera);

    const cameraHelper = new THREE.CameraHelper(camera);

    this.sceneHelper.add(cameraHelper);

    const light = new THREE.DirectionalLight(0xffffff, 1.75);
    light.name = "DirectionalLight";
    light.position.set(0.7, 3, 1.5);

    this.add(light);

    const lightHelper = new THREE.DirectionalLightHelper(light);
    this._helpers.push(lightHelper);
    this._sceneHelper.add(lightHelper);

    const box: THREE.Mesh = createMesh("Box") as THREE.Mesh;
    const box2: THREE.Mesh = createMesh("Box") as THREE.Mesh;
    box.position.set(-1, 0, 0);
    box.name = "Box";
    box2.position.set(1, 0, 0);
    box2.name = "Box2";
    this.add(box);
    this.add(box2);
    light.target = box;

    const grid = new Grid(1000, 1000);
    this._sceneHelper.add(grid);

    this.updateSceneGraph();
  };

  public changeCameraMode = () => {
    const context = Context.getInstance();

    const position = this._camera.position.clone();
    const rotation = this._camera.rotation.clone();
    const up = this._camera.up.clone();
    if (this._camera instanceof THREE.OrthographicCamera) {
      console.log("Change Camera To %cPerspectiveCamera", "color: skyblue");

      // Zoom 복원
      this._perspectiveCamera.zoom = 1 / this._orthographicCamera.zoom;
      this._perspectiveCamera.updateProjectionMatrix();
      this._perspectiveCamera.position.copy(position);
      this._perspectiveCamera.rotation.copy(rotation);
      this._perspectiveCamera.up.copy(up);

      // 위치 및 회전 유지
      this._camera = this._perspectiveCamera;

      context.updateControls(this._perspectiveCamera);
    } else if (this._camera instanceof THREE.PerspectiveCamera) {
      console.log("Change Camera To %cOrthographicCamera", "color: skyblue");
      const aspect =
        this._renderer.domElement.clientWidth /
        this._renderer.domElement.clientHeight;

      this._perspectiveCamera.aspect = aspect;
      this._perspectiveCamera.updateProjectionMatrix();

      this._orthographicCamera.left = this._orthographicCamera.bottom * aspect;
      this._orthographicCamera.right = this._orthographicCamera.top * aspect;

      this._orthographicCamera.position.copy(this._camera.position);
      this._orthographicCamera.rotation.copy(this._camera.rotation);
      this._orthographicCamera.up.copy(this._camera.up);

      this._camera = this._orthographicCamera;

      context.updateControls(this._orthographicCamera);
    }

    context.viewHelper.camera = this._camera as
      | THREE.PerspectiveCamera
      | THREE.OrthographicCamera;
    context.camera = this._camera;
  };

  public change2DView = () => {
    const context = Context.getInstance();
    if (this._camera instanceof THREE.OrthographicCamera) {
      new JEASINGS.JEasing(this._camera.position)
        .to(
          {
            x: this._originalCamera!.position.x,
            y: this._originalCamera!.position.y,
            z: this._originalCamera!.position.z,
          },
          1.5
        )
        .easing(JEASINGS.Quadratic.Out)
        .onComplete(() => {
          this._camera = this._perspectiveCamera;
          context.updateControls(this._perspectiveCamera);
          this._is2DView = false;
        })
        .start();

      this._is2DView = false;
    } else if (this._camera instanceof THREE.PerspectiveCamera) {
      new JEASINGS.JEasing(this._camera.position)
        .to({ x: 0, y: 0, z: 10 }, 1.5)
        .easing(JEASINGS.Quadratic.Out)
        .onComplete(() => {
          this._camera = this._orthographicCamera;
          context.updateControls(this._orthographicCamera);
          this._is2DView = true;
        })
        .start();
    }
  };

  public hiddenHDR = () => {
    // this._hdrTexture = null;
    this.background = new THREE.Color(SCENE_BACKGROUND_COLOR);
  };

  public showHDR = () => {
    this.background = this._hdrTexture;
  };

  public dispose = () => {
    this.clear();
    this._sceneHelper.clear();
  };

  public subscribe(listener: () => void) {
    this._listener = [...this._listener, listener];
    this.notify();
  }

  public unsubscribe(listener: () => void) {
    this._listener = this._listener.filter((l) => l !== listener);
  }

  public notify() {
    this._listener.forEach((l) => l());
  }

  public render = () => {
    this._helpers.forEach((helper) => {
      helper.update();
    });

    if (this._selectCamera) {
      JEASINGS.update();
    }

    // if (this._camera instanceof THREE.PerspectiveCamera) {
    //   this.syncCamera(this._camera, this._orthographicCamera);
    // } else {
    //   this.syncCamera(this._camera, this._perspectiveCamera);
    // }
  };
}
