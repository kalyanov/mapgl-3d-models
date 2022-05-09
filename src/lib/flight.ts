/// <reference path="../../node_modules/@2gis/mapgl/global.d.ts" />

export interface Scenario {
    zoom?: number;
    center?: number[];
    rotation?: number;
    pitch?: number;
    duration?: number;
    zoomEasing?: mapgl.Easing;
    pitchEasing?: mapgl.Easing;
    centerEasing?: mapgl.Easing;
    rotationEasing?: mapgl.Easing;
    waitIdle?: boolean;
    sleep?: number;
    f?: () => void;
}

export async function runFlight(scenario: Scenario[], map: mapgl.Map) {
    for (const part of scenario) {
        const duration = part.duration || 0;
        if (part.zoom !== undefined) {
            const params: mapgl.AnimationOptions = {
                duration,
            };
            (params as any).animateHeight = true;
            if (part.zoomEasing) {
                params.easing = part.zoomEasing;
            }
            map.setZoom(part.zoom, params);
        }
        if (part.pitch !== undefined) {
            const params: mapgl.AnimationOptions = {
                duration,
            };
            if (part.pitchEasing) {
                params.easing = part.pitchEasing;
            }
            map.setPitch(part.pitch, params);
        }
        if (part.center) {
            const params: mapgl.AnimationOptions = {
                duration,
            };
            if (part.centerEasing) {
                params.easing = part.centerEasing;
            }
            map.setCenter(part.center, params);
        }
        if (part.rotation !== undefined) {
            const params: mapgl.AnimationOptions = {
                duration,
            };
            if (part.rotationEasing) {
                params.easing = part.rotationEasing;
            }
            map.setRotation(part.rotation, params);
        }

        if (typeof part.f === 'function') {
            part.f();
        }

        if (part.waitIdle) {
            await waitIdle(map);
        } else {
            await sleep(duration);
        }
    }
}

function waitIdle(map: mapgl.Map) {
    return new Promise((resolve) => {
        map.once('idle', resolve);
    });
}

function sleep(time: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}
