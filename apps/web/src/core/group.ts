import * as THREE from "three";

export class Group extends THREE.Group {
  constructor() {
    super();
  }

  addObject(object: THREE.Object3D) {
    super.add(object);
  }

  attachObject(object: THREE.Object3D) {
    super.attach(object);
  }
}
