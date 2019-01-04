/** 
 * Author: Brandon Smith
 * Filename: assignment4.js
 * Desc: WebGl animation game
 * Date: 10/16/2016
 * Reference: WebGL Programming Guide: Interactive 3D
 *            Graphics Programming with WebGL
 */
//---------Vertex shader program---------------
var VSHADER =
  'attribute vec4 a_Position;\n' +
  'attribute vec2 a_TexCoord;\n' +
  'varying vec2 v_TexCoord;\n' +
  'uniform mat4 u_Transform;\n' +
  'void main() {\n' +
  '  gl_Position = u_Transform * a_Position;\n' +
  '  v_TexCoord = a_TexCoord;\n' +
  '}\n';
//--------------------------------------------

//---------Fragment shader program------------
var FSHADER =
  'precision mediump float;\n' +
  'uniform sampler2D u_Sampler;\n' +
  'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
  '  gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' + 
  '}\n';
//-------------------------------------------

//**********************Initialization*************************
//Global variables
var bounce = 0;
var right = 0;
var up = 0;
var left = 0;
var jump = 0;
var jump_dir = 0;

//Get rendering context
var canvas = document.getElementById('webgl');
var gl = getWebGLContext(canvas);

if(!gl)
{
  console.log('Error: Could not get rendering context');
}

//--------------Shader Variables-------------
var Shader = 
{
  a_PositionAddr: 0,        //Position attribute in shader
  a_TexCoord: 0,
  u_TransformAddr: 0,       //Transform matrix in shader
  u_Sampler: 0,             //Sampler in shader
};

//-------------Create vector of objects-------------
var objVec = new Array();
var numObj = 9;
for(var i = 0; i < numObj; i++)
{
  objVec.push(
  {
    //Vertices form of [x1,y1, tx1, ty1,x2,y2...etc] (tx being texture)
    vertices: new Array(),  
    size:  4,         //number of vertices in array
    vertex_size: 1.0, //size of each vertex
    rotation: 0,      //number of degrees to rotate object
    x: 0,             //x coordinate of where to transform object to
    y: 0,             //y coordinate of where to transform object to
    z: 0,             //z coordinate of where to transform object to  
    width: 0,         //width of collision box
    height: 0,        //height of collision box
    draw_request: 1,  //flag for draw, 1:draw, 0: ignore
    bufferChange: 1,  //flag to update vertex buffer, 1: update, 0: ignore
    texture: 0,       //object's texture
    texture_unit: 0,  //object's texture unit (1 for background, 0 for mario)
    draw_type: gl.TRIANGLE_STRIP, //Draw type for object
    transform: new Matrix4,            
    vertexBuffer: new gl.createBuffer(),
    colorBuffer: new gl.createBuffer(),
  });
}
//-------------------------------------------------

//____________Define specific objects_____________
//Hedge
objVec[0].vertices = 
    [
     -5.0, 0.2, 0.5, 0.998,
     -5.0, -0.5, 0.5, 0.8672,
      5.0, 0.2, 1.875, 0.998,
      5.0, -0.5, 1.875, 0.8672,
    ];
objVec[0].texture_unit = 1;

//Ground
objVec[1].vertices = 
    [
      5.0, -0.5, 5.0, 0.234,
      5.0, -1.0, 5.0, 0.0,
     -4.0, -0.5, 0.0, 0.234, 
     -4.0, -1.0, 0.0, 0.0,
    ];
objVec[1].texture_unit = 1;

//Player
objVec[2].vertices = 
    [
      -0.05, -0.1, 0.0, 0.5, 
      -0.05, 0.1, 0.0, 0.995,
      0.05, -0.1, 0.25, 0.5, 
      0.05, 0.1, 0.25, 0.995, 
    ];
objVec[2].x = -0.3;
objVec[2].y = -0.4;
objVec[2].width = 0.1;
objVec[2].height = 0.2;
objVec[2].texture_unit = 0;

//Obstacle 1
objVec[3].size = 4;
objVec[3].vertices = 
    [
      -0.1, -0.1, 0.4375, 0.4375, 
      -0.1, 0.1, 0.4375, 0.49, 
      0.1, 0.1, 0.488, 0.49, 
      0.1, -0.1, 0.488, 0.4375, 
    ];
objVec[3].x = 0.3;
objVec[3].y = -0.4;
objVec[3].width = 0.2;
objVec[3].height = 0.2;
objVec[3].draw_type = gl.TRIANGLE_FAN
objVec[3].texture_unit = 1;

//Obstacle 2
objVec[4].vertices = 
    [
      -0.2, -0.1, 0.4375, 0.4375, 
      -0.2, 0.1, 0.4375, 0.49, 
      0.2, 0.1, 0.5385, 0.49,
      0.2, -0.1, 0.5385, 0.4375, 
    ];
objVec[4].x = 2.0;
objVec[4].y = -0.4;
objVec[4].width = 0.4;
objVec[4].height = 0.2;
objVec[4].draw_type = gl.TRIANGLE_FAN;
objVec[4].texture_unit = 1;

//Sun
objVec[5].size = 8;
objVec[5].vertices = 
    [
      -0.1, -0.1, 0.05, 0.0, 
      -0.14, 0, 0.9, 0.1,
      -0.1, 0.1, 0.05, 0.0, 
      0, 0.14, 0.9, 0.1,
      0.1, 0.1, 0.05, 0.0,
      0.14, 0, 0.9, 0.1,
      0.1, -0.1, 0.05, 0.0,
      0, -0.14, 0.9, 0.1,
    ];
objVec[5].x = 0.5; 
objVec[5].y = 0.5;
objVec[5].draw_type = gl.TRIANGLE_FAN;
objVec[5].texture_unit = 0;

//Sun Rays
objVec[6].size = 8;
objVec[6].vertices = 
    [
      -0.11, -0.11, 0.0, 0.0,
      -0.15, 0, 1.0, 0.1,
      -0.11, 0.11, 0.0, 0.0, 
      0, 0.15, 1.0, 0.1, 
      0.11, 0.11, 0.0, 0.0,
      0.15, 0, 1.0, 0.1,
      0.11, -0.11, 0.0, 0.0,
      0, -0.15, 1.0, 0.1,
    ];
objVec[6].x = 0.5; 
objVec[6].y = 0.5;
objVec[6].draw_type = gl.LINE_LOOP;
objVec[6].texture_unit = 0;

//Clouds
objVec[7].size = 4;
objVec[7].vertices = 
    [
      -0.3, 0.15, 0.1185, 0.861,
      -0.3, -0.15, 0.1185, 0.773, 
      0.3, -0.15, 0.363, 0.773,
      0.3, 0.15, 0.363, 0.861, 
    ];
objVec[7].draw_type = gl.TRIANGLE_FAN;
objVec[7].x = 0;
objVec[7].y = 0.4;
objVec[7].texture_unit = 1;

//Flag Pole
objVec[8].size = 4;
objVec[8].vertices = 
    [
      0.1, 1.0, 0.961, 0.997, 
      -0.1, 1.0, 0.877, 0.997, 
      -0.1, 0.0, 0.877, 0.348, 
      0.1, 0.0, 0.961, 0.348, 
    ];
objVec[8].x = 4.0;
objVec[8].y = -0.5;
objVec[8].draw_type = gl.TRIANGLE_FAN;
objVec[8].texture_unit = 1;
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

  //-------Initialize Shader Variables--------------
  Shader.u_TransformAddr = gl.getUniformLocation(gl.program, 'u_Transform');
  Shader.u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  Shader.a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
  Shader.a_PositionAddr = gl.getAttribLocation(gl.program, 'a_Position');
  if(Shader.u_TransformAddr < 0 || Shader.a_PositionAddr < 0 ||
     Shader.u_Sampler < 0 || Shader.a_TextCoord < 0)
  {
    console.log('Error: Could not get storage location of shader variables');
    return -1;
  }
  //------------------------------------------------

  //Check to make sure buffers were created properly
  for(var i = 0; i < numObj; i++)
  {
    if(!objVec[i].vertexBuffer)
    {
        console.log('Error: Could not create the buffer');
        return -1;
    }
  }
  
  //Set the initial clear color
  gl.clearColor(0.4,0.4,1,1);

  //Turn on blending so sprite sheet doesn't look bad
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);

  //--------------Initialize the textures----------
  for(var i = 0; i < numObj; i++)       //create textures for each object
  {
    objVec[i].texture = gl.createTexture();
    if(objVec[i].texture < 0)
    {
        console.log('Error: Could not create the texture');
        return -1;
    }
  }
  var i_background = new Image();
  var i_mario = new Image();
  if(i_background < 0 || i_mario < 0)
  {
    console.log('Error: Could not create image');
    return -1;
  }
  //Set up function to run on image load
  i_background.onload = function() {loadTexture(i_background, 1)};
  i_mario.onload = function() {loadTexture(i_mario, 0)};

  //Load images
  i_background.src = './background_sprites.png';
  i_mario.src = './mario_sprites.png';
  //------------------------------------------------

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
      window.alert("You win!");
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

/**
 * Loads in the textures for the game objects
 *
 *  @param {img}     image to use as the texture
 *  @param {img_num} corresponding number to the image
 *                   0 for mario, 1 for background
 */
function loadTexture(img, img_num)
{
  if(img_num == 0)                   //if first image loads
  {
    for(var i = 0; i < numObj; i++)  //initialize texture for img_num0 objects
    {
      if(objVec[i].texture_unit == img_num)
      {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);          //flip y
        gl.activeTexture(gl.TEXTURE0);                     
        gl.bindTexture(gl.TEXTURE_2D, objVec[i].texture);   //bind texture
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                      gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.uniform1i(Shader.u_Sampler, objVec[i].texture_unit);
      }
    }
  }
  else if(img_num == 1)              //if second image loads
  {
    for(var i = 0; i < numObj; i++)  //initialize texture for img_num1 objects
    {
      if(objVec[i].texture_unit == img_num)
      {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);    //flip y
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, objVec[i].texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                      gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.uniform1i(Shader.u_Sampler, objVec[i].texture_unit);
      }
    }
  }
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
      window.alert("You lose!");
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
    objVec[7].rotation += 0.25 * elapsed/10;
  }
  else
  {
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
    objVec[0].x -= 0.01;
    objVec[1].x -= 0.01;
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
    objVec[0].x += 0.01;
    objVec[1].x += 0.01;
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
  
  //-------------Draw to screen----------------------
  //Update shader variables
  gl.uniformMatrix4fv(Shader.u_TransformAddr, false, 
                      drawObject.transform.elements);
  gl.uniform1i(Shader.u_Sampler, drawObject.texture_unit);

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
  
  //Set the attribute pointer to the position buffer and enable
  gl.vertexAttribPointer(Shader.a_PositionAddr, 2, gl.FLOAT, false, 4*4, 0);
  gl.enableVertexAttribArray(Shader.a_PositionAddr);

  gl.vertexAttribPointer(Shader.a_TexCoord, 2, gl.FLOAT, false, 4*4, 4*2);
  gl.enableVertexAttribArray(Shader.a_TexCoord);

  return;
}


