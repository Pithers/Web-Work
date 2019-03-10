/** 
 * Author: Brandon Smith
 * Filename: initialize.js
 * Desc: Initializes WebGL environment 
 * Date: 12/13/2016
 * Reference: WebGL Programming Guide: Interactive 3D
 *            Graphics Programming with WebGL
 *            Learningwebgl.com/blog/?p=1253 for sphere generation
 */

//**********************Initialization*************************
//Get rendering context
var canvas = document.getElementById('webgl');
var gl = getWebGLContext(canvas);
if(!gl)
{
  console.log('Error: Could not get rendering context');
}

//Create programs
var program = createProgram(gl, VSHADER, FSHADER);
var program_tex = createProgram(gl, VSHADER_TEX, FSHADER_TEX);
if(!program || !program_tex)
{
  console.log('Error: Could not initialize programs');
}

//------------------Camera Stuff--------------------------
var camera =
{
    x: 0,
    y: 0.5,
    z: 15,
    at_x: 0,
    at_y: 0.5,
    at_z: 14,
    up_x: 0,
    up_y: 1,
    up_z: 0,
    roll: 0,
    pitch: 0,
    yaw: 0,
};

//-----------------Create view matrices----------------------
var viewMatrix = new Matrix4();
viewMatrix.setLookAt(camera.x, camera.y, camera.z,
                     camera.at_x, camera.at_y, camera.at_z,
                     camera.up_x, camera.up_y, camera.up_z);

var projMatrix = new Matrix4();
projMatrix.setPerspective(60, canvas.width/canvas.height, 1, 200);

//Add gl specifig buffers to primitives defined in other file
var numPrimitives = 2;
var Primitives = new Array();
for(var i = 0; i < numPrimitives; i++)
{
  Primitives.push(
  {
    modelBuffer: new gl.createBuffer(),
    normalBuffer: new gl.createBuffer(),
    colorBuffer: new gl.createBuffer(),
    indexBuffer: new gl.createBuffer(),
    texBuffer: new gl.createBuffer()
  });
}

//--------------------Define Primitives----------------------
//---------------------Cube Primitive-----------------------
Primitives[0].model = new Float32Array([   //Vertex coordinates
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, 
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0 
  ]);
Primitives[0].normals = new Float32Array([ //Normal coordinates
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0, 
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   
  ]);

Primitives[0].color = new Float32Array([  //Color coordinates
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  
    0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4, 
    1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4, 
    1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4, 
    1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0, 
    0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0  
  ]);
Primitives[0].texCoords = new Float32Array([ //Texture coordinates
    0,0,  0,30,  30,0,  30,30,  
    0,0,  0,30,  30,0,  30,30,  
    0,0,  0,30,  30,0,  30,30,  
    0,0,  0,30,  30,0,  30,30, 
    0,0,  0,30,  30,0,  30,30, 
    0,0,  0,30,  30,0,  30,30  
  ]);
Primitives[0].indices = new Uint16Array([  //Indices of the vertices
     0, 1, 2,   0, 2, 3,    //front
     4, 5, 6,   4, 6, 7,    //right
     8, 9,10,   8,10,11,    //up
    12,13,14,  12,14,15,    //left
    16,17,18,  16,18,19,    //down
    20,21,22,  20,22,23     //back
  ]);

//---------------------Sphere Primitive-----------------------
var latitudeBands = 30;
var longitudeBands = 30;
var radius = 2;

Primitives[1].model = new Array();     
Primitives[1].normals = new Array();   
Primitives[1].color = new Array();     
Primitives[1].texCoords = new Array(); 
Primitives[1].indices = new Array();   

for(var latNumber = 0; latNumber <= latitudeBands; latNumber++) 
{
  var theta = latNumber*Math.PI/latitudeBands;
  var sinTheta = Math.sin(theta);
  var cosTheta = Math.cos(theta);

  for(var longNumber = 0; longNumber <= longitudeBands; longNumber++) 
  {
    var phi = longNumber*2*Math.PI/longitudeBands;
    var sinPhi = Math.sin(phi);
    var cosPhi = Math.cos(phi);
    var x = cosPhi*sinTheta;
    var y = cosTheta;
    var z = sinPhi*sinTheta;
    var u = 1-(longNumber/longitudeBands);
    var v = 1-(latNumber/latitudeBands);

    //Model Matrix
    Primitives[1].model.push(radius * x);
    Primitives[1].model.push(radius * y);
    Primitives[1].model.push(radius * z);

    //Normals matrix
    Primitives[1].normals.push(x);
    Primitives[1].normals.push(y);
    Primitives[1].normals.push(z);

    //Texture Coordinates
    Primitives[1].texCoords.push(u);
    Primitives[1].texCoords.push(v);

    //Make it a random color
    Primitives[1].color.push(0.8); //R 
    Primitives[1].color.push(0.8); //G
    Primitives[1].color.push(0.8); //B
  }
}
for (var latNumber = 0; latNumber < latitudeBands; latNumber++) 
{
  for (var longNumber = 0; longNumber < longitudeBands; longNumber++) 
  {
    var first = (latNumber * (longitudeBands + 1)) + longNumber;
    var second = first + longitudeBands + 1;

    Primitives[1].indices.push(first);
    Primitives[1].indices.push(second);
    Primitives[1].indices.push(first + 1);

    Primitives[1].indices.push(second);
    Primitives[1].indices.push(second + 1);
    Primitives[1].indices.push(first + 1);
  }
}

//----------------Initialize buffers--------------------
for(var i = 0; i < Primitives.length; i++)
{
  //Bind model buffer and fill it with vertices
  gl.bindBuffer(gl.ARRAY_BUFFER, Primitives[i].modelBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Primitives[i].model), gl.STATIC_DRAW);

  //Bind normal buffer and fill it with vertices
  gl.bindBuffer(gl.ARRAY_BUFFER, Primitives[i].normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Primitives[i].normals), gl.STATIC_DRAW);

  //Bind color buffer and fill it with vertices
  gl.bindBuffer(gl.ARRAY_BUFFER, Primitives[i].colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Primitives[i].color), gl.STATIC_DRAW);

  //Bind color buffer and fill it with vertices
  gl.bindBuffer(gl.ARRAY_BUFFER, Primitives[i].texBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Primitives[i].texCoords), gl.STATIC_DRAW);
}
