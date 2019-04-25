//Filename: three_app.js
//Author: Brandon Smith

//File Description:
//Threejs version of color palette application

//References:
//https://medium.com/@gordonnl/wind-f4fc7a3b366a (for wind)
//https://blog.mozvr.com/procedural-geometry-low-poly-c90louds/ (for clouds)

//Contents:
//## ToggleIndexView
//## Canvas, Scene, and Renderer Setup
//## Geometry, Objects, and Materials
//##   Shard Creation
//##   Shard Placement
//##   Cloud Creation
//##   Cloud Placement
//##   Wind Creation
//##   Wind Placement
//##   Mountain Creation
//##   Mountain Placement
//##   Text Creation/Placement
//## Lights
//## Color Objects
//## Event Listeners
//##   Loading Manager
//##   Session Storage Event
//##   Window Resizing Event
//##   Object Click/Hover Detection Variables
//##   Raycasting Functions
//##   Mouse Click Event
//##   Mouse Hover Event
//## Show Tooltip
//## Hide Tooltip
//## Animate the Canvas

//ToggleIndexView
//Toggle function to switch beteen Three.js app and color blocks
function toggleIndexView() {
  $("#webglCanvas").toggle();
  $("#palette-view-toggle").toggleClass('view-toggle');
  $("#palette-title").toggleClass('view-toggle');
  $("[id='color-grid']").toggleClass('hide-grid');

  //Give palette-form-button class to objects when in 3D mode
  //Remove when going into block-list mode
  $("[id='Color bg']").toggleClass('palette-form-button');
  $("[id='Color accent']").toggleClass('palette-form-button');
  $("[id='Color tertiary']").toggleClass('palette-form-button');
  $("[id='Color text']").toggleClass('palette-form-button');
  $("[id='Color text invert']").toggleClass('palette-form-button');
  $("[id='Color text highlight']").toggleClass('palette-form-button');
  $("[id='Color border']").toggleClass('palette-form-button');
  $("[id='Color border accent']").toggleClass('palette-form-button');
  $("[id='Color drop shadow']").toggleClass('palette-form-button');
  $("[id='Color base']").toggleClass('palette-form-button');
  $("#palette-button-randomize").toggleClass('palette-form-button');
  $("#palette-button-generate").toggleClass('palette-form-button');
  $("#palette-submission-field").toggleClass('palette-form-button');

  //Reset display style set by Show and Hide Tooltips
  $("[id='Color bg']").css('display', '');
  $("[id='Color bg']").css('display', '');
  $("[id='Color accent']").css('display', '');
  $("[id='Color tertiary']").css('display', '');
  $("[id='Color text']").css('display', '');
  $("[id='Color text invert']").css('display', '');
  $("[id='Color text highlight']").css('display', '');
  $("[id='Color border']").css('display', '');
  $("[id='Color border accent']").css('display', '');
  $("[id='Color drop shadow']").css('display', '');
  $("[id='Color base']").css('display', '');
  $("#palette-button-randomize").css('display', '');
  $("#palette-button-generate").css('display', '');
  $("#palette-submission-field").css('display', '');

  //Toggle palette blocks
  if($(".palette-container").css('display') == 'none') {
    $(".palette-container").css('display', 'inline-flex');
  }
  else {
    $(".palette-container").css('display', 'none');
  }
}
//Have cube button toggle between classes
$('#palette-toggle-button').click(function() {
  toggleIndexView();
});

//Canvas, Scene, and Renderer Setup
//Scene setup
var scene = new THREE.Scene();
{
  const color = 0xaaaaaa;
  scene.fog = new THREE.FogExp2(color, 0.012);
}

//Camera setup
var camera = new THREE.PerspectiveCamera(
  75,                                                    //fov
  $('.main-wrapper').width()/window.innerHeight,         //aspect ratio
  0.1,                                                   //near
  1000                                                   //far
);

//Camera Config
camera.position.z = 10;

//Renderer Setup
var renderer = new THREE.WebGLRenderer({
  canvas: webglCanvas,
  alpha: true,
  antialias: true});

//Renderer Options
renderer.setClearColor(0x000000, 0);
renderer.setSize($('.main-wrapper').width(), window.innerHeight);
renderer.gammaInput = true;
renderer.gammaOutput = true;

//Geometry, Objects, and Materials
//Create shard geometry
var geometry_box = new THREE.OctahedronGeometry(1, 0);

//Mesh Types
var material_standard = new THREE.MeshToonMaterial();
var material_outline = new THREE.MeshStandardMaterial({
  color: 0xff0000,
  side: THREE.BackSide,
});

//Shard Creation
//Box Objects and outlines for the boxes
var num_objects = 14;
var color_objects = 10;
var objects = [];
var box_group = new THREE.Group();
var function_group = new THREE.Group();
var outlines = [];
var outline_size = 1.1;

//For each object, create a second one behind it to serve as an outline
for (let i = 0; i < num_objects; i++) {
  objects.push(new THREE.Mesh(geometry_box, material_standard.clone()));
  outlines.push(new THREE.Mesh(geometry_box, material_outline.clone()));

  objects[i].userData.id = i;
  outlines[i].userData.id = i;

  //Scale the objects differently
  if(i == 0) {
    objects[i].scale.set(2, 3, 2.25);
    outlines[i].scale.set(2, 3, 2.25);
  }
  else if(i >= color_objects) {
    objects[i].scale.set(3, 14, 3);
    outlines[i].scale.set(4.5, 17, 4.5);
  }
  else {
    objects[i].scale.set(0.5, 1.5, 0.75);
    outlines[i].scale.set(0.5, 1.5, 0.75);
  }

  outlines[i].scale.multiplyScalar(outline_size);
  outlines[i].visible = false;

  if(i < color_objects) {
    box_group.add(objects[i]);
    box_group.add(outlines[i]);
  }
  else {
    function_group.add(objects[i]);
    function_group.add(outlines[i]);
  }
}
scene.add(box_group);
scene.add(function_group);

//Shard Placement
//Calculate even circle distribution for the rest of the elements
//Radius for box orbit around center
var box_radius = 16;
var box_deg;
for(let i = 1; i < 10; i++) {
  box_deg = (i-1) * 2*Math.PI/9;
  objects[i].position.set(box_radius*Math.cos(box_deg), 0,box_radius*Math.sin(box_deg));
}

//Tweak the center object and push back the group
objects[0].rotation.z -= 0.15;
box_group.position.set(0, 0, -20);

//Specific Function Box Placement
function_group.position.set(0, 50, -105);
objects[10].position.set(15, 0, 0);
objects[11].position.set(-25, 0, 0);
objects[12].position.set(25, 0, 0);
objects[13].position.set(-15, 0, 0);

//Cloud Creation
//Geometric Manipulation Functions
const map = (val, smin, smax, emin, emax) => (emax-emin)*(val-smin)/(smax-smin) + emin;

//Randomly displace the x,y,z coords by the `per` value
const jitter = (geo,per) => geo.vertices.forEach(v => {
  v.x += map(Math.random(),0,1,-per,per);
  v.y += map(Math.random(),0,1,-per,per);
  v.z += map(Math.random(),0,1,-per,per);
})

//Cut a bottom plane off of object
const chopBottom = (geo,bottom) => geo.vertices.forEach(v => v.y = Math.max(v.y,bottom));

//Create Clouds Function
var clouds = [];
function createCloud() {
  let cloud_geo = new THREE.Geometry();

  //Create tuft geometries and merge them
  let tuft = new THREE.SphereGeometry(1.5,7,8);
  tuft.translate(-2,0,0);
  cloud_geo.merge(tuft);
  tuft = new THREE.SphereGeometry(1.5,7,8);
  tuft.translate(2,0,0);
  cloud_geo.merge(tuft);
  tuft = new THREE.SphereGeometry(2.0,7,8);
  tuft.translate(0,0,0);
  cloud_geo.merge(tuft);

  //Randomize cloud vertices and then lop off the bottom
  jitter(cloud_geo, 0.5);
  chopBottom(cloud_geo,-0.5);

  let cloud = new THREE.Mesh(cloud_geo);
  clouds.push(cloud);
}

//Create Clouds
var num_clouds = 2;
for(let i = 0; i < num_clouds; i++) {
  createCloud();
}

//Cloud Placement
//Upper Left Cloud
clouds[0].scale.set(7, 2, 2);
clouds[0].position.set(-100, 25, -90);
clouds[0].material.transparent = true;
clouds[0].material.opacity = 0.9;

//Top cloud
clouds[1].scale.set(8, 3, 3);
clouds[1].position.set(60, 60, -80);
clouds[1].material.transparent = true;
clouds[1].material.opacity = 0.9;
clouds[1].rotation.x = 0.5;

//Update matrices and combine into single geometry
var clouds_geo = new THREE.Geometry();
for(let i = 0; i < num_clouds; i++) {
  clouds[i].updateMatrix();
  clouds_geo.merge(clouds[i].geometry, clouds[i].matrix);
}

//Create new mesh of clouds_merged and add it to the scene
var clouds_merged = new THREE.Mesh(clouds_geo, new THREE.MeshLambertMaterial({
      color:'white',
      flatShading:true,
    }));
scene.add(clouds_merged);

//Wind Creation
//Wind Vertex Shader
const windVertexShader =
'varying vec2 vUv;' +
'uniform vec3 color;' +
'varying vec3 vColor;' +
'void main() {' + 
'  vColor = color;' +
'  vUv = uv;' +
'  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);' +
'}';

//Wind Fragment Shader
//Shader loops over the object and colors a portion of it white with faded edges
//This creates a wind effect that travels along the length of the wind object
//Setting up a wind curve will cause wind to flow over that length
const windFragmentShader =
'varying vec2 vUv;' +
'uniform float uTime;' +
'varying vec3 vColor;' +
'void main() {' +
'  float len = 0.15;' +
'  float falloff = 0.1;' +
'  float p = mod(uTime * 0.25, 1.0);' +
'  float alpha = smoothstep(len, len - falloff, abs(vUv.x - p));' +
'  float width = smoothstep(len * 2.0, 0.0, abs(vUv.x - p)) * 0.5;' +
'  alpha *= smoothstep(width, width - 0.3, abs(vUv.y - 0.5));' +
'  alpha *= smoothstep(0.5, 0.3, abs(p - 0.5) * (1.0 + len));' +
'  gl_FragColor.rgb = vColor;' +
'  gl_FragColor.a = alpha * 0.1;' +
'}';

//Create Wind Curve
function createWindCurve() {
  let points = [];
  let a = 2 * Math.random() * Math.PI;
  let mag = Math.random() * 5 + 2.5;
  let length = 240;

  //Create length number of points to set wind curve
  for (let i = 0; i < length; i++) {
    a += Math.PI/80;
    points.push(new THREE.Vector3(
      i,
      mag * Math.sin(a),
      0,
    ));
  }
  return points;
}

//Create Wind Object
var shaders = [];
var wind_streams = [];
var wind_width = 0.3;
function addWindStream() {
  let points = createWindCurve();
  let wind_geo = new THREE.BufferGeometry();

  //Create two times as many vertices as points
  wind_geo.addAttribute('position',
    new THREE.BufferAttribute(new Float32Array(points.length * 3 * 2), 3));
  wind_geo.addAttribute('uv',
    new THREE.BufferAttribute(new Float32Array(points.length * 2 * 2), 2));
  wind_geo.setIndex(new THREE.BufferAttribute(new Uint16Array(points.length * 6), 1));

  //Push each point in opposing directions to create a ribbon
  points.forEach((b, i) => {
    wind_geo.attributes.position.setXYZ(i * 2 + 0, b.x, b.y + wind_width, b.z);
    wind_geo.attributes.position.setXYZ(i * 2 + 1, b.x, b.y - wind_width, b.z);
    wind_geo.attributes.uv.setXY(i * 2 + 0, i / (points.length - 1), 0);
    wind_geo.attributes.uv.setXY(i * 2 + 1, i / (points.length - 1), 1);

    if (i < points.length - 1) {
      wind_geo.index.setX(i * 6 + 0, i * 2);
      wind_geo.index.setX(i * 6 + 1, i * 2 + 1);
      wind_geo.index.setX(i * 6 + 2, i * 2 + 2);
      wind_geo.index.setX(i * 6 + 0 + 3, i * 2 + 1);
      wind_geo.index.setX(i * 6 + 1 + 3, i * 2 + 3);
      wind_geo.index.setX(i * 6 + 2 + 3, i * 2 + 2);
    }
  });

  //Create uniforms that will be passed to the shader
  let wind_uniforms = {
    uTime: {
      type: 'f',
      value: Math.random() * 3
    },
    color: {
      type: 'vec3',
      value: new THREE.Color(0xffffff)
    }
  };

  //Create the shader for the wind material
  let wind_shader = new THREE.ShaderMaterial({
    uniforms: wind_uniforms,
    vertexShader: windVertexShader,
    fragmentShader: windFragmentShader,
    side: THREE.DoubleSide,
    transparent: true,
  });

  //Create the wind mesh
  let wind_mesh = new THREE.Mesh(wind_geo, wind_shader);

  //Add mesh and shaders to arrays, then add the wind into the scene
  wind_streams.push(wind_mesh);
  shaders.push(wind_shader);
  scene.add(wind_mesh);
}

//Create Windstreams
var num_wind_streams = 4;
for(let i = 0; i < num_wind_streams; i++) {
  addWindStream();
}

//Wind Placement
//Position Windstreams
//First wind stream
wind_streams[0].rotation.y = 0;
wind_streams[0].position.y = -20;
wind_streams[0].position.x = -100;
wind_streams[0].position.z = -30;

//Second wind stream
wind_streams[1].scale.setScalar(0.8);
wind_streams[1].rotation.y = -0.12;
wind_streams[1].position.y = -12;
wind_streams[1].position.x = -60;
wind_streams[1].position.z = -55;

//Third wind stream
wind_streams[2].scale.setScalar(0.6);
wind_streams[2].position.y = -10;
wind_streams[2].position.x = -120;
wind_streams[2].position.z = -70;

//Fourth wind stream
wind_streams[3].scale.setScalar(0.6);
wind_streams[3].position.y = 15;
wind_streams[3].position.x = -60;
wind_streams[3].position.z = -90;

//Mountain Creation
var num_mountains = 5;
var mountains = [];
for(let i = 0; i < num_mountains; i++) {
  mountains.push(new THREE.Mesh(geometry_box));
}

//Mountain Placement
mountains[0].scale.set(80, 30, 30);
mountains[1].scale.set(80, 40, 30);
mountains[2].scale.set(100, 50, 30);
mountains[3].scale.set(100, 60, 30);
mountains[4].scale.set(100, 60, 30);
mountains[0].position.set(45, -35 ,-30);
mountains[1].position.set(-58, -40 ,-50);
mountains[2].position.set(30, -40 ,-60);
mountains[3].position.set(-25, -40 ,-100);
mountains[4].position.set(-70, -50 ,-90);

//Update matrices and combine mountains into single geometry
var mountain_geo = new THREE.Geometry();
for(let i = 0; i < num_mountains; i++) {
  mountains[i].updateMatrix();
  mountain_geo.merge(mountains[i].geometry, mountains[i].matrix);
}

//Create new mesh of mountain range and add it to the scene
var mountain_range = new THREE.Mesh(mountain_geo, material_standard.clone());
scene.add(mountain_range);

//Text Creation/Placement
var loader = new THREE.FontLoader();
loader.load('//raw.githubusercontent.com/mrdoob/three.js' + 
  '/master/examples/fonts/helvetiker_regular.typeface.json',
  function(font) {
    //Create first geometry
    let textGeo1 = new THREE.TextGeometry("Color Palette Picker", {
      font: font,
      size: 1,
      height: 0.001,
    });
    //Create second geometry
    let textGeo2 = new THREE.TextGeometry("Click around to experiment", {
      font: font,
      size: 0.5,
      height: 0.001,
    });

    //Create both meshes
    let t1 = new THREE.Mesh(textGeo1);
    let t2 = new THREE.Mesh(textGeo2);

    //Position text
    t1.position.set(-19, 12, -12);
    t2.position.set(-19, 11, -12);

    //Update both matrices
    t1.updateMatrix();
    t2.updateMatrix();

    //Combine texts into one geometry
    let combined_geo = new THREE.Geometry();
    combined_geo.merge(t1.geometry, t1.matrix);
    combined_geo.merge(t2.geometry, t2.matrix);

    //Create new mesh combined text and add it to the scene
    let text = new THREE.Mesh(combined_geo, material_standard.clone());
    text.name = 'text';
    scene.add(text);
  });

//Lights
var light = new THREE.AmbientLight(0x888899); // soft white light
var hemiLight = new THREE.HemisphereLight(0xaaaabb, 0x222244, 1);
scene.add(hemiLight);
scene.add(light);

//Color Objects
//Objects will have a field of a corresponding html id that they can target
//This allows showtooltip and hidetooltip functions to toggle these elements
objects[0].userData.color_text = "Color bg";
objects[1].userData.color_text = "Color accent";
objects[2].userData.color_text = "Color tertiary";
objects[3].userData.color_text = "Color text";
objects[4].userData.color_text = "Color text invert";
objects[5].userData.color_text = "Color text highlight";
objects[6].userData.color_text = "Color border";
objects[7].userData.color_text = "Color border accent";
objects[8].userData.color_text = "Color drop shadow";
objects[9].userData.color_text = "Color base";

//Randomize, Generate, and Submission Field objects
objects[10].userData.color_text = "palette-button-randomize";
objects[11].userData.color_text = "palette-submission-field";
objects[12].userData.color_text = "palette-button-generate";
objects[13].userData.color_text = "palette-view-toggle";

//Event Listeners
//Loading Manager
var text;
THREE.DefaultLoadingManager.onLoad = function() {
  //Once text is loaded, set to objects
  text = scene.getObjectByName('text');

  //Once everything is loaded, set colors accordingly
  objects[1].material.color.set(root_style.getPropertyValue("--color-accent"));
  objects[2].material.color.set(root_style.getPropertyValue("--color-tertiary"));
  objects[4].material.color.set(root_style.getPropertyValue("--color-text-invert"));
  objects[5].material.color.set(root_style.getPropertyValue("--color-text-highlight"));
  objects[6].material.color.set(root_style.getPropertyValue("--color-border"));
  objects[7].material.color.set(root_style.getPropertyValue("--color-border-accent"));
  objects[8].material.color.set(root_style.getPropertyValue("--color-drop_shadow"));
  objects[9].material.color.set(root_style.getPropertyValue("--color-base"));

  //Update objects based on color-bg
  let color_bg = root_style.getPropertyValue("--color-bg");
  objects[0].material.color.set(color_bg);
  mountain_range.material.color.set(color_bg);
  scene.fog.color.set(color_bg);

  //Update objects based on color-text
  let color_text = root_style.getPropertyValue("--color-text");
  objects[3].material.color.set(color_text);
  text.material.color.set(color_text);

  //Hide Loading Screen
  $(".preloader").hide();

  //Launch animation when ready
  animate();
};

//Session Storage Event
//Change colors anytime sessionStorage changes
window.addEventListener('storage', function(e) {
  objects[1].material.color.set(sessionStorage.getItem("color_accent"));
  objects[2].material.color.set(sessionStorage.getItem("color_tertiary"));
  objects[4].material.color.set(sessionStorage.getItem("color_text_invert"));
  objects[5].material.color.set(sessionStorage.getItem("color_text_highlight"));
  objects[6].material.color.set(sessionStorage.getItem("color_border"));
  objects[7].material.color.set(sessionStorage.getItem("color_border_accent"));
  objects[8].material.color.set(sessionStorage.getItem("color_drop_shadow"));
  objects[9].material.color.set(sessionStorage.getItem("color_base"));

  //Update objects based on color_bg
  let color_bg = sessionStorage.getItem("color_bg");
  objects[0].material.color.set(color_bg);
  mountain_range.material.color.set(color_bg);
  scene.fog.color.set(color_bg);

  //Update objects based on color_text
  var color_text = sessionStorage.getItem("color_text");
  objects[3].material.color.set(color_text);
  text.material.color.set(color_text);
});

//Window Resizing Event
//Deal with window resizing
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
  camera.aspect = $('.main-wrapper').width()/window.innerHeight,
  camera.updateProjectionMatrix();
  renderer.setSize($('.main-wrapper').width(), window.innerHeight);
}

//Object Click/Hover Detection Variables
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var latestMouseProjection;
var hoverPreTimeout;
var hoverPostTimeout;
var hoveredIndex = null;
var hoveredObj = null;
var lastHoveredObj = null;
var hoverActive = false;
var selectedObj = null;
var tooltipSelected = null;
mouse.set(3000,3000); //set initial mouse off canvas

//Raycasting Functions
//Retrieve mouse's coordinates on the canvas
function updateMouseCoords(event) {
  var canvasPosition = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - canvasPosition.left)/$('.main-wrapper').width()) * 2 - 1;
  mouse.y = -((event.clientY - canvasPosition.top)/window.innerHeight) * 2 + 1;
}

//Checks collision between mouse and objs
//Returns the intersected object and the point of intersection
//Returns [null, null] if no collision
function raycastMouse(event, objs) {
  //Update mouse position
  updateMouseCoords(event);

  //Compute the raycast to potential objects
  raycaster.setFromCamera(mouse, camera);

  //Check intersections
  var intersects = raycaster.intersectObjects(objs);
  if(intersects.length > 0) {
    mouse.set(3000,3000); //reset mouse pos

    //Return the object and the intersected point
    return [intersects[0].object, intersects[0].point];
  }

  return [null, null];
}

//Mouse Click Event
var canvas = document.getElementById('webglCanvas');
canvas.addEventListener('mousedown', onDocumentMouseDown, false);
function onDocumentMouseDown(event) {
  event.preventDefault();

  //Detect what the user clicked on
  selectedObj = raycastMouse(event, objects)[0];

  //If there is an object that has been selected...
  if(selectedObj != null) {
    if(tooltipSelected != selectedObj.userData.color_text) {
      hideTooltip(tooltipSelected);
      tooltipSelected = null;
    }
    tooltipSelected = selectedObj.userData.color_text;
    showTooltip(selectedObj.userData.color_text);
  }
  else {
    hoverPostTimeout = undefined;
    hoverActive = false;

    if(tooltipSelected != null) {
      hideTooltip(tooltipSelected);
      tooltipSelected = null;
    }
  }
}

//Mouse Hover Event
canvas.addEventListener('mousemove', onMouseMove, false);
function onMouseMove(event) {
  event.preventDefault();

  //Run Raycast Detection
  [hoveredObj, latestMouseProjection] = raycastMouse(event, objects);

  //See if hovered object has switched
  if(hoveredObj != lastHoveredObj) {
    //If an object is being hovered over
    if(hoveredObj != null) {
      hoverActive = true;

      //Grab the id of the hovered object
      hoveredIndex = hoveredObj.userData.id;

      //Set the hover state of that object
      for(let i = 0; i < num_objects; i++) {
        outlines[i].visible = (i == hoveredIndex);
      }
    }

    //Once the hoverPostTimeout occurs
    if(hoverPostTimeout || !latestMouseProjection) {
      clearTimeout(hoverPostTimeout);
      hoverPostTimeout = undefined;
    }

    //Once the mouse hovers over an object past the hoverPreTimeout
    if(hoverPreTimeout || !latestMouseProjection) {
      clearTimeout(hoverPreTimeout);
      hoverPreTimeout = undefined;
      outlines[hoveredIndex].visible = false;

      //If there's no currently selected object
      if(selectedObj == null) {
        //Start post hover timer
        hoverPostTimeout = setTimeout(function() {
          hoverPostTimeout = undefined;
          hoverActive = false;
        }, 330);
      }
    }

    //Start pre hover timer
    if(!hoverPreTimeout && latestMouseProjection) {
      hoverPreTimeout = setTimeout(function() {
        hoverPreTimeout = undefined;
      }, 330);
    }
  }

  //Log the last hovered object
  lastHoveredObj = hoveredObj;
}

//Show Tooltip
function showTooltip(element) {
  //Find the element provided to showTooltip
  var tElement = $("[id='" + element + "']");

  //If the element exists, and there is a valid mouse projection
  if(tElement && latestMouseProjection) {
    //Set the style of the object
    tElement.css({
      display: "block",
      opacity: 0.0
    });

    var offsetWidth = renderer.domElement.offsetWidth;
    var offsetHeight = renderer.domElement.offsetHeight;

    //Grab position of mouse
    var tPosition = latestMouseProjection.clone().project(camera);
    tPosition.x = (tPosition.x + 1) * offsetWidth/2 + renderer.domElement.offsetLeft;
    tPosition.y = (-tPosition.y + 1) * offsetHeight/2 + renderer.domElement.offsetTop;

    var tWidth = tElement[0].offsetWidth;
    var tHeight = tElement[0].offsetHeight;

    //Get position of scroll bar on page
    var windowScroll = window.scrollY;

    //Position the element above the mouse click
    tElement.css({
      left: `${tPosition.x - tWidth/2}px`,
      top: `${tPosition.y - tHeight - 10 - windowScroll}px`
    });

    //Fade in the element
    setTimeout(function() {
      tElement.css({
        opacity: 1.0,
      });
    }, 25);
  }
}

//Hide Tooltip
function hideTooltip(element) {
  //Find the element provided to showTooltip
  var tElement = $("[id='" + element + "']");

  //If the element exists and is visible
  if (tElement && tElement.is(":visible")) {
    setTimeout(function() {
      tElement.css({
        display: "none"
      });
    }, 25);
  }
}

//Animate the Canvas
var sin_motion_counter = 0;
var clock = new THREE.Clock();
var delta = 0;
var update_interval = 1/2;
var fixed_frame_rate = 90; //Stats.js says this is equivalent to 60fps, might be due to ~60fps cap by code

//Randomize wind start times and define speed
shaders.forEach(shader => {
  shader.uniforms.uTime.value += Math.random();
  shader.speed = (0.5 + Math.random())/120;
});

//If using Stats.js
/*var stats = new Stats();
stats.showPanel(0);
stats.domElement.style.cssText = 'position:absolute;top:0px;left:0px;';
document.body.appendChild(stats.domElement);*/

//Animation loop
function animate() {
  //If using Stats.js
  //stats.update();

  //Fix the frame rate
  setTimeout(function() {
    requestAnimationFrame(animate);
  }, 1000/fixed_frame_rate);

  //Randomize color of object10 at a slower rate than everything else
  delta += clock.getDelta();
  if(delta > update_interval) {
    objects[10].material.color.setRGB(Math.random()/1.5,
      Math.random()/1.5,
      Math.random()/1.5);
    delta = delta % update_interval;
  }

  //Update shader speed for each shader
  shaders.forEach(shader => {
    shader.uniforms.uTime.value += shader.speed;
  });

  //Rotate individual objects
  objects[1].rotation.y += 0.01;
  objects[1].rotation.z += 0.001;
  objects[2].rotation.y -= 0.01;
  objects[2].rotation.z += 0.001;
  objects[3].rotation.x += 0.01;
  objects[3].rotation.z += 0.001;
  objects[4].rotation.x -= 0.01;
  objects[4].rotation.z += 0.001;
  objects[5].rotation.x += 0.01;
  objects[5].rotation.y += 0.01;
  objects[5].rotation.z -= 0.001;
  objects[6].rotation.x -= 0.01;
  objects[6].rotation.y += 0.01;
  objects[6].rotation.z -= 0.001;
  objects[7].rotation.x += 0.01;
  objects[7].rotation.y -= 0.01;
  objects[7].rotation.z -= 0.001;
  objects[8].rotation.x -= 0.01;
  objects[8].rotation.y -= 0.01;
  objects[8].rotation.z -= 0.001;
  objects[9].rotation.x += 0.008;
  objects[9].rotation.y -= 0.01;
  objects[9].rotation.z += 0.0012;

  //Rotate Function Objects
  objects[10].rotation.y -= 0.001;
  objects[11].rotation.y += 0.001;
  objects[12].rotation.y -= 0.001;
  objects[13].rotation.y += 0.001;

  //Rotate Group
  if(hoverActive == false) {
    box_group.rotation.y += 0.003;

    //Rotate objects in sin pattern
    objects[1].position.y = 1.2*Math.sin(sin_motion_counter + Math.PI);
    objects[2].position.y = -Math.sin(sin_motion_counter);
    objects[3].position.y = 1.1*Math.sin(sin_motion_counter);
    objects[4].position.y = 1.3*Math.sin(sin_motion_counter);
    objects[5].position.y = -1.3*Math.sin(sin_motion_counter - Math.PI);
    objects[6].position.y = 0.3*Math.sin(sin_motion_counter);
    objects[7].position.y = -0.3*Math.sin(sin_motion_counter);
    objects[8].position.y = -1.1*Math.sin(sin_motion_counter);
    objects[9].position.y = 0.5*Math.sin(sin_motion_counter);

    //Move function objects up and down in sin/cos pattern
    objects[10].position.y = 11*Math.sin(sin_motion_counter/5);
    objects[11].position.y = 8*Math.cos(sin_motion_counter/4);
    objects[12].position.y = -12*Math.sin(sin_motion_counter/8);
    objects[13].position.y = -9*Math.cos(sin_motion_counter/6);

    //Rotate Camera
    camera.rotation.y = 0.03*Math.sin(sin_motion_counter/3);

    //Update rotation counter
    sin_motion_counter += Math.PI/800;
  }
  else {
    //Have the outlines object copy the position and rotation of it's parent
    outlines[hoveredIndex].position.copy(objects[hoveredIndex].position);
    outlines[hoveredIndex].rotation.copy(objects[hoveredIndex].rotation);
  }

  //Render Scene
  renderer.render(scene, camera);
}
