/** 
 * Author: Brandon Smith
 * Filename: assignment5.js
 * Desc: WebGl 3D environment 
 * Date: 11/13/2016
 * Reference: WebGL Programming Guide: Interactive 3D
 *            Graphics Programming with WebGL
 */
//---------Vertex shader program---------------
var VSHADER =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_Transform;\n' +
  'uniform mat4 u_ProjMatrix;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_ProjMatrix * u_ViewMatrix * u_Transform * a_Position;\n' +
  '  v_Color = a_Color;\n' + 
  '}\n';
//--------------------------------------------

//---------Fragment shader program------------
var FSHADER =
  'precision mediump float;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' + 
  '}\n';
//-------------------------------------------

//---------Vertex shader program for textures---------------
var VSHADER_TEX =
  'attribute vec4 a_Position;\n' +
  'attribute vec2 a_TexCoord;\n' +
  'varying vec2 v_TexCoord;\n' +
  'uniform mat4 u_Transform;\n' +
  'uniform mat4 u_ProjMatrix;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_ProjMatrix * u_ViewMatrix * u_Transform * a_Position;\n' +
  '  v_TexCoord = a_TexCoord;\n' +
  '}\n';
//--------------------------------------------

//---------Fragment shader program for textures------------
var FSHADER_TEX =
  'precision mediump float;\n' +
  'uniform sampler2D u_Sampler;\n' +
  'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
  '  gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' + 
  '}\n';
//-------------------------------------------

//-------------------Disable html window arrow keys--------
window.addEventListener("keydown", function(e) {
  //space and arrow keys
  if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
    e.preventDefault();
  }
}, false);

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

//---------------Deal with key presses-----------
var keys =
{
  left_arrowr: 0,
  right_arrow: 0,
  up_arrow: 0,
  down_arrow: 0,
  w_key: 0,
  y_key: 0
};

/*
 * Runs on a key press down and genetates flags accordingly
 * @param {ev}     key event
 */
function keydown(ev)
{
  if(ev.keyCode == 39)
  {
    keys.right_arrow = 1;
  }
  if(ev.keyCode == 37)
  {
    keys.left_arrow = 1;
  }
  if(ev.keyCode == 38)
  {
    keys.up_arrow = 1;
  }
  if(ev.keyCode == 40)
  {
    keys.down_arrow = 1;
  }
  if(ev.keyCode == 87)
  {
    keys.w_key = !keys.w_key;
  }
  if(ev.keyCode == 89)
  {
    keys.y_key = 1;
  }
}
/*
 * Runs on a key release and genetates flags accordingly
 * @param {ev}     key event
 */
function keyup(ev)
{
  if(ev.keyCode == 39)
  {
    keys.right_arrow = 0;
  }
  if(ev.keyCode == 37)
  {
    keys.left_arrow = 0;
  }
  if(ev.keyCode == 38)
  {
    keys.up_arrow = 0;
  }
  if(ev.keyCode == 40)
  {
    keys.down_arrow = 0;
  }
  if(ev.keyCode == 89)
  {
    keys.y_key = 0;
  }
}
document.onkeydown = function(ev){keydown(ev);};
document.onkeyup = function(ev){keyup(ev);};

//********************************************************
//----------------------Object Stuff----------------------
//********************************************************
var objVec = new Array();
var numObj = 13;

//Create common objects
for(var i = 0; i < numObj; i++)
{
  objVec.push(
  {
    textured: 0,        //0 for non-textured object, 1 for textured
    texture: 0,         //Texture object
    texture_unit: 0,    //Texture unit
    scale_x:  1,        //How to scale object in x direction
    scale_y:  1,        //How to scale object in y direction
    scale_z:  1,        //How to scale object in z direction
    rotation_x: 0,      //number of degrees to rotate object in x direction
    rotation_y: 0,      //number of degrees to rotate object in y direction
    rotation_z: 0,      //number of degrees to rotate object in z direction
    x: 0,               //x coordinate of where to transform object to
    y: 0,               //y coordinate of where to transform object to
    z: 0,               //z coordinate of where to transform object to  
    rot_x: 0,           //x coordinate to rotate about
    rot_y: 0,           //y coordinate to rotate about
    rot_z: 0,           //z coordinate to rotate about
    draw_request: 1,    //flag for draw, 1:draw, 0: ignore
    bufferChange: 1,    //flag for buffering data for vertices
    texbufferChange: 1, //flag for buffering data for textures
    draw_type: gl.TRIANGLES, //Draw type for object
    transform: new Matrix4,  //Transformation matrix         
  });
}

//---------------------Cube Object-----------------------
var cube = new Float32Array([   //Vertex coordinates
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, 
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0 
  ]);
var color = new Float32Array([  //Color coordinates
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  
    0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4, 
    1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4, 
    1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4, 
    1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0, 
    0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0  
  ]);
var texCoords = new Float32Array([ //Texture coordinates
    0,0,  0,30,  30,0,  30,30,  
    0,0,  0,30,  30,0,  30,30,  
    0,0,  0,30,  30,0,  30,30,  
    0,0,  0,30,  30,0,  30,30, 
    0,0,  0,30,  30,0,  30,30, 
    0,0,  0,30,  30,0,  30,30  
  ]);
var indices = new Uint8Array([  //Indices of the vertices
     0, 1, 2,   0, 2, 3,    //front
     4, 5, 6,   4, 6, 7,    //right
     8, 9,10,   8,10,11,    //up
    12,13,14,  12,14,15,    //left
    16,17,18,  16,18,19,    //down
    20,21,22,  20,22,23     //back
  ]);

//Create buffers
var cubeBuffer = gl.createBuffer();
var colorBuffer = gl.createBuffer();
var indexBuffer = gl.createBuffer();
var texBuffer = gl.createBuffer();

//Bind cube buffer and fill it with vertices
gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
gl.bufferData(gl.ARRAY_BUFFER, cube, gl.STATIC_DRAW);

//Bind color buffer and fill it with vertices
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, color, gl.STATIC_DRAW);

//Bind color buffer and fill it with vertices
gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

//--------------------Other Objects------------------------
//Ground
objVec[0].scale_x = 250;
objVec[0].scale_z = 250;
objVec[0].y = -2;
objVec[0].textured = 1;

//Box 1
objVec[1].y = 2;
objVec[1].z = -28;
objVec[1].x = -10;
objVec[1].scale_y = 20;
objVec[1].scale_x = 2;
objVec[1].scale_z = 2;
objVec[1].rotation_y = -20;

//Box 2
objVec[2].y = 2;
objVec[2].z = -16;
objVec[2].x = 5;
objVec[2].scale_y = 5;
objVec[2].scale_x = 2;
objVec[2].scale_z = 2;
objVec[2].rotation_y = 180;

//Box 3
objVec[3].y = 10;
objVec[3].z = -12;
objVec[3].x = -12;
objVec[3].scale_y = 8;
objVec[3].scale_x = 2;
objVec[3].scale_z = 2;
objVec[3].rotation_y = 45;

//Box 4
objVec[4].y = 2;
objVec[4].z = -12;
objVec[4].x = -14;
objVec[4].scale_y = 5;
objVec[4].scale_x = 4;
objVec[4].scale_z = 16;
objVec[4].rotation_y = 145;

//--Windmill parts
//Base
objVec[5].y = 2;
objVec[5].z = -22;
objVec[5].x = 15;
objVec[5].scale_y = 24;
objVec[5].scale_x = 1;
objVec[5].scale_z = 2;
objVec[5].rotation_y = -135;

//Blades
objVec[6].y = 24;
objVec[6].z = -22;
objVec[6].x = 15;
objVec[6].scale_y = 1;
objVec[6].scale_x = 0.5;
objVec[6].scale_z = 8;
objVec[6].rot_z = -10;
objVec[6].rot_x = 3;
objVec[6].rotation_y = -135;

objVec[7].y = 24;
objVec[7].z = -22;
objVec[7].x = 15;
objVec[7].scale_y = 1;
objVec[7].scale_x = 0.5;
objVec[7].scale_z = 8;
objVec[7].rot_z = 10;
objVec[7].rot_x = 3;
objVec[7].rotation_y = -135;

objVec[8].y = 24;
objVec[8].z = -22;
objVec[8].x = 15;
objVec[8].scale_y = 1;
objVec[8].scale_x = 0.5;
objVec[8].scale_z = 8;
objVec[8].rot_z = -10;
objVec[8].rot_x = 3;
objVec[8].rotation_x = 90;
objVec[8].rotation_y = -135;

objVec[9].y = 24;
objVec[9].z = -22;
objVec[9].x = 15;
objVec[9].scale_y = 1;
objVec[9].scale_x = 0.5;
objVec[9].scale_z = 8;
objVec[9].rot_z = -10;
objVec[9].rot_x = 3;
objVec[9].rotation_x = -90;
objVec[9].rotation_y = -135;

//Box 5
objVec[10].y = 2;
objVec[10].z = -72;
objVec[10].x = 0;
objVec[10].scale_y = 15;
objVec[10].scale_x = 18;
objVec[10].scale_z = 16;
objVec[10].rotation_y = 145;

//Box 6
objVec[11].y = 2;
objVec[11].z = -72;
objVec[11].x = 0;
objVec[11].scale_y = 95;
objVec[11].scale_x = 8;
objVec[11].scale_z = 8;
objVec[11].rotation_y = 240;
objVec[11].rotation_z = 10;
objVec[11].rotation_x = -30;

//Box 7
objVec[12].y = -1;
objVec[12].z = -82;
objVec[12].x = 0;
objVec[12].scale_y = 1;
objVec[12].scale_x = 55;
objVec[12].scale_z = 55;
objVec[12].rotation_x = 90;
objVec[12].rotation_z = 45;

//----------------------Main--------------------------------
function main() 
{
  //Check to make sure buffers were created correctly
  if(!cubeBuffer || !indexBuffer || !colorBuffer || !texBuffer)
  {
    console.log('Error: Could not create a buffer');
    return;
  }

  //-------Initialize Shader Variables--------------
  //Normal Program
  program.u_TransformAddr = gl.getUniformLocation(program,'u_Transform');
  program.u_ViewMatrix = gl.getUniformLocation(program,'u_ViewMatrix');
  program.u_ProjMatrix = gl.getUniformLocation(program,'u_ProjMatrix');
  program.a_PositionAddr = gl.getAttribLocation(program,'a_Position');
  program.a_ColorAddr = gl.getAttribLocation(program,'a_Color');

  //Texture Program
  program_tex.u_TransformAddr = gl.getUniformLocation
                                (program_tex,'u_Transform');
  program_tex.u_ViewMatrix = gl.getUniformLocation(program_tex,'u_ViewMatrix');
  program_tex.u_ProjMatrix = gl.getUniformLocation(program_tex,'u_ProjMatrix');
  program_tex.u_Sampler = gl.getUniformLocation(program_tex,'u_Sampler');
  program_tex.a_TexCoord = gl.getAttribLocation(program_tex,'a_TexCoord');
  program_tex.a_PositionAddr = gl.getAttribLocation(program_tex,'a_Position');

  //Check locations
  if(program.u_TransformAddr < 0 || program.a_PositionAddr < 0 ||
     program.a_ColorAddr < 0 || !program.u_ProjMatrix || 
     !program.u_ViewMatrix || !program_tex.u_TransformAddr ||
     program_tex.a_PositionAddr < 0 || !program_tex.u_ProjMatrix ||
     !program_tex.u_ViewMatrix || !program_tex.u_Sampler ||
     program_tex.a_TextCoord < 0) 
  {
    console.log('Error: Could not get storage location of shader variables');
    return -1;
  }
  //------------------------------------------------

  //Set the initial clear color
  gl.clearColor(0.1,0.7,0.9,1);
  gl.enable(gl.DEPTH_TEST);

  //--------------Initialize the textures----------
  for(var i = 0; i < numObj; i++)       //create textures for objects
  {
    if(objVec[i].textured == 1)
    {
      objVec[i].texture = gl.createTexture();
      if(objVec[i].texture < 0)
      {
        console.log('Error: Could not create the texture');
        return -1;
      }
    }
  }
  var i_background = new Image();
  if(i_background < 0)
  {
    console.log('Error: Could not create image');
    return -1;
  }
  //Set up function to run on image load
  i_background.onload = function() {loadTexture(i_background)};

  //Load images
  i_background.src = '/static/webgl/background.jpg';
  //------------------------------------------------

/**
 * Loads in the textures for the game objects
 *
 *  @param {img}     image to use as the texture
 */
function loadTexture(img)
{
  for(var i = 0; i < numObj; i++)  //initialize texture for objects
  {
    if(objVec[i].textured == 1)
    {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);          //flip y
      gl.activeTexture(gl.TEXTURE0);                     
      gl.bindTexture(gl.TEXTURE_2D, objVec[i].texture);   //bind texture
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                    gl.RGBA, gl.UNSIGNED_BYTE, img);
    }
  }
  //Start program on image load
  tick();
}

//***************Finished Initialization*************************
/**
 * Executes for each ingame tick  
 * Evaluates game state and draws to the screen
 */
  var tick = function()
  {
    //---------------Animate objects---------------
    animate();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //Draw objects
    for(var i = 0; i < numObj; i++)
    {
      //Only draw object if it has requested to be drawn
      if(objVec[i].draw_request == 1)
      {
        Draw(objVec[i]);
        objVec[i].draw_request = 0;
      }
    }
    requestAnimationFrame(tick, canvas);
  }
}

/**
 * Updates all of the states needed for animation
 */
function animate()
{
  //objVec[] mapping:
  //0 -Ground
  //1-4 Buildings
  //5 Base of windmill
  //6-9 windmill blades
  //10-12 Buildings
 
  //Deal with key presses
  if(keys.right_arrow == 1)
  {
    camera.yaw += 3; 
  }
  if(keys.left_arrow == 1)
  {
    camera.yaw -= 3; 
  }
  if(keys.up_arrow == 1)
  {
    //Walk forward
    camera.z = camera.at_z;
    camera.at_z -= camera.at_z;
    camera.x = camera.at_x;
    camera.at_x -= camera.at_x;
  }
  if(keys.down_arrow == 1)
  {
    //Walk backward
    camera.z = 2*camera.z - camera.at_z;
    camera.at_z += camera.at_z;
    camera.x = 2*camera.x - camera.at_x;
    camera.at_x += camera.at_x;
  }
  if(keys.w_key == 1)
  {
    //Rotate blades
    for(var i = 6; i < 10; i++)
    {
      objVec[i].rotation_x = (objVec[i].rotation_x + 1) % 360;
    }
  }
  if(keys.y_key == 1)
  {
    //Rotate entire windmill
    for(var i = 5; i < 10; i++)
    {
      objVec[i].rotation_y = (objVec[i].rotation_y - 1) % 360;
    }
  }

  //Rotate stuff 
  objVec[12].rotation_z = (objVec[12].rotation_z - 0.1) % 360;

  //Move Camera
  camera.at_z = camera.z - Math.cos(camera.yaw * Math.PI/180);
  camera.at_x = camera.x + Math.sin(camera.yaw * Math.PI/180);

  //Due to the layering nature of the constant animation
  //we need to render every object every frame 
  for(var i = 0; i < numObj; i++)
  {
    objVec[i].draw_request = 1;
  }

  //-----------Update every object---------
  for(var i = 0; i < numObj; i++)
  {
    //Translate object
    objVec[i].transform.setTranslate(objVec[i].x, objVec[i].y, objVec[i].z);

    //Every object starts at the center, so rotate it by the z axis
    objVec[i].transform.rotate(objVec[i].rotation_z, 0, 0, 1);
    objVec[i].transform.rotate(objVec[i].rotation_y, 0, 1, 0);
    objVec[i].transform.rotate(objVec[i].rotation_x, 1, 0, 0);

    //Set rotation axis for object
    objVec[i].transform.translate(objVec[i].rot_x, objVec[i].rot_y,
                                  objVec[i].rot_z);

    //Scale object
    objVec[i].transform.scale(objVec[i].scale_x, objVec[i].scale_y,
                              objVec[i].scale_z);
  }
}

/**
 *  Rebinds buffers and draws on the screen
 *
 *  @param {drawObject}     object to draw
 */
function Draw(drawObject) 
{
  if(drawObject.textured == 0) //Non-textured shaders
  {
    gl.useProgram(program);    //Currently failing
    gl.uniformMatrix4fv(program.u_TransformAddr, false, 
                      drawObject.transform.elements);
    gl.uniformMatrix4fv(program.u_ViewMatrix, false, viewMatrix.elements);
    gl.uniformMatrix4fv(program.u_ProjMatrix, false, projMatrix.elements);
  }
  else                         //Textured shaders
  {
    gl.useProgram(program_tex);
    gl.uniformMatrix4fv(program_tex.u_TransformAddr, false, 
                      drawObject.transform.elements);
    gl.uniformMatrix4fv(program_tex.u_ViewMatrix, false, viewMatrix.elements);
    gl.uniformMatrix4fv(program_tex.u_ProjMatrix, false, projMatrix.elements);
  }

  //Bind buffers with defined vertices
  bindVertexBuffer(drawObject);

  //-------------Draw to screen----------------------
  //Update camera
  viewMatrix.setLookAt(camera.x, camera.y, camera.z,
                       camera.at_x, camera.at_y, camera.at_z,
                       camera.up_x, camera.up_y, camera.up_z);

  //Check dropdown list for type and draw that particular type
  gl.drawElements(drawObject.draw_type, indices.length, gl.UNSIGNED_BYTE, 0);

  //-------------------------------------------------
}

/**
 *  Binds a draw buffer from the provided vertices
 *
 *  @param {drawObject}     object of buffer to bind        
 */
function bindVertexBuffer(drawObject)
{
  //Bind buffer and fill it with vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  //Only call bufferdata if the object's array changes
  if(drawObject.bufferChange == 1)
  {
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    drawObject.bufferChange = 0;
  }

  if(drawObject.textured == 0) //Non-textured shaders
  {
    //Set the attribute pointer to the position buffer and enable
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
    gl.vertexAttribPointer(program.a_PositionAddr, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.a_PositionAddr);

    //Set the attribute pointer to the color buffer and enable
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(program.a_ColorAddr, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.a_ColorAddr);
  }
  else                         //Textured shaders
  {
    //Set the attribute pointer to the position buffer and enable
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
    gl.vertexAttribPointer(program_tex.a_PositionAddr, 3, gl.FLOAT,
                           false, 0, 0);
    gl.enableVertexAttribArray(program_tex.a_PositionAddr);

    //Set the attribute pointer to the texture buffer and enable
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
    gl.vertexAttribPointer(program_tex.a_TexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program_tex.a_TexCoord);
  }
  return;
}


