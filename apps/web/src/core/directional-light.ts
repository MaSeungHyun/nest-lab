import * as THREE from "three";

export class DirectionalLight extends THREE.DirectionalLight {
  private _sceneGraph: THREE.Object3D[] = [];
  constructor(color: number, intensity: number) {
    super(color, intensity);
  }

  get sceneGraph() {
    return this._sceneGraph;
  }

  set sceneGraph(sceneGraph: THREE.Object3D[]) {
    this._sceneGraph = sceneGraph;
  }
}
