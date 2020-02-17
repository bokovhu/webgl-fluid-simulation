import * as dat from 'dat.gui';
import Stats from 'stats.js'

export default class GameGUI {

    constructor (target) {
        this.target = target
        this.gui = new dat.GUI ()
        this.stats = new Stats();
    }

    init () {

        let materialFolder = this.gui.addFolder('Material');

        let materialDiffuseFolder = materialFolder.addFolder('Diffuse');
        materialDiffuseFolder.add(this.target.material.diffuse, '0', 0.0, 1.0);
        materialDiffuseFolder.add(this.target.material.diffuse, '1', 0.0, 1.0);
        materialDiffuseFolder.add(this.target.material.diffuse, '2', 0.0, 1.0);

        let materialSpecularFolder = materialFolder.addFolder('Specular');
        materialSpecularFolder.add(this.target.material.specular, '0', 0.0, 1.0);
        materialSpecularFolder.add(this.target.material.specular, '1', 0.0, 1.0);
        materialSpecularFolder.add(this.target.material.specular, '2', 0.0, 1.0);

        materialFolder.add(this.target.material, 'shininess', 0.0, 500.0);

        let lightFolder = this.gui.addFolder('Light');
        lightFolder.add(this.target.light, 'type', [ 'point', 'directional', 'spot' ]);

        let lightPosFolder = lightFolder.addFolder('Position');
        lightPosFolder.add(this.target.light.position, '0', -10.0, 10.0, 0.5);
        lightPosFolder.add(this.target.light.position, '1', -10.0, 10.0, 0.5);
        lightPosFolder.add(this.target.light.position, '2', -10.0, 10.0, 0.5);

        let lightDirFolder = lightFolder.addFolder('Direction');
        lightDirFolder.add(this.target.light.direction, '0', -1, 1, 0.05);
        lightDirFolder.add(this.target.light.direction, '1', -1, 1, 0.05);
        lightDirFolder.add(this.target.light.direction, '2', -1, 1, 0.05);

        let lightIntensityFolder = lightFolder.addFolder('Intensity');
        lightIntensityFolder.add(this.target.light.intensity, '0', 0.0, 5.0, 0.05);
        lightIntensityFolder.add(this.target.light.intensity, '1', 0.0, 5.0, 0.05);
        lightIntensityFolder.add(this.target.light.intensity, '2', 0.0, 5.0, 0.05);

        let lightAmbientFolder = lightFolder.addFolder('Ambient');
        lightAmbientFolder.add(this.target.light.ambient, '0', 0.0, 1.0, 0.05);
        lightAmbientFolder.add(this.target.light.ambient, '1', 0.0, 1.0, 0.05);
        lightAmbientFolder.add(this.target.light.ambient, '2', 0.0, 1.0, 0.05);

        let marchingCubesFolder = this.gui.addFolder('Marching Cubes');
        let isoLevelController = marchingCubesFolder.add(this.target.gridOptions, 'isoLevel', 0, 255, 1);
        isoLevelController.onFinishChange(() => {
            this.target.generateMarchingCubesResult();
        });

        let cameraFolder = this.gui.addFolder('Camera');
        let cameraOrbitCenterFolder = cameraFolder.addFolder('Orbit Center');
        cameraOrbitCenterFolder.add(this.target.camera.orbitCenter, '0', -10, 10, 0.1);
        cameraOrbitCenterFolder.add(this.target.camera.orbitCenter, '1', -10, 10, 0.1);
        cameraOrbitCenterFolder.add(this.target.camera.orbitCenter, '2', -10, 10, 0.1);
        cameraFolder.add(this.target.camera, 'orbitHeight', -25, 25, 0.1);
        cameraFolder.add(this.target.camera, 'orbitSpeed', 0.05, 2.0, 0.01);
        cameraFolder.add(this.target.camera, 'orbitRadius', 4.0, 50.0, 0.5);

        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);

    }

}