
import { Injectable } from '@angular/core';
import { CurlingStone } from './curlingStone';
import { SkyBox } from './skyBox';
import { Rink } from './rink';

@Injectable()
export class GameRenderer {

    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    directLight: THREE.DirectionalLight;
    ambientLight: THREE.HemisphereLight;
    isStarted = false;
    stone: CurlingStone;

    constructor() {
        console.log("GameRenderer created successfully");
    }
    public init(container?: HTMLElement) {
        this.scene = new THREE.Scene();

        /*Field of view, aspect ratio, near, far*/
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
        //var camera = new THREE.OrthographicCamera( 45, window.innerWidth / window.innerHeight, 1, 500);

        /*We have to set the size at which we want to render our app. We use the width and the height of the browser.*/
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        //document.body.appendChild(this.renderer.domElement);
        if (container !== undefined) {
            if (container.getElementsByTagName('canvas').length === 0) {
                container.appendChild(this.renderer.domElement);
            }
        }
        else {
            document.body.appendChild(this.renderer.domElement);
        }


        /*--------------------LIGHT------------------------------------------ */
        // this.directLight = new THREE.DirectionalLight(0xffffff, 1.0);
        // this.directLight.position.set(2, 50, 0);
        // this.scene.add(this.directLight);

        this.ambientLight = new THREE.HemisphereLight(0xffffff, 0x222277, 1.0);

        this.scene.add(this.ambientLight);


        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 2; j++) {
                let sunlight = new THREE.SpotLight(0xffffff, 0.6);
                sunlight.position.set(-2.2 + 4.4 * j, 5, -i * 8);
                sunlight.penumbra = 0.4;
                this.scene.add(sunlight);
                let lightTarget = new THREE.Object3D();
                lightTarget.position.set(-2.2 + 4.4 * j, 0, -i * 8);
                this.scene.add(lightTarget);
                sunlight.target = lightTarget;

            }
        }


        //------------------- END LIGHT------------------------------------------//

        this.camera.position.z = 6;
        this.camera.position.y = 2;

        this.camera.rotation.x -= Math.PI / 8;
        //this.camera.rotation.z += Math.PI / 2;

        this.stone = new CurlingStone();
        this.stone.init();
        this.add(this.stone);
        this.render();
        this.isStarted = true;

        let skybox: SkyBox;
        skybox = new SkyBox();
        this.add(skybox);

        //Reflective camera
        // let reflectiveCamera = new THREE.CubeCamera(1, 10000, 512);
        // this.add(reflectiveCamera);

        //let reflectiveTexture = new THREE.CubeTextureLoader().load(skybox.skyBoxImages);
        // reflectiveTexture.format = THREE.RGBFormat;
        //reflectiveTexture.mapping = THREE.CubeReflectionMapping;

         //let POS_RINK_Y = -0.145;
        // let CENTER_RADIUS = 0.15;
        // let INNER_RADIUS = 0.6;
        // let MIDDLE_RADIUS = 1.2;
        // let OUTER_RADIUS = 1.83;
         //let RINK_LENGTH = 42;
        // let RINK_WIDTH = 4.4;
        //
        // //TODO: Change ice texture to make it tileable (power of 2 on each side).
        // let textureLoader = new THREE.TextureLoader();
        // let whiteice = textureLoader.load("/assets/textures/white_ice.jpg");
        // let redice = textureLoader.load("/assets/textures/red_ice.jpg");
        // let blueice = textureLoader.load("/assets/textures/blue_ice.jpg");
        //
        // whiteice.wrapS = whiteice.wrapT = THREE.RepeatWrapping;
        // redice.wrapS = redice.wrapT = THREE.RepeatWrapping;
        // blueice.wrapS = blueice.wrapT = THREE.RepeatWrapping;
        // whiteice.repeat.set(4, 40);
        // redice.repeat.set(2, 2);
        // blueice.repeat.set(4, 4);
        // //textureLoader.mapping = THREE.EquirectangularReflectionMapping;
        //
        // //TODO: Change ice material to make it reflective.
        // let planeGeometry = new THREE.PlaneGeometry(RINK_WIDTH, RINK_LENGTH, 32);
        // let planeMaterial = new THREE.MeshStandardMaterial({
        //     metalness: 0.5,
        //     roughness: 0.0,
        //     side: THREE.DoubleSide,
        //     map: whiteice
        // });
        // //planeMaterial.envMap = textureLoader;
        //
        // let plane = new THREE.Mesh(planeGeometry, planeMaterial);
        // //plane.rotation.x = Math.PI/2;
        // //plane.position.y = POS_RINK_Y;
        // //plane.position.z = POS_RINK_Z;
        //
        //
        // //TODO: Change ring materials to make them reflective.
        // let blueRingGeometry = new THREE.RingGeometry(MIDDLE_RADIUS, OUTER_RADIUS, 40);
        // let blueRingMaterial = new THREE.MeshStandardMaterial({
        //     //color: 0x0000ff,
        //     metalness: 0.5,
        //     roughness: 0.0,
        //     side: THREE.DoubleSide,
        //     map: blueice
        // });
        // let blueRing = new THREE.Mesh(blueRingGeometry, blueRingMaterial);
        // let redRingGeometry = new THREE.RingGeometry(CENTER_RADIUS, INNER_RADIUS, 40);
        // let redRingMaterial = new THREE.MeshStandardMaterial({
        //     //color: 0xff0000,
        //     metalness: 0.5,
        //     roughness: 0.0,
        //     side: THREE.DoubleSide,
        //     map: redice
        // });
        // let redRing = new THREE.Mesh(redRingGeometry, redRingMaterial);
        //
        //
        // let rings = new THREE.Group();
        // rings.add(blueRing);
        // rings.add(redRing);
        // //
        // //rings.position.y = 1;
        // //  rings.position.z = -0.1;
        // // rings.position.y = POS_RINK_Y;
        //
        // let rings2 = new THREE.Group();
        // rings2.add(blueRing);
        // rings2.add(redRing);

        //this.add(rings2);
        //this.add(rings);

        // rings2.position.y = -(RINK_LENGTH / 2 - 3.7);
        // rings2.position.z = -0.001;
        //
        // let rink = new THREE.Group();
        // rink.add(rings);
        // rink.add(rings2);
        // rink.add(plane);

        let rink : Rink = new Rink (skybox.skyBoxImages);
        rink.position.z = -20;


        //rink.rotation.x = Math.PI / 2;
        rink.position.z = -rink.RINK_LENGTH / 2;
        rink.position.y = rink.POS_RINK_Y;

        this.add(rink);

    }

    render() {
        window.requestAnimationFrame(() => this.render());

        this.camera.position.z -= 0.04;
        this.stone.position.z -= 0.04;
        this.stone.position.x -= 0.0005;
        this.stone.rotation.y += 0.01;

        this.renderer.render(this.scene, this.camera);
    }

    add(obj: THREE.Group | THREE.Mesh) {
        this.scene.add(obj);
    }

}