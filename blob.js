import {GLTFLoader} from 'https://unpkg.com/three@0.120.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from "https://unpkg.com/three@0.120.0/examples/jsm/controls/OrbitControls";

const modelurl = 'https://raw.githubusercontent.com/pizza3/asset/master/mask.glb';
const textureurl = 'https://raw.githubusercontent.com/pizza3/asset/master/img2blur.jpg';

var scene,
  camera,
  renderer,
  width = window.innerWidth,
  height = window.innerHeight,
  controls,
  material,
	textImage = new THREE.TextureLoader().load(textureurl),
  loader = new GLTFLoader();

const vert = `
      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec3 camPos;

      void main() {
        vNormal = normal;
        camPos = cameraPosition;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
`;
const frag = `
      #define NUM_OCTAVES 5
      uniform vec4 resolution;
      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vNormal;
      uniform sampler2D sky;
      uniform float time;
      varying vec3 camPos;
      
      float rand(vec2 n) {
        return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
      }

      float noise(vec2 p){
        vec2 ip = floor(p);
        vec2 u = fract(p);
        u = u*u*(3.0-2.0*u);

        float res = mix(
          mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
          mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
        return res*res;
      }

      float fbm(vec2 x) {
        float v = 0.0;
        float a = 0.5;
        vec2 shift = vec2(100);
        // Rotate to reduce axial bias
        mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
        for (int i = 0; i < NUM_OCTAVES; ++i) {
          v += a * noise(x);
          x = rot * x * 2.0 + shift;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 olduv = gl_FragCoord.xy/resolution.xy ;
        vec2 uv = normalize( vNormal ).xy * 0.2 + 0.3; 
        vec2 newUv = uv + vec2(sin(uv.x) + sin(uv.y*3.4) + time*0.0003, -time*0.0004);
        vec2 fakeuv = vec2(dot(vec3(1.),vNormal),dot(vec3(-1.,0.,1.),vNormal));
        float fresnel = abs(dot(camPos, vNormal))*0.22;
        fresnel = pow(fresnel,3.);
        float scale = 3. ;
        vec2 p = newUv*scale;
        float noise = fbm( p + time/2. );
        vec4 txt = texture2D(sky, newUv*noise);
        gl_FragColor = vec4(txt.rgb,1.0);
        gl_FragColor += vec4(vec3(fresnel), 1.);
      }

`;

const createScene = () => {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );
  camera.position.z = 4.7;
  renderer = new THREE.WebGLRenderer();
  renderer.antialias = true;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  controls = new OrbitControls(camera, renderer.domElement);
	controls.enableZoom = false;
	controls.enablePan = false;
  controls.update();

  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.interpolateneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.autoClear = false;
  material = new THREE.ShaderMaterial({
    uniforms: {
      time: {
        type: "f",
        value: 0.0,
      },
      sky: {
        type: "t",
        value: textImage,
      },
      resolution: { value: new THREE.Vector2(width, height) },
    },
    fragmentShader: frag,
    vertexShader: vert,
  });
  document.getElementById("world").appendChild(renderer.domElement);
};


const generateMesh = () => {
  loader.load(
    modelurl,
    function (obj) {
      obj.scene.traverse(function (child) {
        if (child.type === "Mesh") {
          child.geometry = new THREE.Geometry().fromBufferGeometry(
            child.geometry
          );
          child.geometry.mergeVertices();
          child.material = material;
          child.verticesNeedUpdate = true;
          child.normalsNeedUpdate = true;
          child.uvsNeedUpdate = true;
          child.material.flatShading = THREE.SmoothShading;
          child.geometry.computeVertexNormals();
        }
				obj.scene.position.set(0,0.5,0);
        obj.scene.scale.set(10, 10, 10);
        scene.add(obj.scene);
      });
      animate();
    },
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    function (err) {
      console.error("An error happened", err);
    }
  );
};

const init = () => {
  createScene();
  generateMesh();
  window.addEventListener("resize", handleResize, false);
};

const updateDraw = (deltaTime) => {
  material.uniforms.time.value = deltaTime / 1000;
};

const animate = (deltaTime) => {
  requestAnimationFrame(animate);
  updateDraw(deltaTime);
  renderer.render(scene, camera);
};
const handleResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};
window.addEventListener("load", init, false);

