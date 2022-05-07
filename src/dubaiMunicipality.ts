/// <reference path="../node_modules/@2gis/mapgl/global.d.ts" />

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { mapPointFromLngLat } from '@trufi/utils/mapPoint/fromLngLat';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

interface Model {
    path: string;
    type: string;
    name: string;
}

const MODELS: Model[] = [
    {
        path: './data/dubai_municipality/building/dubaimunicipality.gltf',
        type: 'building',
        name: 'building',
    },
    { path: './data/dubai_municipality/floors/01b1/01b1.gltf', type: 'floor', name: '01b1' },
    { path: './data/dubai_municipality/floors/02g/02g.gltf', type: 'floor', name: '02g' },
    { path: './data/dubai_municipality/floors/03/03.gltf', type: 'floor', name: '03' },
    { path: './data/dubai_municipality/floors/04f/04f.gltf', type: 'floor', name: '04f' },
    { path: './data/dubai_municipality/floors/05f/05f.gltf', type: 'floor', name: '05f' },
    { path: './data/dubai_municipality/floors/06f/06f.gltf', type: 'floor', name: '06f' },
    { path: './data/dubai_municipality/floors/07f/07f.gltf', type: 'floor', name: '07f' },
    { path: './data/dubai_municipality/floors/08f/08f.gltf', type: 'floor', name: '08f' },
    { path: './data/dubai_municipality/floors/09r1/09r1.gltf', type: 'floor', name: '09r1' },
    { path: './data/dubai_municipality/floors/10r2/10r2.gltf', type: 'floor', name: '10r2' },
];

const modelDataMap: { [name: string]: THREE.Object3D | undefined } = {};

const mapCenter = [55.361648, 25.221288];
const modelCoords = [55.361648, 25.221288];
const BUILDING_ID = '13933647002597790';
const DEFAULT_MODEL_NAME = 'building';

let renderedModel: THREE.Object3D | undefined;

const map = ((window as any).map = new mapgl.Map('map', {
    key: '042b5b75-f847-4f2a-b695-b5f58adc9dfd',
    center: mapCenter,
    zoom: 19.5,
    pitch: 45,
    rotation: -15,
    // pitch: 0,
    // rotation: 0,
}));
(window as any).map = map;

map.on('click', (e) => console.log(e));
map.setSelectedObjects([BUILDING_ID]);

const control = new mapgl.Control(map, getSelectHTML(), {
    position: 'topLeft',
});

function getSelectHTML() {
    return `<select>${MODELS.map(
        ({ name }) =>
            `<option value="${name}"${
                name === DEFAULT_MODEL_NAME ? ' selected' : ''
            }>${name}</option>`,
    ).join()}</select>`;
}

control
    .getContainer()
    .querySelector('select')!
    .addEventListener('change', (e) => {
        const name = (e.currentTarget as HTMLSelectElement)?.value ?? DEFAULT_MODEL_NAME;
        if (renderedModel) {
            scene.remove(renderedModel);
        }
        renderedModel = modelDataMap[name];
        triggerMapRerender();
    });

const camera = new THREE.Camera();
camera.updateMatrixWorld = () => {};

const renderer = new THREE.WebGLRenderer({
    canvas: map.getCanvas(),
    context: map.getWebGLContext(),
    alpha: true,
    antialias: window.devicePixelRatio < 2,
});

// renderer.physicallyCorrectLights = true;
// renderer.outputEncoding = THREE.sRGBEncoding;

renderer.autoClear = false;

const scene = new THREE.Scene();

// const ambientLight = new THREE.AmbientLight(0x040404, 0.1);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);

// const ambientLight = new THREE.AmbientLight(0x404040, 1);
// const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);

// const directionalLight2 = new THREE.DirectionalLight(0xffffff, 10);

directionalLight.position.set(0, 0, 1);
// directionalLight.position.set(-0.5, 0, 0.866); // ~60º;

// directionalLight.position.set(0…, 0.5, 1);
// directionalLight.position.set(0.5, 0, 0.866); // ~60º;
// directionalLight.position.set(1, 1, 1);

// camera.add(directionalLight);
// scene.add(camera);

const pointLight = new THREE.PointLight(0xffffff, 0.7);
// pointLight.position.set(0, 0, );
// ambientLight.position.set(0, 0, -0.5);
// directionalLight.position.set(0, 0, 1);

camera.add(pointLight);
scene.add(camera);

scene.add(
    //     // ambientLight,
    directionalLight, //directionalLight2
);

const helper = new THREE.DirectionalLightHelper(directionalLight);
scene.add(helper);

const loadingManager = new THREE.LoadingManager();
const dracoLoader = new DRACOLoader(loadingManager).setDecoderPath(
    `https://unpkg.com/three@0.${THREE.REVISION}.x/examples/js/libs/draco/gltf/`,
);
const loader = new GLTFLoader().setDRACOLoader(dracoLoader);

Promise.all(
    MODELS.map(({ path, name }) => {
        const model = new THREE.Object3D();

        return new Promise((resolve) => {
            loader.load(
                path,
                (gltf) => {
                    model.add(gltf.scene);
                    model.rotateX(0.5 * Math.PI);
                    model.rotateY(0.91 * Math.PI);
                    const mapPointCenter = mapPointFromLngLat(modelCoords);
                    const k = 114;
                    model.scale.set(k, k, k);
                    model.position.set(mapPointCenter[0] - 350, mapPointCenter[1] - 500, 0);
                    modelDataMap[name] = model;
                    resolve(model);
                },
                () => {},
                () => resolve(undefined),
            );
        });
    }),
).then(() => {
    renderedModel = modelDataMap[DEFAULT_MODEL_NAME];
    triggerMapRerender();
});

map.on('styleload', () => {
    map.removeLayer('house dwelling');
    map.removeLayer('house dwelling 2d');

    map.addLayer({
        id: 'house dwelling 2d',
        name: 'Residential buildings',
        type: 'polygon',
        filter: ['match', ['get', 'sublayer'], ['Dwelling_house'], true, false],
        maxzoom: 16,
        minzoom: 14,
        style: {
            color: [
                'interpolate',
                ['linear'],
                ['zoom'],
                14,
                'rgba(252,251,237,0)',
                14.3,
                '#FCFBED',
            ],
            strokeColor: [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                '#FCFBED',
                15.2,
                '#E0DDD5',
                15.8,
                '#DCDAD3',
                16,
                '#C9C3B4',
            ],
            strokeWidth: ['interpolate', ['linear'], ['zoom'], 14.9, 0, 15, 0.5],
            visibility: 'visible',
        },
    });

    // map.addLayer({
    //     id: 'house dwelling 2d debug',
    //     name: 'Residential buildings',
    //     type: 'polygon',
    //     filter: [
    //         'all',
    //         ['match', ['get', 'sublayer'], ['Dwelling_house'], true, false],
    //         ['match', ['get', 'selected'], [true], true, false],
    //     ],
    //     minzoom: 16,
    //     style: {
    //         color: '#FCFBED',
    //         strokeColor: '#C9C3B4',
    //         strokeWidth: 0.5,
    //         visibility: 'visible',
    //     },
    // });

    map.addLayer({
        id: 'house dwelling',
        name: 'Residential buildings',
        type: 'polygonExtrusion',
        filter: [
            'all',
            ['match', ['get', 'sublayer'], ['Dwelling_house'], true, false],
            ['match', ['get', 'selected'], [false], true, false],
        ],

        minzoom: 16,
        style: {
            topColor: ['match', ['get', 'selected'], [true], '#FF9387', '#fcfbf2'],
            sideColor: [
                'match',
                ['get', 'selected'],
                [true],
                'rgba(234,133,124,0.82)',
                'rgba(209,203,190,0.82)',
            ],
            visibility: 'visible',
            strokeColor: ['match', ['get', 'selected'], [true], 'rgba(178,101,94,0.56)', '#C9C3B4'],
            strokeWidth: 0.5,
        },
    });

    map.addLayer({
        id: 'house dwelling hidden',
        name: 'Residential buildings hidden',
        type: 'polygonExtrusion',
        filter: [
            'all',
            ['match', ['get', 'sublayer'], ['Dwelling_house'], true, false],
            ['match', ['get', 'selected'], [true], true, false],
        ],

        minzoom: 16,
        style: {
            topColor: '#00000000',
            sideColor: '#00000000',
            strokeColor: '#00000000',
            strokeWidth: 0,
            visibility: 'visible',
        },
    });

    map.addLayer({
        id: 'customModel',
        type: 'custom',
        minzoom: 16,
        render: (_gl: WebGLRenderingContext) => {
            if (!renderedModel) {
                return;
            }

            if (map.getStyleZoom() < 16) {
                scene.remove(renderedModel);
            } else {
                scene.add(renderedModel);
            }

            camera.matrixWorldInverse.fromArray(map.getProjectionMatrix());
            renderer.resetState();
            renderer.render(scene, camera);
        },
    });
});

function triggerMapRerender() {
    map.patchStyleState({ rerender: true });
}