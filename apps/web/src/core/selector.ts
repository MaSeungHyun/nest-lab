import * as THREE from "three";
import { SelectionBox } from "three/examples/jsm/interactive/SelectionBox.js";
import { MOUSE_LEFT } from "../constants/controls";
import { Scene } from "./scene";

export class Selector {
  private box: SelectionBox;
  private _raycaster: THREE.Raycaster;
  private _renderer: THREE.WebGLRenderer;
  private _dom: HTMLElement;
  private _scene: Scene;
  private _camera: THREE.Camera;
  private _isSelecting: boolean = false;
  private _startPoint: THREE.Vector2 = new THREE.Vector2();
  private _selectionBoxElement: HTMLDivElement | null = null;
  private _selectedOutlineHelpers: Array<{
    outline: THREE.LineSegments;
    object: THREE.Mesh;
  }> = []; // 선택 완료된 오브젝트의 외곽선 (오브젝트 참조 포함)
  private _outlineColor: THREE.Color = new THREE.Color(0x00ced6); // 시안색

  private _pointerDown: (event: MouseEvent) => void;
  private _pointerMove: (event: MouseEvent) => void;
  private _pointerUp: (event: MouseEvent) => void;
  private _sceneSelectionListener: (() => void) | null = null;

  constructor(
    renderer: THREE.WebGLRenderer,
    camera: THREE.Camera,
    scene: Scene,
    dom: HTMLElement
  ) {
    this._renderer = renderer;
    this._dom = dom;
    this._scene = scene;
    this._camera = camera;
    this.box = new SelectionBox(camera, scene);
    this._raycaster = new THREE.Raycaster();

    this._pointerDown = this.onPointerDown.bind(this);
    this._pointerMove = this.onPointerMove.bind(this);
    this._pointerUp = this.onPointerUp.bind(this);

    // 선택 박스 DOM 요소 생성
    this._selectionBoxElement = document.createElement("div");
    this._selectionBoxElement.className = "selectBox";
    this._selectionBoxElement.style.cssText = `
      position: absolute;
      border: 1px dashed #00ced6;
      background: rgba(0, 206, 214, 0.1);
      pointer-events: none;
      display: none;
    `;
    this._dom.appendChild(this._selectionBoxElement);

    // Scene의 selectedObject 변경을 구독하여 외곽선 업데이트
    this._sceneSelectionListener = () => {
      this.updateSelectedObjectOutlines();
    };
    this._scene.subscribe(this._sceneSelectionListener);

    // 초기 선택된 오브젝트에 외곽선 표시
    this.updateSelectedObjectOutlines();
  }

  public onPointerDown(event: MouseEvent) {
    if (event.button === MOUSE_LEFT) {
      // TransformControls가 드래그 중이면 선택 비활성화
      const transformControls = this._scene.transformControls;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (transformControls && (transformControls as any).dragging === true) {
        // TransformControls가 드래그 중이면 선택 비활성화
        return;
      }

      this._isSelecting = true;
      const rect = this._renderer.domElement.getBoundingClientRect();

      // 시작점 저장 (단일 클릭인지 드래그인지 판단하기 위해)
      this._startPoint.set(event.clientX, event.clientY);

      // 정규화된 좌표 계산
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.box.startPoint.set(x, y, 0);
      this.box.endPoint.set(x, y, 0);

      // 선택 박스 표시
      if (this._selectionBoxElement) {
        this._selectionBoxElement.style.display = "block";
        this._selectionBoxElement.style.left = `${event.clientX - rect.left}px`;
        this._selectionBoxElement.style.top = `${event.clientY - rect.top}px`;
        this._selectionBoxElement.style.width = "0px";
        this._selectionBoxElement.style.height = "0px";
      }

      this._renderer.domElement.addEventListener(
        "pointermove",
        this._pointerMove
      );
      this._renderer.domElement.addEventListener("pointerup", this._pointerUp);
    }
  }

  public onPointerMove(event: MouseEvent) {
    if (this._isSelecting && this._selectionBoxElement) {
      const rect = this._renderer.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.box.endPoint.set(x, y, 0);

      // 선택 박스 크기 업데이트
      const startX = this._startPoint.x - rect.left;
      const startY = this._startPoint.y - rect.top;
      const currentX = event.clientX - rect.left;
      const currentY = event.clientY - rect.top;

      const left = Math.min(startX, currentX);
      const top = Math.min(startY, currentY);
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);

      this._selectionBoxElement.style.left = `${left}px`;
      this._selectionBoxElement.style.top = `${top}px`;
      this._selectionBoxElement.style.width = `${width}px`;
      this._selectionBoxElement.style.height = `${height}px`;
    }
  }

  public onPointerUp(event: MouseEvent) {
    if (!this._isSelecting) return;

    // TransformControls가 드래그 중이면 선택 비활성화
    const transformControls = this._scene.transformControls;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (transformControls && (transformControls as any).dragging === true) {
      this._isSelecting = false;
      // 선택 박스 숨기기
      if (this._selectionBoxElement) {
        this._selectionBoxElement.style.display = "none";
      }
      // 이벤트 리스너 제거
      this._renderer.domElement.removeEventListener(
        "pointermove",
        this._pointerMove
      );
      this._renderer.domElement.removeEventListener(
        "pointerup",
        this._pointerUp
      );
      return;
    }

    event.stopPropagation();
    const rect = this._renderer.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.box.endPoint.set(x, y, 0);

    // 선택 박스 숨기기
    if (this._selectionBoxElement) {
      this._selectionBoxElement.style.display = "none";
    }

    // 드래그 거리 계산 (단일 클릭인지 판단)
    const dragDistance = Math.sqrt(
      Math.pow(event.clientX - this._startPoint.x, 2) +
        Math.pow(event.clientY - this._startPoint.y, 2)
    );

    let selectedObjects: THREE.Object3D[] = [];

    // 단일 클릭인 경우 Raycaster 사용 (정확한 단일 오브젝트 선택)
    if (dragDistance < 5) {
      // Raycaster로 클릭한 위치의 오브젝트 선택
      const rect = this._renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this._raycaster.setFromCamera(mouse, this._camera);
      const intersects = this._raycaster.intersectObjects(
        this._scene.children,
        true
      );

      if (intersects.length > 0) {
        // 가장 가까운 오브젝트만 선택
        const firstIntersect = intersects[0].object;
        // Scene이 아닌 오브젝트만 선택
        if (!(firstIntersect instanceof THREE.Scene)) {
          selectedObjects = [firstIntersect] as unknown as THREE.Object3D[];
        }
      }
    } else {
      // 드래그인 경우 SelectionBox 사용 (여러 오브젝트 선택)
      selectedObjects = this.box.select() as unknown as THREE.Object3D[];
    }

    // Scene의 selectedObject에 설정
    if (selectedObjects.length === 0) {
      // 선택된 오브젝트가 없으면 선택 해제
      this._scene.selectedObject = [];
    } else {
      // Scene이 아닌 오브젝트만 필터링
      const filteredObjects = selectedObjects.filter(
        (obj) => !(obj instanceof THREE.Scene)
      ) as unknown as THREE.Object3D[];

      this._scene.selectedObject = filteredObjects;
    }

    // 이벤트 리스너 제거
    this._renderer.domElement.removeEventListener(
      "pointermove",
      this._pointerMove
    );
    this._renderer.domElement.removeEventListener("pointerup", this._pointerUp);

    this._isSelecting = false;
  }

  /**
   * 선택 완료된 오브젝트에 외곽선 추가 (외곽선만, 모든 edge가 아닌)
   */
  private updateSelectedObjectOutlines() {
    // 기존 외곽선 제거
    this.clearSelectedObjectOutlines();

    // Scene의 selectedObject 가져오기
    const selectedObjects = this._scene.selectedObject;

    // Mesh 오브젝트만 필터링
    const meshObjects = selectedObjects.filter(
      (obj) => obj instanceof THREE.Mesh
    ) as THREE.Mesh[];

    // 각 오브젝트에 외곽선 추가 (threshold를 높게 설정하여 외곽선만 표시)
    meshObjects.forEach((object) => {
      if (object.geometry) {
        // threshold를 높게 설정하여 외곽선(두 면이 만나는 각도가 큰 곳)만 표시
        // 값이 클수록 더 적은 edge만 표시 (외곽선에 가까운 edge만)
        const edges = new THREE.EdgesGeometry(object.geometry, 30); // 30도 이상 각도인 edge만 표시
        const outline = new THREE.LineSegments(
          edges,
          new THREE.LineBasicMaterial({
            color: this._outlineColor,
            linewidth: 2,
            depthTest: true, // 깊이 테스트 활성화 (오브젝트에 가려질 수 있음)
            depthWrite: true, // 깊이 버퍼에 쓰지 않음 (다른 오브젝트가 가릴 수 있음)
          })
        );

        // 오브젝트의 world matrix를 사용하여 외곽선의 위치, 회전, 스케일 동기화
        object.updateMatrixWorld(true);
        outline.matrix.copy(object.matrixWorld);
        // 외곽선을 약간 확대하여 오브젝트 외곽에 표시
        outline.matrix.scale(new THREE.Vector3(1.01, 1.01, 1.01));
        outline.matrixAutoUpdate = false; // 자동 업데이트 비활성화 (수동으로 동기화)

        // sceneHelper에 추가
        this._scene.sceneHelper.add(outline);
        this._selectedOutlineHelpers.push({ outline, object }); // 오브젝트 참조도 저장하여 업데이트 시 사용
      }
    });
  }

  /**
   * 선택 완료된 오브젝트의 외곽선 제거
   */
  private clearSelectedObjectOutlines() {
    this._selectedOutlineHelpers.forEach(({ outline }) => {
      // sceneHelper에서 제거
      if (outline.parent) {
        outline.parent.remove(outline);
      }
      outline.geometry.dispose();
      if (outline.material instanceof THREE.Material) {
        outline.material.dispose();
      }
    });
    this._selectedOutlineHelpers = [];
  }

  /**
   * 외곽선의 위치를 오브젝트와 동기화 (렌더링 시 호출)
   */
  public updateOutlinePositions() {
    this._selectedOutlineHelpers.forEach(({ outline, object }) => {
      object.updateMatrixWorld(true);
      outline.matrix.copy(object.matrixWorld);
      // 외곽선을 약간 확대하여 오브젝트 외곽에 표시
      outline.matrix.scale(new THREE.Vector3(1.01, 1.01, 1.01));
    });
  }

  public dispose() {
    // Scene 구독 해제
    if (this._sceneSelectionListener) {
      this._scene.unsubscribe(this._sceneSelectionListener);
    }

    this.clearSelectedObjectOutlines();
    if (this._selectionBoxElement && this._selectionBoxElement.parentNode) {
      this._selectionBoxElement.parentNode.removeChild(
        this._selectionBoxElement
      );
    }
    this._dom.removeEventListener("pointermove", this._pointerMove);
    this._dom.removeEventListener("pointerup", this._pointerUp);
    this._dom.removeEventListener("pointerdown", this._pointerDown);
  }

  public connect() {
    this._dom.addEventListener("pointerdown", (event: MouseEvent) => {
      this._pointerDown(event);
    });
    this._dom.addEventListener("pointermove", (event: MouseEvent) => {
      this._pointerMove(event);
    });
    this._dom.addEventListener("pointerup", (event: MouseEvent) => {
      this._pointerUp(event);
    });
  }

  // public render() {
  //   this._composer.render();
  //   this._composer.renderer.autoClear = true;
  // }
}
