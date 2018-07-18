import { AfterViewInit, Component, ElementRef, Input, ViewChild, HostListener, OnInit } from '@angular/core';
import * as THREE from 'three';
import "../../assets/javascript/getThree.js";
import "../../assets/javascript/OrbitControls.js";
import "../../assets/javascript/ColladaLoader.js";

@Component({
    selector: 'app-dragon',
    templateUrl: './dragon.component.html',
    styleUrls: ['./dragon.component.css']
})
export class DragonComponent implements OnInit {
    renderer: THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;
    cameraTarget: THREE.Vector3;
    scene: THREE.Scene;
    controls: THREE.OrbitControls;
    fieldOfView: number = 66;
    nearClippingPane: number = 1;
    farClippingPane: number = 1100;
    aspectRatio: number = 4;

    @ViewChild('dragon')
    dragonObj: ElementRef;

    constructor() {
        this.render = this.render.bind(this);
        this.ModelLoading = this.ModelLoading.bind(this);
    }

    get canvas(): HTMLCanvasElement {
        return this.dragonObj.nativeElement;
    }

    createScene() {
        this.scene = new THREE.Scene();
        var loader = new THREE.ColladaLoader();
        loader.load('assets/dragon/dragon.dae', this.ModelLoading);
    }

    ModelLoading(collada) {
        var modelScene = collada.scene;
        this.scene.add(modelScene);
        this.render();
    }

    createCamera() {
        this.camera = new THREE.PerspectiveCamera(
            this.fieldOfView,
            this.aspectRatio,
            this.nearClippingPane,
            this.farClippingPane
        );

        this.camera.position.x = 10;
        this.camera.position.y = 10;
        this.camera.position.z = 80;
    }

    startRendering() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setPixelRatio(devicePixelRatio);
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0xffffff, 1);
        this.renderer.autoClear = true;

        let component: DragonComponent = this;

        (function render() {
            component.render();
        }());
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    addControls() {
        this.controls = new THREE.OrbitControls(this.camera);
        this.controls.rotateSpeed = 1.0;
        this.controls.zoomSpeed = 1.2;
        this.controls.addEventListener('change', this.render);
    }


    onMouseDown(event: MouseEvent) {
        event.preventDefault();

        var raycaster = new THREE.Raycaster();
        var mouse = new THREE.Vector2();
        mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = - (event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, this.camera);

        var obj: THREE.Object3D[] = [];
        this.findAllObjects(obj, this.scene);
        var intersects = raycaster.intersectObjects(obj);
    }

    findAllObjects(pred: THREE.Object3D[], parent: THREE.Object3D) {
        if (parent.children.length > 0) {
            parent.children.forEach((i) => {
                pred.push(i);
                this.findAllObjects(pred, i);
            });
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: Event) {
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        // console.log("onResize: " + this.canvas.clientWidth + ", " + this.canvas.clientHeight);

        this.camera.aspect = this.aspectRatio;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.render();
    }

    @HostListener('document:keypress', ['$event'])
    onKeyPress(event: KeyboardEvent) {
    }

    ngOnInit() {
        this.createScene();
        this.createCamera();
        this.startRendering();
        this.addControls();
    }
}
