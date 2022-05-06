/// <reference path="../node_modules/@2gis/mapgl/global.d.ts" />

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { mapPointFromLngLat } from '@trufi/utils/mapPoint/fromLngLat';

const loader = new GLTFLoader();

const modelCoords = [55.145096, 25.0869];
const mapCenter = [55.144857607443846, 25.087842256597952];

const map = ((window as any).map = new mapgl.Map('map', {
    key: '042b5b75-f847-4f2a-b695-b5f58adc9dfd',
    center: mapCenter,
    zoom: 18,
    pitch: 45,
    rotation: 20,
}));

const camera = new THREE.Camera();
camera.updateMatrixWorld = () => {};

const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('three') as HTMLCanvasElement,
    alpha: true,
    antialias: window.devicePixelRatio < 2,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

window.addEventListener('resize', () => {
    map.invalidateSize();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
});

// const light = new THREE.AmbientLight(0x404040);
// const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);

const light = new THREE.AmbientLight(0xffffff, 1);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
directionalLight.position.set(0, 0, 1);

const scene = new THREE.Scene();
scene.add(light, directionalLight);

const model = new THREE.Object3D();

loader.load('./data/cayan/Cayan.gltf', (gltf) => {
    model.add(gltf.scene);
    model.rotateX(0.5 * Math.PI);
    model.rotateY(0.27 * Math.PI);
    const mapPointCenter = mapPointFromLngLat(modelCoords);
    model.scale.set(1.19, 1.19, 1.19);
    model.position.set(mapPointCenter[0] + 1300, mapPointCenter[1] - 350, 0);

    scene.add(model);
});

function loop() {
    requestAnimationFrame(loop);
    camera.matrixWorldInverse.fromArray(map.getProjectionMatrix());
    if (map.getStyleZoom() < 17) {
        scene.remove(model);
    } else {
        scene.add(model);
    }
    renderer.render(scene, camera);
}
requestAnimationFrame(loop);
