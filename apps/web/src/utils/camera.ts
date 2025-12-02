import * as THREE from "three";
import JEASINGS from "jeasings";
import { Context } from "../core/context";

const duration = 250;

let position: JEASINGS.JEasing | null = null;
let quaternion: JEASINGS.JEasing | null = null;
export type CameraTypes =
  | THREE.Camera
  | THREE.PerspectiveCamera
  | THREE.OrthographicCamera;
export const moveCamera = (target: CameraTypes, callback?: () => void) => {
  const context = Context.getInstance();
  const currentCamera = context.camera as CameraTypes;

  context.scene!.selectedCamera = target;

  const isSamePosition = currentCamera.position.equals(
    target.getWorldPosition(new THREE.Vector3())
  );
  const isSameQuaternion = currentCamera.quaternion.equals(
    target.getWorldQuaternion(new THREE.Quaternion())
  );

  if (isSamePosition && isSameQuaternion) {
    const originalCamera = context.scene?.originalCamera?.clone();
    if (originalCamera) {
      position = movePosition(originalCamera, currentCamera, callback);
      quaternion = moveRotation(originalCamera, currentCamera, callback);
    }
  } else {
    context.scene!.originalCamera = currentCamera.clone() as THREE.Camera;
    position = movePosition(target, currentCamera, callback);
    quaternion = moveRotation(target, currentCamera, callback);
  }

  position!.start();
  quaternion!.start();
};

const movePosition = (
  target: CameraTypes,
  camera: CameraTypes,
  callback?: () => void
) => {
  const worldPos = target.getWorldPosition(new THREE.Vector3());
  const position = new JEASINGS.JEasing(camera.position)
    .to({ x: worldPos.x, y: worldPos.y, z: worldPos.z }, duration)
    .easing(JEASINGS.Quadratic.Out)
    .onComplete(() => {
      const context = Context.getInstance();
      context.scene!.selectedCamera = null;
      console.log("완료");

      if (callback) {
        callback();
      }
    });

  return position;
};

const moveRotation = (
  target: CameraTypes,
  camera: CameraTypes,
  callback?: () => void
) => {
  const worldQuarternion = target.getWorldQuaternion(new THREE.Quaternion());
  const quaternion = new JEASINGS.JEasing(camera.quaternion)
    .to(
      {
        x: worldQuarternion.x,
        y: worldQuarternion.y,
        z: worldQuarternion.z,
        w: worldQuarternion.w,
      },
      duration
    )
    .easing(JEASINGS.Quadratic.Out)
    .onComplete(() => {
      if (callback) {
        callback();
      }
    });

  return quaternion;
};
