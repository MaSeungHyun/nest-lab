import * as THREE from "three";

export class CameraHelper extends THREE.CameraHelper {
  constructor(camera: THREE.Camera) {
    super(camera);

    this.name = "CameraHelper";
    this.visible = true;

    this.setCustomGeometryColors();
    this.update();
  }

  setCustomGeometryColors() {
    const geometry = this.geometry;
    const positionCount = geometry.attributes.position.count;
    const colors = new Float32Array(positionCount * 3);

    // CameraHelper의 구조를 이해하여 부분별 색상 적용
    for (let i = 0; i < positionCount; i++) {
      if (i < 24) {
        // 카메라 frustum (절두체) - 파란색
        colors[i * 3] = 1; // R
        colors[i * 3 + 1] = 0.3; // G
        colors[i * 3 + 2] = 0.0; // B
      } else if (i < 32) {
        // 카메라 중심선 - 초록색
        colors[i * 3] = 0.0; // R
        colors[i * 3 + 1] = 0.0; // G
        colors[i * 3 + 2] = 0.0; // B
      } else {
        // 나머지 부분 - 빨간색
        colors[i * 3] = 0.0; // R
        colors[i * 3 + 1] = 1.0; // G
        colors[i * 3 + 2] = 0.0; // B
      }
    }

    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    if (this.material instanceof THREE.LineBasicMaterial) {
      this.material.vertexColors = true;
      this.material.needsUpdate = true;
    }
  }
}
