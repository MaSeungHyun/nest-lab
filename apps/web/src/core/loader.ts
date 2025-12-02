import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import loadingManager from "../utils/loadManager";

const envMapLoader = new RGBELoader(loadingManager);
const modelLoader = new GLTFLoader(loadingManager);
const textureLoader = new THREE.TextureLoader(loadingManager);

class Loader {
  private static instance: Loader;

  public static getInstance() {
    if (!Loader.instance) {
      Loader.instance = new Loader();
    }
    return Loader.instance;
  }

  public loadTexture(url: string): Promise<THREE.Texture> {
    return textureLoader.loadAsync(url).then((texture: THREE.Texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;

      return texture;
    });
  }

  public loadHDR(url: string): Promise<THREE.Texture> {
    return envMapLoader.loadAsync(url).then((texture: THREE.Texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;

      return texture;
    });
  }
}

export default Loader;
