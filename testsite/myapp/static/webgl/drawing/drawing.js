/** 
 * Author: Brandon Smith
 * Filename: assignment1.js
 * Desc: Demonstration of many Webgl aspects
 * Date: 9/5/2016
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

//-------------Diamond Object----------------
var Diamond = 
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
  transform: new Matrix4,            
  colorTransform: new Float32Array,  
};
//-------------------------------------------

//Initialize global variables for html buttons/fields 
var invert = 1.0;
var draw_type = document.getElementById('dropdown').value;
var vertex_size = 1.0;
var rotation = 0;

function main() 
{
  //-----------------Initialization------------------
  //Get rendering context
  var canvas = document.getElementById('webgl');
  var gl = getWebGLContext(canvas);
  if (!gl)
  {
    console.log('Error: Could not get rendering context');
    return;
  }
  //Initialize shaders
  if(!initShaders(gl, VSHADER, FSHADER))
  {
    console.log('Error: Could not initialize shaders');
    return;
  }
  //-------------------------------------------------

  //----------------Mouse Click---------------------
  canvas.onmousedown = 
    function(ev)
    {
      click(ev,gl,canvas);
    };
  //------------------------------------------------

  //---------------Size Input--------------------
  var sizeInput = document.getElementById('size_input');
  var sizeInputFunc = function()
  {
    vertex_size = sizeInput.value;
    Draw(gl);
  }
  sizeInput.onchange = sizeInputFunc;
  //------------------------------------------------

  //---------------Rotation Input--------------------
  var rotInput = document.getElementById('rot_input');
  var rotInputFunc = function()
  {
    rotation = rotInput.value;
    Draw(gl);
  }
  rotInput.onchange = rotInputFunc;
  //------------------------------------------------
  
  //----------------Drop Down Menu Selection--------
  var typeSelection = document.getElementById('dropdown');
  var typeSwitch = function()
  {
    draw_type = typeSelection.value;
    Draw(gl);
  }
  typeSelection.onchange = typeSwitch;
  //-----------------------------------------------
  
  //---------------Invert Colors Button------------
  var invertButton = document.getElementById('button1');
  var invertColors = function()
  {
    //On invert, change shader program attributes
    if(invert == -1.0)
    {
      invert = 1.0;
      Diamond.colorTransform = [0.0, 0.0, 0.0, 0.0];
      gl.clearColor(0, 0, 0, 1);                
    }
    else
    {
      invert = -1.0;
      Diamond.colorTransform = [1.0, 1.0, 1.0, 2.0];
      gl.clearColor(1, 1, 1, 1);
    }
    Draw(gl);
  }
  invertButton.onclick = invertColors;
  //------------------------------------------------

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

  //Initialize color Transform
  Diamond.colorTransform = [0.0, 0.0, 0.0, 0.0];

  //Set the initial clear color and draw
  gl.clearColor(0,0,0,1);
  Draw(gl);
}

/**
 *  Rebinds buffers and draws on the screen
 *
 *  @param {gl} rendering context for Webgl
 */
function Draw(gl) 
{
  //-------------Draw to screen----------------------
  //Create buffers with defined vertices
  if(createVertexBuffer(gl, Diamond) < 0) 
  {
    console.log('Error: Could not create vertex buffer');
    return;
  }
  if(createColorBuffer(gl, Diamond) < 0)
  {
    console.log('Error: Could not create color buffer');
    return;
  }

  //Clear screen 
  gl.clear(gl.COLOR_BUFFER_BIT);

  //Set up coordinate rotation
  Diamond.transform.setRotate(rotation,0,0,1);

  //Update shader variables
  gl.uniform1f(Shader.u_InvertAddr, invert);
  gl.uniform1f(Shader.u_PointSizeAddr, vertex_size);  
  gl.uniform4fv(Shader.u_ColorTransformAddr, Diamond.colorTransform); 
  gl.uniformMatrix4fv(Shader.u_TransformAddr, false, 
                      Diamond.transform.elements);

  //Check dropdown list for type and draw that particular type
  if(draw_type == 0)
    gl.drawArrays(gl.POINTS,0, Diamond.size);
  else if(draw_type == 1)
    gl.drawArrays(gl.LINE_STRIP,0, Diamond.size);
  else if(draw_type == 2)
    gl.drawArrays(gl.LINE_LOOP,0, Diamond.size);
  else if(draw_type == 3)
    gl.drawArrays(gl.LINES,0, Diamond.size);
  else if(draw_type == 4)
    gl.drawArrays(gl.TRIANGLE_STRIP,0, Diamond.size);
  else if(draw_type == 5)
    gl.drawArrays(gl.TRIANGLE_FAN,0, Diamond.size);
  else
    gl.drawArrays(gl.TRIANGLES,0, Diamond.size);
  //-------------------------------------------------
}

/**
 *  Creates a draw buffer from the provided vertices
 *
 *  @param {gl}         rendering context
 *         {vertices}   a float array of x,y,r,g,b values
 *                      ex: [x1,y1,r1,g1,b1,x2,x3....etc]
 *
 *  @return -1 on error, 0 on success
 */
function createVertexBuffer(gl, drawObject)
{
  //Create the vertex buffer
  var vertexBuffer = gl.createBuffer();
  if(!vertexBuffer)
  {
    console.log('Error: Could not create the buffer');
    return -1;
  }

  //Bind buffer and fill it with vertices
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(drawObject.vertices), 
                gl.STATIC_DRAW);

  //Set the attribute pointer to the buffer
  //The size of the buffer is float hence the 4*
  gl.vertexAttribPointer(Shader.a_PositionAddr, 2, gl.FLOAT, false, 4*5, 0);
  //Enable attribute pointer for the buffer
  gl.enableVertexAttribArray(Shader.a_PositionAddr);

  return 0;
}

/**
 *  Creates a color buffer from the provided vertices
 *
 *  @param {gl}         rendering context
 *         {vertices}   a float of x,y,r,g,b values
 *                      ex: [x1,y1,r1,g1,b1,x2,x3....etc]
 *
 *  @return -1 on error, 0 on success
 */
function createColorBuffer(gl, drawObject)
{
  //Create the color buffer
  var colorBuffer = gl.createBuffer();
  if(!colorBuffer)
  {
    console.log('Error: Could not create the buffer');
    return -1;
  }

  //Bind buffer and fill it with vertices
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(drawObject.vertices),
                gl.STATIC_DRAW);

  //Set the attribute pointer to the buffer
  //The size of the buffer is float hence the 4*
  gl.vertexAttribPointer(Shader.a_ColorAddr, 3, gl.FLOAT, false, 4*5, 4*2);
  //Enable attribute pointer for the buffer
  gl.enableVertexAttribArray(Shader.a_ColorAddr);

  return 0;
}

/**
 * Executes on Mouse Press and adds points to Diamond object
 *
 * @param {ev} event handle
 *        {gl} rendering context
 *        {canvas} canvas to render on
 */
function click(ev, gl, canvas)
{
  var x_pos = ev.clientX;
  var y_pos = ev.clientY;
  var rect_pos = ev.target.getBoundingClientRect();

  //Calculate browser canvas transformed coordinates
  x_pos = ((x_pos - rect_pos.left) - canvas.width/2)/(canvas.width/2);
  y_pos = (canvas.height/2 - (y_pos - rect_pos.top))/(canvas.height/2);

  //Push set of coordinates onto Diamond's vertex list and add in random colors
  Diamond.vertices.push(x_pos);
  Diamond.vertices.push(y_pos);
  Diamond.vertices.push(Math.random());
  Diamond.vertices.push(Math.random());
  Diamond.vertices.push(Math.random());
  Diamond.size = Diamond.size + 1;

  Draw(gl);
}
