import * as THREE from "three";

export class Object3D extends THREE.Object3D {
  private _sceneGraph: THREE.Object3D[] = [];
  constructor() {
    super();
    this._sceneGraph = [];
  }
  addObject(object: THREE.Object3D, update: boolean = true) {
    super.add(object);
    if (update) {
      this.updateSceneGraph();
    }
  }

  get sceneGraph() {
    return this._sceneGraph;
  }

  updateSceneGraph() {
    this._sceneGraph = [...this.children];
  }
}
