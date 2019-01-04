/** 
 * Author: Brandon Smith
 * Filename: assignment2.js
 * Desc: Demonstration of many Webgl aspects
 * Date: 9/18/2016
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
  '  gl_Position = a_Position * u_Transform;\n' +
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

//Global var for inverting background color
var invertBackground = 1;

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

//-------------Object1----------------------
var Object1 = 
{
  //Vertices form of [x1,y1,r1,g1,b1,x2,y2...etc]
  vertices:  
  [
    -0.2, 0.2, 0.0, 1.0, 0.0, 
    -0.2, -0.2, 1.0, 0.0, 0.0, 
    0.2, 0.2, 1.0, 1.0, 0.0, 
    0.2, -0.2, 1.0, 0.0, 1.0,
  ],
  size:  4, 
  invert: 1.0,
  vertex_size: 1.0,
  rotation: 0,
  draw_type: document.getElementById('dropdown1').value,
  transform: new Matrix4,            
  colorTransform: new Float32Array,  
  vertexBuffer: new gl.createBuffer(),
  colorBuffer: new gl.createBuffer(),
};
//-------------------------------------------

//-----------Object2-------------------------
var Object2 = 
{
  //Vertices form of [x1,y1,r1,g1,b1,x2,y2...etc]
  vertices:  
  [
    -0.7, 0.8, 0.0, 0.0, 1.0, 
    -0.7, 0.6, 0.0, 1.0, 0.0, 
    -0.5, 0.8, 1.0, 0.0, 0.0, 
    -0.5, 0.6, 0.0, 1.0, 1.0,
  ],
  size:  4,
  invert: 1.0,
  vertex_size: 1.0,
  rotation: 0,
  draw_type: document.getElementById('dropdown2').value,
  transform: new Matrix4,            
  colorTransform: new Float32Array,  
  vertexBuffer: new gl.createBuffer(),
  colorBuffer: new gl.createBuffer(),
};
//-----------------------------------------
  
//----------------------Main--------------------------------
function main() 
{
  //-----------------Initialization------------------
  //Initialize shaders
  if(!initShaders(gl, VSHADER, FSHADER))
  {
    console.log('Error: Could not initialize shaders');
    return;
  }
  //------------------------------------------------

  //------Prevent right clicking the canvas---------
  canvas.addEventListener('contextmenu', function(e)
  {
     if(e.button == 2)
     {
       e.preventDefault();
       return false;
     }
  }, false);
  //------------------------------------------------

  //----------------Mouse Click---------------------
  canvas.onmousedown = 
    function(ev)
    {
      if(ev.button == 2)  //Right mouse click
      {
        click(ev, Object2);
      }
      else                //Left mouse click
      {
        click(ev, Object1);
      }
      gl.clear(gl.COLOR_BUFFER_BIT);
      Draw(Object1);
      Draw(Object2);
    };
  //------------------------------------------------

  //---------------Size Input1--------------------
  var sizeInput1 = document.getElementById('size_input1');
  var sizeInputFunc1 = function()
  {
    Object1.vertex_size = sizeInput1.value;
    gl.clear(gl.COLOR_BUFFER_BIT);
    Draw(Object1);
    Draw(Object2);
  }
  sizeInput1.onchange = sizeInputFunc1;
  //------------------------------------------------
  
  //---------------Size Input2--------------------
  var sizeInput2 = document.getElementById('size_input2');
  var sizeInputFunc2 = function()
  {
    Object2.vertex_size = sizeInput2.value;
    gl.clear(gl.COLOR_BUFFER_BIT);
    Draw(Object1);
    Draw(Object2);
  }
  sizeInput2.onchange = sizeInputFunc2;
  //------------------------------------------------

  //---------------Rotation Input1--------------------
  var rotInput1 = document.getElementById('rot_input1');
  var rotInputFunc1 = function()
  {
    Object1.rotation = rotInput1.value;
    gl.clear(gl.COLOR_BUFFER_BIT);
    Draw(Object1);
    Draw(Object2);
  }
  rotInput1.onchange = rotInputFunc1;
  //------------------------------------------------
  
  //---------------Rotation Input2--------------------
  var rotInput2 = document.getElementById('rot_input2');
  var rotInputFunc2 = function()
  {
    Object2.rotation = rotInput2.value;
    gl.clear(gl.COLOR_BUFFER_BIT);
    Draw(Object1);
    Draw(Object2);
  }
  rotInput2.onchange = rotInputFunc2;
  //------------------------------------------------
  
  //--------------Drop Down Menu Selection 1--------
  var typeSelection1 = document.getElementById('dropdown1');
  var typeSwitch1 = function()
  {
    Object1.draw_type = typeSelection1.value;
    gl.clear(gl.COLOR_BUFFER_BIT);
    Draw(Object1);
    Draw(Object2);
  }
  typeSelection1.onchange = typeSwitch1;
  //-----------------------------------------------
  
  //--------------Drop Down Menu Selection 2--------
  var typeSelection2 = document.getElementById('dropdown2');
  var typeSwitch2 = function()
  {
    Object2.draw_type = typeSelection2.value;
    gl.clear(gl.COLOR_BUFFER_BIT);
    Draw(Object1);
    Draw(Object2);
  }
  typeSelection2.onchange = typeSwitch2;
  //-----------------------------------------------
  
  //---------------Invert Object 1------------
  var invertButton1 = document.getElementById('button1');
  var invertColors1 = function()
  {
    //On invert, change shader program attributes
    if(Object1.invert == -1.0)
    {
      Object1.invert = 1.0;
      Object1.colorTransform = [0.0, 0.0, 0.0, 0.0];
    }
    else
    {
      Object1.invert = -1.0;
      Object1.colorTransform = [1.0, 1.0, 1.0, 2.0];
    }
    gl.clear(gl.COLOR_BUFFER_BIT);
    Draw(Object1);
    Draw(Object2);
  }
  invertButton1.onclick = invertColors1;
  //------------------------------------------------
  
  //-----------------Invert Object 2---------------
  var invertButton2 = document.getElementById('button2');
  var invertColors2 = function()
  {
    //On invert, change shader program attributes
    if(Object2.invert == -1.0)
    {
      Object2.invert = 1.0;
      Object2.colorTransform = [0.0, 0.0, 0.0, 0.0];
    }
    else
    {
      Object2.invert = -1.0;
      Object2.colorTransform = [1.0, 1.0, 1.0, 2.0];
    }
    gl.clear(gl.COLOR_BUFFER_BIT);
    Draw(Object1);
    Draw(Object2);
  }
  invertButton2.onclick = invertColors2;
  //-----------------------------------------------

  //----------------Invert Background--------------
  var invertButton3 = document.getElementById('button3');
  var invertColors3 = function()
  {
    //On invert, change shader program attributes
    if(invertBackground == 0)
    {
      gl.clearColor(0, 0, 0, 1);                
      invertBackground = 1;
    }
    else
    {
      gl.clearColor(1, 1, 1, 1);
      invertBackground = 0;
    }
    gl.clear(gl.COLOR_BUFFER_BIT);
    Draw(Object1);
    Draw(Object2);
  }
  invertButton3.onclick = invertColors3;
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
  if(!Object1.vertexBuffer)
  {
    console.log('Error: Could not create the buffer');
    return -1;
  }
  if(!Object1.colorBuffer)
  {
    console.log('Error: Could not create the buffer');
    return -1;
  }
  //Check to make sure buffers were created properly
  if(!Object2.vertexBuffer)
  {
    console.log('Error: Could not create the buffer');
    return -1;
  }
  if(!Object2.colorBuffer)
  {
    console.log('Error: Could not create the buffer');
    return -1;
  }

  //Initialize color Transform
  Object1.colorTransform = [0.0, 0.0, 0.0, 0.0];
  Object2.colorTransform = [0.0, 0.0, 0.0, 0.0];

  //Set the initial clear color and draw both objects
  gl.clearColor(0,0,0,1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  Draw(Object1);
  Draw(Object2);
}

/**
 *  Rebinds buffers and draws on the screen
 *
 *  @param {drawObject} object to draw
 */
function Draw(drawObject) 
{
  //Bind buffers with defined vertices
  bindVertexBuffer(drawObject);
  bindColorBuffer(drawObject);
  
  //-------------Draw to screen----------------------
  //Set up coordinate rotation
  drawObject.transform.setRotate(drawObject.rotation,0,0,1);

  //Update shader variables
  gl.uniform1f(Shader.u_InvertAddr, drawObject.invert);
  gl.uniform1f(Shader.u_PointSizeAddr, drawObject.vertex_size);  
  gl.uniform4fv(Shader.u_ColorTransformAddr, drawObject.colorTransform); 
  gl.uniformMatrix4fv(Shader.u_TransformAddr, false, 
                      drawObject.transform.elements);

  //Check dropdown list for type and draw that particular type
  if(drawObject.draw_type == 0)
    gl.drawArrays(gl.POINTS,0, drawObject.size);
  else if(drawObject.draw_type == 1)
    gl.drawArrays(gl.LINE_STRIP,0, drawObject.size);
  else if(drawObject.draw_type == 2)
    gl.drawArrays(gl.LINE_LOOP,0, drawObject.size);
  else if(drawObject.draw_type == 3)
    gl.drawArrays(gl.LINES,0, drawObject.size);
  else if(drawObject.draw_type == 4)
    gl.drawArrays(gl.TRIANGLE_STRIP,0, drawObject.size);
  else if(drawObject.draw_type == 5)
    gl.drawArrays(gl.TRIANGLE_FAN,0, drawObject.size);
  else
    gl.drawArrays(gl.TRIANGLES,0, drawObject.size);
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
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(drawObject.vertices), 
                gl.STATIC_DRAW);

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
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(drawObject.vertices),
                gl.STATIC_DRAW);

  //Set the attribute pointer to the buffer
  //The size of the buffer is float hence the 4*
  gl.vertexAttribPointer(Shader.a_ColorAddr, 3, gl.FLOAT, false, 4*5, 4*2);
  //Enable attribute pointer for the buffer
  gl.enableVertexAttribArray(Shader.a_ColorAddr);

  return;
}

/**
 * Executes on Mouse Press and adds points to object
 *
 * @param {ev} event handle
 *        {drawObject} object to add points to
 */
function click(ev, drawObject)
{
  var x_pos = ev.clientX;
  var y_pos = ev.clientY;
  var rect_pos = ev.target.getBoundingClientRect();

  //Calculate browser canvas transformed coordinates
  x_pos = ((x_pos - rect_pos.left) - canvas.width/2)/(canvas.width/2);
  y_pos = (canvas.height/2 - (y_pos - rect_pos.top))/(canvas.height/2);

  //Push set of coordinates onto objects's vertex list and add in random colors
  drawObject.vertices.push(x_pos);
  drawObject.vertices.push(y_pos);
  drawObject.vertices.push(Math.random());
  drawObject.vertices.push(Math.random());
  drawObject.vertices.push(Math.random());
  drawObject.size = drawObject.size + 1;
}
