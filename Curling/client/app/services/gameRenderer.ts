/**
 * gameRenderer.ts - Renders the scene
 *
 * @authors Félix Boulet et Yawen Hou
 * @date 2017/01/27
 */

import { Injectable } from '@angular/core';
import { CurlingStone } from '../entities/curlingStone';
import { SkyBox } from '../entities/skyBox';
import { Rink } from '../entities/rink';
import { LightManager } from './lightManager';
import { PhysicsManager } from './physicsManager';
import { CameraManager } from './cameraManager.service';

@Injectable()
export class GameRenderer {

    private readonly DASH_SIZE = 0.1;
    private readonly GAP_SIZE = 0.1;
    private readonly TRANSLATE_OFFSET = 0.5;

    container: HTMLElement;
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    ambientLight: THREE.HemisphereLight;
    isStarted = false;
    lightManager: LightManager;
    physicsManager: PhysicsManager;
    cameraManager: CameraManager;
    clock: THREE.Clock;
    raycaster: THREE.Raycaster;
    curlingStones: CurlingStone[] = [];
    directionCurve: THREE.LineCurve3;
    curveObject: THREE.Line;
    private totalTranslateOffset = 0;
    private curveAngle = 0;

    // TODO : Remove when experimental test is done
    activeStone: CurlingStone;

    constructor(curlingStones: CurlingStone[]) {
        this.curlingStones = curlingStones;
    }

    public init(container?: HTMLElement): void {
        this.container = container;
        this.scene = new THREE.Scene();
        this.raycaster = new THREE.Raycaster();

        /*We have to set the size at which we want to render our app. We use the width and the height of the browser.*/
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        if (this.container !== undefined) {
            if (this.container.getElementsByTagName('canvas').length === 0) {
                this.container.appendChild(this.renderer.domElement);
            }
        }
        else {
            document.body.appendChild(this.renderer.domElement);
            this.container = document.body;
        }

        let containerRect = this.container.getBoundingClientRect();
        //Adjust width and height to real container size
        this.renderer.setSize(containerRect.width, containerRect.height);

        this.lightManager = new LightManager();
        this.physicsManager = new PhysicsManager(this.curlingStones);
        this.cameraManager = new CameraManager(this.container);

        let skybox: SkyBox;
        skybox = new SkyBox();
        this.addToScene(skybox);

        //TODO: Adjust rink to add play lines (home, throw line, etc.)
        //TODO: Adjust ring positions on the rink (they're wrong right now)
        let rink: Rink = new Rink(skybox.skyBoxImages);
        rink.position.z = -Rink.RINK_LENGTH / 2;
        rink.position.y = Rink.POS_RINK_Y;
        rink.name = "rink";
        this.addToScene(rink);

        this.directionCurve = new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -30));
        let curveGeometry = new THREE.Geometry();
        curveGeometry.vertices = this.directionCurve.getPoints(2);

        curveGeometry.computeLineDistances();

        let curveMaterial = new THREE.LineDashedMaterial({
            color: 0xff0000,
            dashSize: this.DASH_SIZE,
            gapSize: this.GAP_SIZE,
        });

        // Create the final object to add to the scene
        this.curveObject = new THREE.Line(curveGeometry, curveMaterial);


        /*--------------------LIGHT------------------------------------------ */

        this.scene.add(this.lightManager.spawnAmbientLight(0xffffff, 0x222277));
        this.addToScene(this.lightManager.spawnSpotlights(-2.2, 0, 0, rink));

        //------------------- END LIGHT------------------------------------------//

        //Start asynchronous render loop.
        this.clock = new THREE.Clock();
        this.isStarted = true;
    }

    addStone(stone: CurlingStone): void {
        this.addToScene(stone);
        this.activeStone = stone;
    }

    onResize(event: any) {
        this.renderer.setSize(event.target.innerWidth, event.target.innerHeight);
        let containerRect = this.container.getBoundingClientRect();
        //Adjust width and height to real container size
        this.renderer.setSize(containerRect.width, containerRect.height);

        //Adjust camera FOV following aspect ratio
        this.cameraManager.onResize(this.container);
    }

    addToScene(obj: THREE.Group | THREE.Mesh): void {
        this.scene.add(obj);
    }

    switchCamera(): void {
        (this.cameraManager.isUsingPerspectiveCamera()) ?
            this.cameraManager.useOrthographicCamera(this.container) :
            this.cameraManager.usePerspectiveCamera(this.container);
    }

    calculateAngle(mouse: THREE.Vector2): number {
        this.raycaster.setFromCamera(mouse, this.cameraManager.getCamera());
        let intersects = this.raycaster.intersectObject(this.scene.getObjectByName("rink"), true);
        if (intersects.length > 0) {
            let intersectionPoint = intersects[0].point;
            let distance = intersectionPoint.x;
            let angle = distance / (Rink.RINK_WIDTH / 2) * 30;
            this.curveAngle = THREE.Math.degToRad(angle);
            return angle;
        }
        return null;
    }

    updateDirectionCurve(angleDifference: number): void {
        this.curveObject.geometry.rotateY(THREE.Math.degToRad(angleDifference));
    }

    showDirectionCurve(): void {
        this.scene.add(this.curveObject);
    }

    hideDirectionCurve(): void {
        this.scene.remove(this.curveObject);
    }

    removeOutOfBoundsStones(outOfBoundsStones: CurlingStone[]) {
        outOfBoundsStones.forEach(stone => {
            let index = this.curlingStones.indexOf(stone);
            this.curlingStones.splice(index, 1);
            stone.fadeOut();
        });
    }

    render(): void {
        window.requestAnimationFrame(() => this.render());

        let delta = this.clock.getDelta();
        this.physicsManager.update(delta);
        this.removeOutOfBoundsStones(this.physicsManager.getOutOfBoundsStones());

        let scalarOffset = this.TRANSLATE_OFFSET * delta;
        this.totalTranslateOffset += scalarOffset;

        this.curveObject.translateX(scalarOffset * Math.sin(this.curveAngle));
        this.curveObject.translateZ(-scalarOffset * Math.cos(this.curveAngle));

        if (this.totalTranslateOffset > this.DASH_SIZE * 2) {
            this.curveObject.position.x = 0;
            this.curveObject.position.z = 0;
            this.totalTranslateOffset = 0;
        }

        //Render scene using camera that is following the stone
        this.cameraManager.followStone(this.activeStone.position);
        this.renderer.render(this.scene, this.cameraManager.getCamera());
    }
}
