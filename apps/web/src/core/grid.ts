import * as THREE from "three";
import { RGB_COLOR, GRID_COLOR } from "../constants/color";
import {} from "../constants/color";

export class Grid extends THREE.Group {
  type: string;

  private readonly gridXY: THREE.GridHelper; // XY 평면
  private readonly gridXZ: THREE.GridHelper; // ZX 평면
  private readonly gridYZ: THREE.GridHelper; // YZ 평면
  opacity: number = 0.5;
  constructor(size: number, divisions: number) {
    super();
    this.type = "GridHelper";
    this.gridXZ = this.createGrid(
      size,
      divisions,
      this.opacity,
      new THREE.Color(RGB_COLOR.r),
      new THREE.Color(RGB_COLOR.b)
    );
    this.add(this.gridXZ);

    this.gridXY = this.createGrid(
      1,
      1,
      this.opacity,
      new THREE.Color(RGB_COLOR.r),
      new THREE.Color(RGB_COLOR.b)
    );
    this.gridXY.rotation.x = Math.PI / 2;
    // this.add(this.gridXY);

    this.gridYZ = this.createGrid(
      size,
      2,
      this.opacity,
      new THREE.Color(RGB_COLOR.g),
      new THREE.Color(RGB_COLOR.r)
    );
    this.gridYZ.rotation.z = Math.PI / 2;
    // this.add(this.gridYZ);
  }

  private createGrid(
    size: number,
    divisions: number,
    opacity: number = 0.5,
    color1: THREE.Color,
    color2: THREE.Color,
    normalColor = new THREE.Color(GRID_COLOR)
  ) {
    // Make it transparent
    const grid = new THREE.GridHelper(size, divisions);
    grid.material.opacity = opacity;
    grid.material.transparent = true;

    // Modify geometry to set different colors for center lines
    const gridGeometry = grid.geometry;
    const positionAttr = gridGeometry.getAttribute("position");

    const colorAttr = new THREE.BufferAttribute(
      new Float32Array(positionAttr.count * 3),
      3
    );

    const colorNormal = normalColor;

    for (let i = 0; i < positionAttr.count; i++) {
      let x = positionAttr.getX(i);
      let z = positionAttr.getZ(i);

      if (z === 0) {
        color1.toArray(colorAttr.array, i * 3);
      } else if (x === 0) {
        color2.toArray(colorAttr.array, i * 3);
      } else {
        colorNormal.toArray(colorAttr.array, i * 3);
      }
    }
    gridGeometry.setAttribute("color", colorAttr);
    grid.material.vertexColors = true;
    grid.frustumCulled = false;
    return grid;
  }
  public setOpacity(opacity: number): void {
    this.gridXY.material.opacity = opacity;
    this.gridXZ.material.opacity = opacity;
    this.gridYZ.material.opacity = opacity;
  }

  public showGridXY() {
    this.gridXY.visible = true;
    this.gridXZ.visible = false;
    this.gridYZ.visible = false;
  }

  public showGridXZ() {
    this.gridXY.visible = false;
    this.gridXZ.visible = true;
    this.gridYZ.visible = false;
  }

  public showGridYZ() {
    this.gridXY.visible = false;
    this.gridXZ.visible = false;
    this.gridYZ.visible = true;
  }

  public showAllGrid() {
    this.gridXY.visible = true;
    this.gridXZ.visible = true;
    this.gridYZ.visible = true;
  }

  public hiddenAllGrid() {
    this.gridXY.visible = false;
    this.gridXZ.visible = false;
    this.gridYZ.visible = false;
  }

  public update(camera: THREE.Camera): void {
    if (!camera) {
      return;
    }

    // 카메라의 방향 벡터 계산
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    // 카메라 위치에서 방향 벡터를 따라가는 광선 생성
    const raycaster = new THREE.Raycaster(camera.position, direction, 0.1, 100);

    // 그리드 평면과의 교점 계산
    const planeXY = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const planeXZ = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const planeYZ = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);

    const intersectXY = raycaster.ray.intersectPlane(
      planeXY,
      new THREE.Vector3()
    );
    const intersectXZ = raycaster.ray.intersectPlane(
      planeXZ,
      new THREE.Vector3()
    );
    const intersectYZ = raycaster.ray.intersectPlane(
      planeYZ,
      new THREE.Vector3()
    );

    // 교점 거리 계산
    const distanceXY = intersectXY
      ? camera.position.distanceTo(intersectXY)
      : 0;
    const distanceXZ = intersectXZ
      ? camera.position.distanceTo(intersectXZ)
      : 0;
    const distanceYZ = intersectYZ
      ? camera.position.distanceTo(intersectYZ)
      : 0;

    // 거리 기반으로 scale 계산
    const scaleXY = this.getScaleByDistance(distanceXY);
    const scaleXZ = this.getScaleByDistance(distanceXZ);
    const scaleYZ = this.getScaleByDistance(distanceYZ);

    // 그리드의 scale 적용
    this.gridXY.scale.set(scaleXY, scaleXY, scaleXY);
    this.gridXZ.scale.set(scaleXZ, scaleXZ, scaleXZ);
    this.gridYZ.scale.set(scaleYZ, scaleYZ, scaleYZ);
  }

  private getScaleByDistance(distance: number): number {
    if (distance < 1) {
      return 0.5;
    } else if (distance < 20) {
      return 2;
    } else if (distance < 50) {
      return 4;
    } else if (distance < 100) {
      return 8;
    } else if (distance < 200) {
      return 16;
    } else if (distance < 300) {
      return 32;
    } else if (distance < 400) {
      return 32;
    } else {
      return Math.trunc(distance / 10);
    }
  }

  public dispose(): void {
    this.gridXY.dispose();
    this.gridXZ.dispose();
    this.gridYZ.dispose();
  }
}
