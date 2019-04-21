/** 
 * Author: Brandon Smith
 * Filename: assignment3.js
 * Desc: WebGl animation game
 * Date: 10/1/2016
 * Reference: WebGL Programming Guide: Interactive 3D
 *            Graphics Programming with WebGL
 */
//---------Vertex shader program---------------
var VSHADER =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform float u_Invert;\n' + 
  'uniform float u_PointSize;\n' +
  'uniform vec4 u_ColorTransform;\n' + 
  'uniform mat4 u_Transform;\n' +
  'varying lowp vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_Transform * a_Position;\n' +
  '  gl_PointSize = u_PointSize;\n' +
  '  v_Color = (a_Color * u_Invert) + u_ColorTransform;\n' + 
  '}\n';
//--------------------------------------------

//---------Fragment shader program------------
var FSHADER =
  'varying lowp vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' + 
  '}\n';
//-------------------------------------------

//**********************Initialization*************************
//Global variables
var invertBackground = 1;
var bounce = 0;
var right = 0;
var up = 0;
var left = 0;
var jump = 0;
var jump_dir = 0;

//Get rendering context
var canvas = document.getElementById('webgl');
var gl = getWebGLContext(canvas);
if (!gl)
{
  console.log('Error: Could not get rendering context');
}

//--------------Shader Variables-------------
var Shader = 
{
  a_PositionAddr: 0,        //Position attribute in shader
  a_ColorAddr: 0,           //Per Vertex color attribute in shader
  u_ColorTransformAddr: 0,  //Color transform matrix in shader
  u_TransformAddr: 0,       //Transform matrix in shader
  u_InvertAddr: 0,          //Invert variable in shader
  u_PointSizeAddr: 0,       //Vertex size in shader
};

//-------------Create vector of objects-------------
var objVec = new Array();
var numObj = 9;

for(var i = 0; i < numObj; i++)
{
  objVec.push(
  {
    //Vertices form of [x1,y1,r1,g1,b1,x2,y2...etc]
    vertices: new Array(),  
    size:  4,         //number of vertices in array
    invert: 1.0,      //flag for color invert, 1: invert, 0: ignore
    vertex_size: 1.0, //size of each vertex
    rotation: 0,      //number of degrees to rotate object
    x: 0,             //x coordinate of where to transform object to
    y: 0,             //y coordinate of where to transform object to
    z: 0,             //z coordinate of where to transform object to  
    width: 0,         //width of collision box
    height: 0,        //height of collision box
    draw_request: 1,  //flag for draw, 1:draw, 0: ignore
    bufferChange: 1,  //flag to update vertex buffer, 1: update, 0: ignore
    colorChange: 1,   //flag to update color buffer, 1: update, 0: ignore
    draw_type: gl.TRIANGLE_STRIP, //Draw type for object
    transform: new Matrix4,            
    colorTransform: [0.0, 0.0, 0.0, 0.0],
    vertexBuffer: new gl.createBuffer(),
    colorBuffer: new gl.createBuffer(),
  });
}
//-------------------------------------------------

//____________Define specific objects_____________
//Hedge
objVec[0].size = 8;
objVec[0].vertices = 
    [
     -1.0, -0.2, 0, 0.5, 0.4,
     -1.0, -0.8, 0, 0.5, 0.4,
      0.0, -0.2, 0, 0.6, 0.3,
      0.0, -0.8, 0, 0.6, 0.3,
      1.0, -0.2, 0, 0.7, 0.2,
      1.0, -0.8, 0, 0.7, 0.2,
      2.0, -0.2, 0, 0.8, 0.1,
      2.0, -0.8, 0, 0.8, 0.1,
    ];

//Ground
objVec[1].vertices = 
    [
     -1.0, -0.5, 0.5, 0.67, 0.5, 
     -1.0, -1.0, 0.5, 0.67, 0.5, 
      1.0, -0.5, 0.0, 0.8, 0.0, 
      1.0, -1.0, 0.0, 0.5, 0.8,
    ];

//Player
objVec[2].vertices = 
    [
      -0.05, -0.1, 0.0, 0.0, 1.0, 
      -0.05, 0.1, 0.0, 0.0, 1.0,
      0.05, 0.1, 0.5, 0.8, 0.8, 
      0.05, -0.1, 0.5, 0.8, 0.8, 
    ];
objVec[2].x = -0.3;
objVec[2].y = -0.4;
objVec[2].width = 0.1;
objVec[2].height = 0.2;

//Obstacle 1
objVec[3].size = 4;
objVec[3].vertices = 
    [
      -0.1, -0.1, 0.7, 0.3, 0.8, 
      -0.1, 0.1, 0.3, 0.6, 0.8, 
      0.1, 0.1, 0.3, 0.6, 0.8,
      0.1, -0.1, 0.6, 0.3, 0.8, 
    ];
objVec[3].x = 0.3;
objVec[3].y = -0.4;
objVec[3].width = 0.2;
objVec[3].height = 0.2;
objVec[3].draw_type = gl.TRIANGLE_FAN;

//Obstacle 2
objVec[4].vertices = 
    [
      -0.2, -0.1, 0.8, 0.3, 0.7, 
      -0.2, 0.1, 0.8, 0.6, 0.3, 
      0.2, 0.1, 0.8, 0.6, 0.3,
      0.2, -0.1, 0.8, 0.3, 0.6, 
    ];
objVec[4].x = 2.0;
objVec[4].y = -0.4;
objVec[4].width = 0.4;
objVec[4].height = 0.2;
objVec[4].draw_type = gl.TRIANGLE_FAN;

//Sun
objVec[5].size = 8;
objVec[5].vertices = 
    [
      -0.1, -0.1, 0.9, 0.7, 0.0, 
      -0.14, 0, 0.9, 0.7, 0.0, 
      -0.1, 0.1, 1.0, 1.0, 0.0, 
      0, 0.14, 0.8, 0.5, 0.0,
      0.1, 0.1, 0.8, 0.7, 0.0, 
      0.14, 0, 1.0, 1.0, 0.0, 
      0.1, -0.1, 0.9, 0.5, 0.0,
      0, -0.14, 0.9, 0.5, 0.0, 
    ];
objVec[5].x = 0.5; 
objVec[5].y = 0.5;
objVec[5].draw_type = gl.TRIANGLE_FAN;

//Sun Rays
objVec[6].size = 8;
objVec[6].vertices = 
    [
      -0.11, -0.11, 0.9, 0.7, 0.0, 
      -0.15, 0, 0.9, 0.7, 0.0, 
      -0.11, 0.11, 1.0, 1.0, 0.0, 
      0, 0.15, 0.9, 0.5, 0.0,
      0.11, 0.11, 0.9, 0.7, 0.0, 
      0.15, 0, 1.0, 1.0, 0.0, 
      0.11, -0.11, 0.9, 0.5, 0.0,
      0, -0.15, 0.9, 0.5, 0.0, 
    ];
objVec[6].x = 0.5; 
objVec[6].y = 0.5;
objVec[6].draw_type = gl.LINE_LOOP;

//Clouds
objVec[7].size = 8;
objVec[7].vertices = 
    [
      -0.3, 0, 1.0, 1.0, 1.0, 
      -0.1, -0.1, 1.0, 1.0, 0.8, 
      0.1, -0.1, 1.0, 0.8, 1.0,
      0.3, 0, 1.0, 0.8, 1.0,
      0.3, 0.1, 1.0, 0.8, 1.0, 
      0.1, 0.2, 1.0, 1.0, 0.8, 
      -0.1, 0.2, 0.8, 1.0, 1.0, 
      -0.3, 0.1, 1.0, 0.8, 1.0, 
    ];
objVec[7].draw_type = gl.TRIANGLE_FAN;
objVec[7].x = 0;
objVec[7].y = 0.4;

//Flag Pole
objVec[8].size = 6;
objVec[8].vertices = 
    [
      -0.05, 0.6, 0.8, 0.4, 0.0,
      -0.2, 0.5, 1.0, 0.0, 0.0,
      -0.05, 0.5, 1.0, 0.0, 0.0,
      -0.05, 0.0, 0.5, 0.5, 0.2,
      0.05, 0.0, 0.5, 0.5, 0.3,
      0.05, 0.6, 0.5, 0.5, 0.3,
    ];
objVec[8].x = 4.0;
objVec[8].y = -0.5;
objVec[8].draw_type = gl.TRIANGLE_FAN;
//_____________________________________________


//----------------------Main--------------------------------
function main() 
{
  //Initialize shaders
  if(!initShaders(gl, VSHADER, FSHADER))
  {
    console.log('Error: Could not initialize shaders');
    return;
  }
  //------------------------------------------------

  //---------------Deal with key presses-----------
  document.onkeydown = checkKey;
  /*
   * Sets variables when user presses down arrow keys
   * 
   * @param {e} onkeydown event
   */
  function checkKey(e)
  {
    e = e || window.event;
    //Up arrow
    if(e.keyCode == '38')
    {
      up = 1;
    }
    //Left arrow
    else if(e.keyCode == '37')
    {
      left = 1;
    }
    //Right arrow
    else if(e.keyCode == '39')
    {
      right = 1;
    }
  }

  document.onkeyup = checkKey2;
  /**
   * Resets variables for key press when the user
   * stops pressing one of the arrow keys
   *
   * @param {e} onkeyup event
   */
  function checkKey2(e)
  {
    e = e || window.event;
    //Up arrow
    if(e.keyCode == '38')
    {
      up = 0;
    }
    //Left arrow
    else if(e.keyCode == '37')
    {
      left = 0;
    }
    //Right arrow
    else if(e.keyCode == '39')
    {
      right = 0;
    }
  }
  //-----------------------------------------------

  //----------------Invert Background--------------
  var invertButton = document.getElementById('button1');
  /**
   * Inverts the colors for all objects and the background
   */
  var invertColors = function()
  {
    //On invert, change shader program attributes and object variables
    if(invertBackground == 0)
    {
      gl.clearColor(0, 0, 0, 1);                
      invertBackground = 1;
      for(var i = 0; i < numObj; i++)
      {
        objVec[i].invert = 1.0;
        objVec[i].colorTransform = [0.0, 0.0, 0.0, 0.0];
      }
    }
    else
    {
      gl.clearColor(1, 1, 1, 1);
      invertBackground = 0;
      for(var i = 0; i < numObj; i++)
      {
        objVec[i].invert = -1.0;
        objVec[i].colorTransform = [1.0, 1.0, 1.0, 2.0];
      }
    }
    gl.clear(gl.COLOR_BUFFER_BIT);
    for(var i = 0; i < numObj; i++)
    {
      Draw(objVec[i]);
    }
  }
  invertButton.onclick = invertColors;
  //-----------------------------------------------

  //-------Initialize Shader Variables--------------
  Shader.u_TransformAddr = gl.getUniformLocation(gl.program, 'u_Transform');
  Shader.a_PositionAddr = gl.getAttribLocation(gl.program, 'a_Position');
  Shader.a_ColorAddr = gl.getAttribLocation(gl.program, 'a_Color');
  Shader.u_ColorTransformAddr = 
          gl.getUniformLocation(gl.program, 'u_ColorTransform');
  Shader.u_InvertAddr = gl.getUniformLocation(gl.program, 'u_Invert');
  Shader.u_PointSizeAddr = gl.getUniformLocation(gl.program, 'u_PointSize');

  if(Shader.u_TransformAddr < 0 || Shader.a_PositionAddr < 0 || 
     Shader.a_ColorAddr < 0 || Shader.u_ColorTransformAddr < 0 ||
     Shader.u_InvertAddr < 0 || Shader.u_PointSizeAddr < 0)
  {
    console.log('Error: Could not get storage location of shader variables');
    return;
  }
  //------------------------------------------------

  //Check to make sure buffers were created properly
  for(var i = 0; i < numObj; i++)
  {
    if(!objVec[i].vertexBuffer || !objVec[i].colorBuffer)
    {
        console.log('Error: Could not create the buffer');
        return -1;
    }
  }
  
  //Set the initial clear color and draw both objects
  gl.clearColor(0,0,0,1);
//***************Finished Initialization*************************

/**
 * Executes for each ingame tick  
 * Evaluates game state and draws to the screen
 */
  var tick = function()
  {
    //------Update score and check for win----------
    document.getElementById("score").innerHTML =
            ((objVec[2].x + 0.3) * 100).toPrecision(2);
    if((objVec[2].x + 0.3).toPrecision(2) == 1)
    {
      window.location.reload(); //reload game on win
    }

    //---------------Animate objects---------------
    animate();
    gl.clear(gl.COLOR_BUFFER_BIT);

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
  tick();
}

var last = Date.now();
/**
 * Updates all of the states needed for animation
 */
function animate()
{
  //objVec[] mapping:
  //0 -Hedge
  //1 -Ground
  //2 -Player
  //3 -Obstacle 1
  //4 -Obstacle 2
  //5 -Sun
  //6 -Sun Rays
  //7 -Cloud
  //8 -Flag

  //Deal with timing differences
  var current = Date.now();
  var elapsed = current - last;
  last = current;

  //Check for collision (lose condition)
  //For number of collision objects (3 and 4)
  for(var i = 3; i < 5; i++)
  {
    if((objVec[2].x - objVec[2].width/2) <=
       (objVec[i].x + objVec[i].width/2) &&
       (objVec[2].x + objVec[2].width/2) >=
       (objVec[i].x - objVec[i].width/2) &&
       (objVec[2].y - objVec[2].height/2) <=
       (objVec[i].y + objVec[i].height/2) &&
       (objVec[2].y + objVec[2].height/2) >=
       (objVec[i].y - objVec[i].height/2))
    {
      window.location.reload(); //reload game on lose
    }
  }

  //Due to the layering nature of the constant animation
  //we need to render every object every frame 
  for(var i = 0; i < numObj; i++)
  {
    objVec[i].draw_request = 1;
  }

  //Rotate the sun and sun ring
  objVec[5].rotation -= 1 * elapsed/10;
  objVec[5].rotation %= 360; //no need to go over 360
  objVec[6].rotation += 2 * elapsed/10;
  objVec[6].rotation %= 360;

  //Bounce the cloud and the hedge around
  if(bounce == 0)
  {
    objVec[0].y += 0.001 * elapsed/10;
    objVec[7].rotation += 0.25 * elapsed/10;
  }
  else
  {
    objVec[0].y -= 0.001 * elapsed/10;
    objVec[7].rotation -= 0.25 * elapsed/10;
  }
  if(objVec[7].rotation >= 8)
  {
    bounce = 1;
  }
  else if(objVec[7].rotation <= -8)
  {
    bounce = 0;
  }

  //---Move the Player left and right---
  //(can't use "elapsed" here as it messes with collision detection)
  if(right == 1)
  {
    objVec[2].x += 0.003;
    objVec[3].x -= 0.01;
    objVec[4].x -= 0.01;
    objVec[5].x -= 0.001;
    objVec[6].x -= 0.001;
    objVec[7].x -= 0.002;
    objVec[8].x -= 0.01;
  }
  else if(left == 1)
  {
    objVec[2].x -= 0.003;
    objVec[3].x += 0.01;
    objVec[4].x += 0.01;
    objVec[5].x += 0.001;
    objVec[6].x += 0.001;
    objVec[7].x += 0.002;
    objVec[8].x += 0.01;
  }

  if(up == 1 && jump == 0)
  {
    jump = 1;
    jump_dir = 1;
  }

  //---------Implement player jump----------
  if(jump_dir == 1 && objVec[2].y < 0.0)
  {
    objVec[2].y += 0.01;
  }
  else if(jump_dir == 1 && objVec[2].y >= 0.0)
  {
    jump_dir = 0;
  }
  else if(jump_dir == 0 && objVec[2].y > -0.4)
  {
    objVec[2].y -= 0.01;
  }
  else if(jump_dir == 0 && objVec[2].y == -0.4)
  {
    jump = 0;
  }

  //-----------Update every object---------
  for(var i = 0; i < numObj; i++)
  {
    //Translate object
    objVec[i].transform.setTranslate(objVec[i].x, objVec[i].y, objVec[i].z)

    //Every object starts at the center, so rotate it by the z axis
    objVec[i].transform.rotate(objVec[i].rotation,0,0,1);
  }
}

/**
 *  Rebinds buffers and draws on the screen
 *
 *  @param {drawObject}     object to draw
 */
function Draw(drawObject) 
{
  //Bind buffers with defined vertices
  bindVertexBuffer(drawObject);
  bindColorBuffer(drawObject);
  
  //-------------Draw to screen----------------------
  //Update shader variables
  gl.uniform1f(Shader.u_InvertAddr, drawObject.invert);
  gl.uniform1f(Shader.u_PointSizeAddr, drawObject.vertex_size);  
  gl.uniform4fv(Shader.u_ColorTransformAddr, drawObject.colorTransform); 
  gl.uniformMatrix4fv(Shader.u_TransformAddr, false, 
                      drawObject.transform.elements);

  //Check dropdown list for type and draw that particular type
  gl.drawArrays(drawObject.draw_type, 0, drawObject.size);

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
  gl.bindBuffer(gl.ARRAY_BUFFER, drawObject.vertexBuffer);

  //Only call bufferdata if the object's array changes
  if(drawObject.bufferChange == 1)
  {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(drawObject.vertices),
                  gl.STATIC_DRAW);
    drawObject.bufferChange = 0;
  }
  
  //Set the attribute pointer to the buffer
  //The size of the buffer is float hence the 4*
  gl.vertexAttribPointer(Shader.a_PositionAddr, 2, gl.FLOAT, false, 4*5, 0);
  //Enable attribute pointer for the buffer
  gl.enableVertexAttribArray(Shader.a_PositionAddr);

  return;
}

/**
 *  Binds a color buffer from the provided vertices
 *
 *  @param {drawObject}     object of buffer to bind         
 */
function bindColorBuffer(drawObject)
{
  //Bind buffer and fill it with vertices
  gl.bindBuffer(gl.ARRAY_BUFFER, drawObject.colorBuffer);

  //Only call bufferdata if the object's array changes
  if(drawObject.colorChange == 1)
  {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(drawObject.vertices),
                  gl.STATIC_DRAW);
    drawObject.colorChange = 0;
  }

  //Set the attribute pointer to the buffer
  //The size of the buffer is float hence the 4*
  gl.vertexAttribPointer(Shader.a_ColorAddr, 3, gl.FLOAT, false, 4*5, 4*2);
  //Enable attribute pointer for the buffer
  gl.enableVertexAttribArray(Shader.a_ColorAddr);

  return;
}

