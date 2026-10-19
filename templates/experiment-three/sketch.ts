// {{title}}: starter sketch from `npm run new`. A cube spins in the stage; replace it with yours.
// start(stage) draws into the stage and returns stop (plus pause / resume / restart for those buttons).
// Needs Three.js: npm i three && npm i -D @types/three
import * as THREE from 'three';
import type { StartSketch } from '../../../lib/sketch';

const start: StartSketch = (stage) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 4;
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: accent }));
  const light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(2, 3, 4);
  scene.add(cube, light, new THREE.AmbientLight(0xffffff, 0.6));

  const size = () => {
    renderer.setSize(stage.clientWidth, stage.clientHeight, false);
    camera.aspect = stage.clientWidth / stage.clientHeight;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(size);
  ro.observe(stage);
  size();

  let paused = false;
  renderer.setAnimationLoop(() => {
    if (!paused) {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.013;
    }
    renderer.render(scene, camera);
  });

  return {
    pause: () => {
      paused = true;
    },
    resume: () => {
      paused = false;
    },
    restart: () => cube.rotation.set(0, 0, 0),
    stop: () => {
      renderer.setAnimationLoop(null);
      ro.disconnect();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
};

export default start;
