/**
 * sceneBuilder.service.ts Builds the game scene in a singleton pattern.
 *
 * @authors Félix Boulet
 * @modified Félix Boulet, Mikaël Ferland
 * @date 2017/04/01
 */

import { Rink, IRingSetup, ILineSetup, ISurfaceSetup } from '../entities/rink';
import { SkyBox } from '../entities/skyBox';

export class SceneBuilder {

    private static instance: SceneBuilder = new SceneBuilder();

    private readonly X_SPOTLIGHTS = 2;
    private readonly Z_SPOTLIGHTS = 6;
    private readonly SPOTLIGHT_HEIGHT = 5;
    private readonly SUN_COLOR = 0xccccff;
    private readonly SHADOW_COLOR = 0x000077;
    private readonly SUN_INTENSITY = 1.0;
    private readonly SHADOW_MAPSIZE = 1024;
    private readonly CURVE_DATA = {
        dashSize: 0.1,
        gapSize: 0.1,
        translateOffset: 0.5,
        maxAngle: 30
    };
    private readonly CONFETTI_DATA = {
        minHeight: 3,
        maxHeight: 6,
        size: 0.03
    };

    private rink: Rink;

    public static getInstance(): SceneBuilder {
        return SceneBuilder.instance;
    }

    private constructor() {
        if (SceneBuilder.instance) {
            throw new Error("Error: SceneBuilder is a singleton class, use SceneBuilder.getInstance() instead of new.");
        }
        SceneBuilder.instance = this;
    }

    public async buildScene(): Promise<THREE.Scene> {
        let buildPromise = new Promise<THREE.Scene>((resolve, reject) => {
            const scene = new THREE.Scene();
            const skybox = new SkyBox();
            skybox.name = "skybox";
            scene.add(skybox);
            let self = this;
            this.buildRink().init(skybox.getSkyBoxImages())
                .then((rink) => {
                    self.rink = rink;
                    scene.add(this.rink);
                    const light = this.buildLighting(this.rink);
                    light.name = "lighting";
                    scene.add(light);
                    resolve(scene);
                });
        });
        return buildPromise;
    }

    public async buildAngleCurve(): Promise<THREE.Line> {
        let buildPromise = new Promise<THREE.Line>((resolve, reject) => {
            // Define the dashed line for aiming the stones
            let directionCurve = new THREE.LineCurve3(
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 0, this.rink.getDimensions().length));
            let curveGeometry = new THREE.Geometry();
            curveGeometry.vertices = directionCurve.getPoints(1);

            curveGeometry.computeLineDistances();

            let curveMaterial = new THREE.LineDashedMaterial({
                color: 0xff0000,
                dashSize: this.CURVE_DATA.dashSize,
                gapSize: this.CURVE_DATA.gapSize,
            });

            // Create the final object to add to the scene
            let curveObject = new THREE.Line(curveGeometry, curveMaterial);
            curveObject.name = "directionalCurve"; // For testing only
            curveObject.translateZ(this.getRinkData().lines.start);
            resolve(curveObject);
        });
        return buildPromise;
    }

    public buildConfettiSystem(confettiColor : number, confettiCount : number): Promise<THREE.Points> {
        let confettiPromise = new Promise<THREE.Points>((resolve, reject) => {
            let confettiGeometry = new THREE.Geometry();
            let zRingsCenter = this.getRinkData().rings.offset;
            let ringsRadius = this.getRinkData().rings.outer;
            for (let i = 0; i < confettiCount; i++) {
                let angle = this.getRandomFloat(0, 2 * Math.PI);
                let radius = this.getRandomFloat(0, ringsRadius);
                let xPos = radius * Math.cos(angle);
                let zPos = radius * Math.sin(angle) + zRingsCenter;
                let yPos = this.getRandomFloat(this.CONFETTI_DATA.minHeight, this.CONFETTI_DATA.maxHeight);
                let confetti = new THREE.Vector3(xPos, yPos, zPos);
                confettiGeometry.vertices.push(confetti);
            }

            let confettiMaterial = new THREE.PointsMaterial({
                color: confettiColor,
                size: this.CONFETTI_DATA.size
            });

            let confettiSystem = new THREE.Points(confettiGeometry, confettiMaterial);

            resolve(confettiSystem);
        });
        return confettiPromise;
    }

    public getRinkData(): IRinkData {
        return {
            dims: this.rink.getDimensions(),
            lines: this.rink.getRefLineSetup(),
            rings: this.rink.getRefRingSetup()
        };
    }

    public getCurveData(): ICurveData {
        return this.CURVE_DATA;
    }

    private buildRink(): Rink {
        const rink = new Rink();
        rink.position.z = rink.getDimensions().length / 2;
        rink.position.y = -0.0775;
        rink.name = "rink";
        rink.castShadow = false;
        rink.receiveShadow = true;
        return rink;
    }

    private buildLighting(rink: Rink): THREE.Group {
        const lighting = new THREE.Group();
        lighting.add(this.spawnSpotlights(rink.getDimensions().width, rink.getDimensions().length));
        lighting.add(this.spawnSunlight());
        return lighting;
    }

    private spawnSpotlights(width: number, length: number): THREE.Group {
        const spotlightArray = new THREE.Group();
        for (let i = 0; i < this.Z_SPOTLIGHTS; i++) {
            for (let j = 0; j < this.X_SPOTLIGHTS; j++) {
                let light = new THREE.SpotLight(0xffffff, 3.5);
                light.position.set(-width / 2 + (width / (this.X_SPOTLIGHTS - 1)) * j,
                    this.SPOTLIGHT_HEIGHT, i * (length / (this.Z_SPOTLIGHTS - 1)));
                light.penumbra = 0.4;
                light.decay = 2.0;
                light.castShadow = true;
                light.shadow.mapSize.width = this.SHADOW_MAPSIZE; // 2048 or 4096 looks best but it's GPU-heavy
                light.shadow.mapSize.height = this.SHADOW_MAPSIZE; // 2048 or 4096 looks best but it's GPU-heavy
                // Cast to PerspectiveCamera since Camera doesn't have far property... thanks TypeScript.
                (<THREE.PerspectiveCamera>light.shadow.camera).far = 20;
                spotlightArray.add(light);

                let lightTarget = new THREE.Object3D();
                lightTarget.position.set(light.position.x, 0, light.position.z);
                spotlightArray.add(lightTarget);
                light.target = lightTarget;
            }
        }
        return spotlightArray;
    }

    private spawnSunlight(): THREE.HemisphereLight {
        return new THREE.HemisphereLight(this.SUN_COLOR, this.SHADOW_COLOR, this.SUN_INTENSITY);
    }

    private getRandomFloat(min: number, max: number): number {
        return (Math.random() * (max - min)) + min;
    }
}

export interface IRinkData {
    dims: ISurfaceSetup;
    lines: ILineSetup;
    rings: IRingSetup;
}

export interface ICurveData {
    // For the dashed line when aiming
    dashSize: number;
    gapSize: number;
    translateOffset: number;
    maxAngle: number;
}
