/// <reference path="../node_modules/@2gis/mapgl/global.d.ts" />

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { mapPointFromLngLat } from '@trufi/utils/mapPoint/fromLngLat';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { runFlight, Scenario } from './lib/flight';

interface Model {
    path: string;
    type: string;
    name: string;
    displayName: string;
}

const MODEL_FOLDER = './data/dubai_municipality_warm';

const MODELS: Model[] = [
    {
        path: `${MODEL_FOLDER}/building/dubaimunicipality.gltf`,
        type: 'building',
        name: 'building',
        displayName: '4124763-4',
    },
    {
        path: `${MODEL_FOLDER}/floors/01b1/01b1.gltf`,
        type: 'floor',
        name: '01b1',
        displayName: '4124763-4-B1',
    },
    {
        path: `${MODEL_FOLDER}/floors/02g/02g.gltf`,
        type: 'floor',
        name: '02g',
        displayName: '4124763-4-G',
    },
    {
        path: `${MODEL_FOLDER}/floors/03/03.gltf`,
        type: 'floor',
        name: '03',
        displayName: '4124763-4-F01',
    },
    {
        path: `${MODEL_FOLDER}/floors/04f/04f.gltf`,
        type: 'floor',
        name: '04f',
        displayName: '4124763-4-F02',
    },
    {
        path: `${MODEL_FOLDER}/floors/05f/05f.gltf`,
        type: 'floor',
        name: '05f',
        displayName: '4124763-4-F03',
    },
    {
        path: `${MODEL_FOLDER}/floors/06f/06f.gltf`,
        type: 'floor',
        name: '06f',
        displayName: '4124763-4-F04',
    },
    {
        path: `${MODEL_FOLDER}/floors/07f/07f.gltf`,
        type: 'floor',
        name: '07f',
        displayName: '4124763-4-F05',
    },
    {
        path: `${MODEL_FOLDER}/floors/08f/08f.gltf`,
        type: 'floor',
        name: '08f',
        displayName: '4124763-4-F06',
    },
    {
        path: `${MODEL_FOLDER}/floors/09r1/09r1.gltf`,
        type: 'floor',
        name: '09r1',
        displayName: '4124763-4-R1',
    },
    {
        path: `${MODEL_FOLDER}/floors/10r2/10r2.gltf`,
        type: 'floor',
        name: '10r2',
        displayName: '4124763-4-R2',
    },
];

const modelDataMap: { [name: string]: THREE.Object3D | undefined } = {};

const mapCenter = [55.36155606339799, 25.221251810665166];
const modelCoords = [55.361648, 25.221288];
const BUILDING_ID = '13933647002597790';
const DEFAULT_MODEL_NAME = 'building';

let renderedModels: THREE.Object3D[] = [];

const map = ((window as any).map = new mapgl.Map('map', {
    key: '042b5b75-f847-4f2a-b695-b5f58adc9dfd',
    center: mapCenter,
    zoom: 19.5,
    pitch: 45,
    rotation: 140,
    maxZoom: 22,
}));
(window as any).map = map;

map.on('click', (e) => console.log(e));
map.setSelectedObjects([BUILDING_ID]);

const control = new mapgl.Control(map, getSelectHTML(), {
    position: 'topLeft',
});

function getSelectHTML() {
    return `<select>${MODELS.map(
        ({ name, displayName }) =>
            `<option value="${name}"${
                name === DEFAULT_MODEL_NAME ? ' selected' : ''
            }>${displayName}</option>`,
    ).join()}</select>`;
}

control
    .getContainer()
    .querySelector('select')!
    .addEventListener('change', (e) => {
        const name = (e.currentTarget as HTMLSelectElement)?.value ?? DEFAULT_MODEL_NAME;
        toggleModel(name);
    });

function toggleModel(name: string) {
    if (!modelDataMap[name]) {
        return;
    }

    if (renderedModels.length) {
        scene.remove(...renderedModels);
    }

    renderedModels = [];
    for (let i = 0; i < MODELS.length; i++) {
        const model = MODELS[i];
        const modelData = modelDataMap[model.name];
        if (modelData && (name === MODELS[0].name || i !== 0)) {
            renderedModels.push(modelData);
        }

        if (model.name === name) {
            break;
        }
    }

    triggerMapRerender();
}

new mapgl.Control(
    map,
    `<div class="bim-button"><img src="data/bimLogo.png" width="24" /> BIM Mode</div>`,
    {
        position: 'bottomLeft',
    },
);

const step: Scenario = { zoom: 20, rotation: 30, duration: 3000, center: modelCoords };

export const fight = () => {
    runFlight(
        [
            { ...step },
            { f: () => toggleModel(MODELS[1].name) },
            { sleep: 1000 },
            {
                ...step,
                rotation: 75,
            },
            { f: () => toggleModel(MODELS[2].name) },
            { sleep: 1000 },
        ],
        map,
    );
};

const camera = new THREE.Camera();
camera.updateMatrixWorld = () => {};

const renderer = new THREE.WebGLRenderer({
    canvas: map.getCanvas(),
    context: map.getWebGLContext(),
    alpha: true,
    antialias: window.devicePixelRatio < 2,
});

renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;

renderer.autoClear = false;
// renderer.setClearColor(0xff0000, 0);

const scene = new THREE.Scene();

// const ambientLight = new THREE.AmbientLight(0x404040, 1);

// const directionalLight2 = new THREE.DirectionalLight(0xffffff, 10);

// directionalLight.position.set(-0.5, 0, 0.866); // ~60º;

// directionalLight.position.set(0…, 0.5, 1);

// camera.add(directionalLight);
// scene.add(camera);

// pointLight.position.set(0, 0);
// ambientLight.position.set(0, 0, -0.5);
// directionalLight.position.set(0, 0, 1);

// light.position.set(0, 0, 1); // ~60º;

// const ambientLight = new THREE.AmbientLight(0x040404, 1);
// const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
// // directionalLight.position.set(0, 0, 1);
// directionalLight.position.set(0.5, 0, 0.866); // ~60º;
// scene.add(
//     ambientLight,
//     directionalLight, //directionalLight2
// );

// const pointLight = new THREE.PointLight(0xffffff, 1);
// directionalLight.position.set(1, 1, 1);

// directionalLight.position.set(0, 0, 1);

// const light = new THREE.HemisphereLight(0x040404, 0xffffff, 2);
// const light = new THREE.HemisphereLight(0xf1b36f, 0xbb8a55, 1);
// const light = new THREE.HemisphereLight(0xbb8a55, 0xf1b36f, 0.5);
// const light = new THREE.HemisphereLight(0xffffff, 0x040404, 1);
// const light = new THREE.HemisphereLight(0x040404, 0xffffff, 2);

// scene.add(camera);
const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(0.5, 0, 0.866); // ~60º;

scene.add(ambientLight, directionalLight);

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
                    model.rotateY(-0.09 * Math.PI);
                    const mapPointCenter = mapPointFromLngLat(modelCoords);
                    const k = 114;
                    model.scale.set(k, k, k);
                    model.position.set(mapPointCenter[0] - 200, mapPointCenter[1] - 150, 0);
                    modelDataMap[name] = model;
                    resolve(model);
                },
                () => {},
                () => resolve(undefined),
            );
        });
    }),
).then(() => {
    const defaultModel = modelDataMap[DEFAULT_MODEL_NAME];
    if (defaultModel) {
        renderedModels = [defaultModel];
    }
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
            if (!renderedModels.length) {
                return;
            }

            if (map.getStyleZoom() < 16) {
                scene.remove(...renderedModels);
            } else {
                scene.add(...renderedModels);
            }

            camera.matrixWorldInverse.fromArray(map.getProjectionMatrix());
            renderer.resetState();
            renderer.render(scene, camera);
        },
    });
});

function triggerMapRerender() {
    (map as any)._impl.state.needRerender = true;
}
