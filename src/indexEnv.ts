/// <reference path="../node_modules/@2gis/mapgl/global.d.ts" />

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { mapPointFromLngLat } from '@trufi/utils/mapPoint/fromLngLat';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

const MANAGER = new THREE.LoadingManager();
const THREE_PATH = `https://unpkg.com/three@0.${THREE.REVISION}.x`;
const DRACO_LOADER = new DRACOLoader(MANAGER).setDecoderPath(
    `${THREE_PATH}/examples/js/libs/draco/gltf/`,
);

interface Environment {
    id: string;
    name: string;
    path: string;
    format: string;
}

export const environments: Environment[] = [
    {
        id: '',
        name: 'None',
        path: '',
        format: '.hdr',
    },
    {
        id: 'venice-sunset',
        name: 'Venice Sunset',
        path: './data/environment/venice_sunset_1k.hdr',
        format: '.hdr',
    },
    {
        id: 'footprint-court',
        name: 'Footprint Court (HDR Labs)',
        path: './data/environment/footprint_court_2k.hdr',
        format: '.hdr',
    },
];

const mapCenter = [55.144857607443846, 25.087842256597952];
const modelCoords = [55.145096, 25.0869];

const map = ((window as any).map = new mapgl.Map('map', {
    key: '042b5b75-f847-4f2a-b695-b5f58adc9dfd',
    center: mapCenter,
    zoom: 18,
    pitch: 45,
    rotation: 20,
    // pitch: 0,
    // rotation: 0,
}));
(window as any).map = map;

map.on('click', (e) => console.log(e));
map.setSelectedObjects(['13933647002591590']);

const camera = new THREE.Camera();
camera.updateMatrixWorld = () => {};

const renderer = new THREE.WebGLRenderer({
    canvas: map.getCanvas(),
    context: map.getWebGLContext(),
    alpha: true,
    // antialias: window.devicePixelRatio < 2,
    //
    antialias: true,
    precision: 'highp',
    stencil: true,
    premultipliedAlpha: true,
    powerPreference: 'high-performance',
    depth: true,
    logarithmicDepthBuffer: true,
});

// renderer = new WebGLRenderer({ antialias: true });
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
// renderer.setClearColor(0xcccccc);
// renderer.setPixelRatio(window.devicePixelRatio);
// renderer.setSize(el.clientWidth, el.clientHeight);

renderer.autoClear = false;

const scene = new THREE.Scene();

// const ambientLight = new THREE.AmbientLight(0xffffff, 1);
// const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);

const ambientLight = new THREE.AmbientLight(0xffffff, 2);
const directionalLight = new THREE.DirectionalLight(0xffffff, 4);

// directionalLight.position.set(0, 0, 1);
directionalLight.position.set(0.5, 0, 0.866); // ~60º;

scene.add(ambientLight, directionalLight);

const model = new THREE.Object3D();
const loader = new GLTFLoader().setDRACOLoader(DRACO_LOADER);

// loader.load('./data/asia_building/scene.gltf', (gltf) => {
// loader.load('./data/cayan/Cayan.gltf', (gltf) => {
// loader.load('./data/cayan_comp_textures/Cayan.gltf', (gltf) => {
loader.load('./data/cayan/Cayan.gltf', (gltf) => {
    const encoding = THREE.sRGBEncoding;
    gltf.scene.traverse((node: any) => {
        if (!node.isMesh) return;

        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach((material: any) => {
            if (material.map) material.map.encoding = encoding;
            if (material.emissiveMap) material.emissiveMap.encoding = encoding;
            if (material.map || material.emissiveMap) material.needsUpdate = true;
        });
    });

    model.add(gltf.scene);
    model.rotateX(0.5 * Math.PI);
    model.rotateY(0.27 * Math.PI);
    const mapPointCenter = mapPointFromLngLat(modelCoords);
    model.scale.set(1.19, 1.19, 1.19);
    model.position.set(mapPointCenter[0] + 1300, mapPointCenter[1] - 350, 0);

    scene.add(model);

    map.patchStyleState({ rerender: true });
});

const environment = environments[0];
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

getCubeMapTexture(environment).then(({ envMap }) => {
    scene.environment = envMap;
});

function getCubeMapTexture(environment: Environment) {
    const { path } = environment;

    // no envmap
    if (!path) return Promise.resolve({ envMap: null });

    return new Promise<{ envMap: THREE.Texture }>((resolve, reject) => {
        new RGBELoader().load(
            path,
            (texture) => {
                const envMap = pmremGenerator.fromEquirectangular(texture).texture;
                pmremGenerator.dispose();

                resolve({ envMap });
            },
            undefined,
            reject,
        );
    });
}

map.on('styleload', () => {
    map.removeLayer('843132');

    map.addLayer({
        id: '3d-model',
        name: 'Model 3D',
        type: 'buildingModel',
        style: {
            color: '#FFFFF5',
            visibility: 'visible',
            strokeColor: '#CCC9C3',
            strokeWidth: 0.1,
        },
        filter: [
            'all',
            ['match', ['get', 'sublayer'], ['Building_model'], true, false],
            ['match', ['get', 'selected'], [false], true, false],
        ],
        minzoom: 16,
    });

    map.addLayer({
        id: '3d-model-hideen',
        name: 'Model 3D: Hidden when selected',
        type: 'buildingModel',
        style: {
            color: '#00000000',
            strokeColor: '#00000000',
            visibility: 'visible',
        },
        filter: [
            'all',
            ['match', ['get', 'sublayer'], ['Building_model'], true, false],
            ['match', ['get', 'selected'], [true], true, false],
        ],
        minzoom: 16,
    });

    map.addLayer({
        id: 'my',
        type: 'custom',
        minzoom: 16,
        render: (_gl: WebGLRenderingContext) => {
            if (map.getStyleZoom() < 16) {
                scene.remove(model);
            } else {
                scene.add(model);
            }

            camera.matrixWorldInverse.fromArray(map.getProjectionMatrix());
            renderer.resetState();
            renderer.render(scene, camera);
        },
    });
});
