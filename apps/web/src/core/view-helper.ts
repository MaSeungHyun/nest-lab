import {
  CylinderGeometry,
  CanvasTexture,
  Color,
  Euler,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  OrthographicCamera,
  Quaternion,
  Raycaster,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  Vector2,
  Vector3,
  Vector4,
} from "three";

import * as THREE from "three";

class ViewHelper extends Object3D {
  public isViewHelper = true;
  public animating = false;
  public center = new Vector3();

  private readonly options: {
    labelX?: string;
    labelY?: string;
    labelZ?: string;
    font?: string;
    color?: THREE.ColorRepresentation;
    radius?: number;
  } = {};

  private readonly color1 = new Color("#ff4466");
  private readonly color2 = new Color("#88ff44");
  private readonly color3 = new Color("#4488ff");
  private readonly color4 = new Color("#000000");

  private readonly interactiveObjects: THREE.Sprite[] = [];
  private readonly raycaster = new Raycaster();
  private readonly mouse = new Vector2();
  private readonly dummy = new Object3D();

  private readonly orthoCamera = new OrthographicCamera(-2, 2, 2, -2, 0, 4);
  private readonly geometry = new CylinderGeometry(0.04, 0.04, 0.8, 5)
    .rotateZ(-Math.PI / 2)
    .translate(0.4, 0, 0);
  // private readonly geometry = new THREE.BoxGeometry(1, 1)
  // .rotateZ(-Math.PI / 2)
  // .translate(0.4, 0, 0);

  private readonly xAxis = new Mesh(
    this.geometry,
    this.getAxisMaterial(this.color1)
  );
  private readonly yAxis = new Mesh(
    this.geometry,
    this.getAxisMaterial(this.color2)
  );
  private readonly zAxis = new Mesh(
    this.geometry,
    this.getAxisMaterial(this.color3)
  );

  private readonly posXAxisHelper: Sprite;
  private readonly posYAxisHelper: Sprite;
  private readonly posZAxisHelper: Sprite;
  private readonly negXAxisHelper: Sprite;
  private readonly negYAxisHelper: Sprite;
  private readonly negZAxisHelper: Sprite;

  private readonly point = new Vector3();
  private readonly dim = 128;
  private readonly turnRate = 2 * Math.PI; // turn rate in angles per second

  private readonly targetPosition = new Vector3();
  private readonly targetQuaternion = new Quaternion();

  private readonly q1 = new Quaternion();
  private readonly q2 = new Quaternion();
  private readonly viewport = new Vector4();
  private radius = 0;

  public camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  private domElement: HTMLElement;

  constructor(
    camera: THREE.PerspectiveCamera | THREE.OrthographicCamera,
    domElement: HTMLElement
  ) {
    super();
    this.camera = camera;
    this.domElement = domElement;

    this.orthoCamera.position.set(0, 0, 2);

    this.yAxis.rotation.z = Math.PI / 2;
    this.zAxis.rotation.y = -Math.PI / 2;

    this.add(this.xAxis);
    this.add(this.zAxis);
    this.add(this.yAxis);

    const spriteMaterial1 = this.getSpriteMaterial(this.color1);
    const spriteMaterial2 = this.getSpriteMaterial(this.color2);
    const spriteMaterial3 = this.getSpriteMaterial(this.color3);
    const spriteMaterial4 = this.getSpriteMaterial(this.color4);

    this.posXAxisHelper = new Sprite(spriteMaterial1);
    this.posYAxisHelper = new Sprite(spriteMaterial2);
    this.posZAxisHelper = new Sprite(spriteMaterial3);
    this.negXAxisHelper = new Sprite(spriteMaterial4);
    this.negYAxisHelper = new Sprite(spriteMaterial4);
    this.negZAxisHelper = new Sprite(spriteMaterial4);

    this.posXAxisHelper.position.x = 1;
    this.posYAxisHelper.position.y = 1;
    this.posZAxisHelper.position.z = 1;
    this.negXAxisHelper.position.x = -1;
    this.negYAxisHelper.position.y = -1;
    this.negZAxisHelper.position.z = -1;

    this.negXAxisHelper.material.opacity = 0.2;
    this.negYAxisHelper.material.opacity = 0.2;
    this.negZAxisHelper.material.opacity = 0.2;

    this.posXAxisHelper.userData.type = "posX";
    this.posYAxisHelper.userData.type = "posY";
    this.posZAxisHelper.userData.type = "posZ";
    this.negXAxisHelper.userData.type = "negX";
    this.negYAxisHelper.userData.type = "negY";
    this.negZAxisHelper.userData.type = "negZ";

    this.add(this.posXAxisHelper);
    this.add(this.posYAxisHelper);
    this.add(this.posZAxisHelper);
    this.add(this.negXAxisHelper);
    this.add(this.negYAxisHelper);
    this.add(this.negZAxisHelper);

    this.interactiveObjects.push(this.posXAxisHelper);
    this.interactiveObjects.push(this.posYAxisHelper);
    this.interactiveObjects.push(this.posZAxisHelper);
    this.interactiveObjects.push(this.negXAxisHelper);
    this.interactiveObjects.push(this.negYAxisHelper);
    this.interactiveObjects.push(this.negZAxisHelper);
  }

  public render(renderer: THREE.WebGLRenderer) {
    this.quaternion.copy(this.camera.quaternion).invert();
    this.updateMatrixWorld();

    this.point.set(0, 0, 1);
    this.point.applyQuaternion(this.camera.quaternion);

    const x = this.domElement.offsetWidth - this.dim;

    renderer.getViewport(this.viewport);
    renderer.setViewport(x, 0, this.dim, this.dim);

    renderer.render(this, this.orthoCamera);

    renderer.setViewport(
      this.viewport.x,
      this.viewport.y,
      this.viewport.z,
      this.viewport.w
    );
  }

  protected handleClick(event: MouseEvent) {
    event.stopPropagation();
    if (this.animating === true) return false;

    const rect = this.domElement.getBoundingClientRect();

    const offsetX = rect.left + (this.domElement.offsetWidth - this.dim);
    const offsetY = rect.top + (this.domElement.offsetHeight - this.dim);
    this.mouse.x = ((event.clientX - offsetX) / (rect.right - offsetX)) * 2 - 1;
    this.mouse.y =
      -((event.clientY - offsetY) / (rect.bottom - offsetY)) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.orthoCamera);

    const intersects = this.raycaster.intersectObjects(this.interactiveObjects);

    if (intersects.length > 0) {
      const intersection = intersects[0];
      const object = intersection.object;

      this.prepareAnimationData(object, this.center);

      this.animating = true;

      return true;
    } else {
      return false;
    }
  }

  protected setLabels(labelX: string, labelY: string, labelZ: string) {
    this.options.labelX = labelX;
    this.options.labelY = labelY;
    this.options.labelZ = labelZ;
    this.updateLabels();
  }

  protected setLabelStyle(
    font: (typeof this.options)["font"],
    color: (typeof this.options)["color"],
    radius: (typeof this.options)["radius"]
  ) {
    this.options.font = font;
    this.options.color = color;
    this.options.radius = radius;
    this.updateLabels();
  }

  public update(delta: number) {
    const step = delta * this.turnRate;

    // animate position by doing a slerp and then scaling the position on the unit sphere

    this.q1.rotateTowards(this.q2, step);
    this.camera.position
      .set(0, 0, 1)
      .applyQuaternion(this.q1)
      .multiplyScalar(this.radius)
      .add(this.center);

    // animate orientation

    this.camera.quaternion.rotateTowards(this.targetQuaternion, step);

    if (this.q1.angleTo(this.q2) === 0) {
      this.animating = false;
    }
  }

  public dispose() {
    this.geometry.dispose();

    this.xAxis.material.dispose();
    this.yAxis.material.dispose();
    this.zAxis.material.dispose();

    this.posXAxisHelper.material.map?.dispose();
    this.posYAxisHelper.material.map?.dispose();
    this.posZAxisHelper.material.map?.dispose();
    this.negXAxisHelper.material.map?.dispose();
    this.negYAxisHelper.material.map?.dispose();
    this.negZAxisHelper.material.map?.dispose();

    this.posXAxisHelper.material.dispose();
    this.posYAxisHelper.material.dispose();
    this.posZAxisHelper.material.dispose();
    this.negXAxisHelper.material.dispose();
    this.negYAxisHelper.material.dispose();
    this.negZAxisHelper.material.dispose();
  }

  private prepareAnimationData(
    object: THREE.Object3D,
    focusPoint: THREE.Vector3
  ) {
    switch (object.userData.type) {
      case "posX":
        this.targetPosition.set(1, 0, 0);
        this.targetQuaternion.setFromEuler(new Euler(0, Math.PI * 0.5, 0));
        break;

      case "posY":
        this.targetPosition.set(0, 1, 0);
        this.targetQuaternion.setFromEuler(new Euler(-Math.PI * 0.5, 0, 0));
        break;

      case "posZ":
        this.targetPosition.set(0, 0, 1);
        this.targetQuaternion.setFromEuler(new Euler());
        break;

      case "negX":
        this.targetPosition.set(-1, 0, 0);
        this.targetQuaternion.setFromEuler(new Euler(0, -Math.PI * 0.5, 0));
        break;

      case "negY":
        this.targetPosition.set(0, -1, 0);
        this.targetQuaternion.setFromEuler(new Euler(Math.PI * 0.5, 0, 0));
        break;

      case "negZ":
        this.targetPosition.set(0, 0, -1);
        this.targetQuaternion.setFromEuler(new Euler(0, Math.PI, 0));
        break;

      default:
        console.error("ViewHelper: Invalid axis.");
    }

    //

    this.radius = this.camera.position.distanceTo(focusPoint);
    this.targetPosition.multiplyScalar(this.radius).add(focusPoint);

    this.dummy.position.copy(focusPoint);

    this.dummy.lookAt(this.camera.position);
    this.q1.copy(this.dummy.quaternion);

    this.dummy.lookAt(this.targetPosition);
    this.q2.copy(this.dummy.quaternion);
  }

  private getAxisMaterial(color: THREE.ColorRepresentation) {
    return new MeshBasicMaterial({ color: color, toneMapped: false });
  }

  private getSpriteMaterial(color: THREE.Color, text?: string) {
    const {
      font = "24px Arial",
      color: labelColor = "#000000",
      radius = 14,
    } = this.options;
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;

    const context = canvas.getContext("2d");
    context!.beginPath();
    context!.arc(32, 32, radius, 0, 2 * Math.PI);
    context!.closePath();
    context!.fillStyle = color.getStyle();
    context!.fill();

    if (text) {
      context!.font = font;
      context!.textAlign = "center";
      context!.fillStyle = labelColor as string;
      context!.fillText(text, 32, 41);
    }

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;

    return new SpriteMaterial({ map: texture, toneMapped: false });
  }

  protected updateLabels() {
    this.posXAxisHelper.material.map?.dispose();
    this.posYAxisHelper.material.map?.dispose();
    this.posZAxisHelper.material.map?.dispose();

    this.posXAxisHelper.material.dispose();
    this.posYAxisHelper.material.dispose();
    this.posZAxisHelper.material.dispose();

    this.posXAxisHelper.material = this.getSpriteMaterial(
      this.color1,
      this.options.labelX
    );
    this.posYAxisHelper.material = this.getSpriteMaterial(
      this.color2,
      this.options.labelY
    );
    this.posZAxisHelper.material = this.getSpriteMaterial(
      this.color3,
      this.options.labelZ
    );
  }
}

export { ViewHelper };
