/** 
 * Author: Brandon Smith
 * Filename: assignment6.js
 * Desc: WebGl 3D environment 
 * Date: 12/13/2016
 * Reference: WebGL Programming Guide: Interactive 3D
 *            Graphics Programming with WebGL
 *            Learningwebgl.com/blog/?p=1253 for sphere generation
 */

//----------------------Main--------------------------------
function main() 
{
  //Check to make sure buffers were created correctly
  for(var i = 0; i < Primitives.length; i++)
  {
    if(!Primitives[i].modelBuffer || !Primitives[i].indexBuffer ||
       !Primitives[i].colorBuffer || !Primitives[i].texBuffer)
    {
      console.log('Error: Could not create a buffer');
      return;
    }
  }

  //-------Initialize Shader Variables--------------
  //Non-textured Program
  program.u_TransformAddr = gl.getUniformLocation(program,'u_Transform');
  program.u_ViewMatrix = gl.getUniformLocation(program,'u_ViewMatrix');
  program.u_ProjMatrix = gl.getUniformLocation(program,'u_ProjMatrix');
  program.a_PositionAddr = gl.getAttribLocation(program,'a_Position');
  program.a_ColorAddr = gl.getAttribLocation(program,'a_Color');

  //Lighting for non-textured
  program.a_Normal = gl.getAttribLocation(program, 'a_Normal');
  program.u_NormalMatrix = gl.getUniformLocation(program, 'u_NormalMatrix');
  program.u_LightPosition1 = gl.getUniformLocation(program, 'u_LightPosition1');
  program.u_LightPosition2 = gl.getUniformLocation(program, 'u_LightPosition2');
  program.u_PointLight1 = gl.getUniformLocation(program, 'u_PointLight1');
  program.u_PointLight2 = gl.getUniformLocation(program, 'u_PointLight2');
  program.u_LightColorD = gl.getUniformLocation(program, 'u_LightColorD');
  program.u_LightColorP1 = gl.getUniformLocation(program, 'u_LightColorP1');
  program.u_LightColorP2 = gl.getUniformLocation(program, 'u_LightColorP2');
  program.u_Dir = gl.getUniformLocation(program, 'u_Dir');
  program.u_LightDirection = gl.getUniformLocation(program, 'u_LightDirection');
  program.u_AmbientLight = gl.getUniformLocation(program, 'u_AmbientLight');

  //Fog for non-textured
  program.u_Fog = gl.getUniformLocation(program, 'u_Fog');
  program.u_Eye = gl.getUniformLocation(program, 'u_Eye');
  program.u_FogColor = gl.getUniformLocation(program, 'u_FogColor');
  program.u_FogDist = gl.getUniformLocation(program, 'u_FogDist');

  //Texture Program
  program_tex.u_TransformAddr = gl.getUniformLocation
                                (program_tex,'u_Transform');
  program_tex.u_ViewMatrix = gl.getUniformLocation(program_tex,'u_ViewMatrix');
  program_tex.u_ProjMatrix = gl.getUniformLocation(program_tex,'u_ProjMatrix');
  program_tex.u_Sampler = gl.getUniformLocation(program_tex,'u_Sampler');
  program_tex.a_TexCoord = gl.getAttribLocation(program_tex,'a_TexCoord');
  program_tex.a_PositionAddr = gl.getAttribLocation(program_tex,'a_Position');

  //Fog for textured
  program_tex.u_Fog = gl.getUniformLocation(program_tex, 'u_Fog');
  program_tex.u_Eye = gl.getUniformLocation(program_tex, 'u_Eye');
  program_tex.u_FogColor = gl.getUniformLocation(program_tex, 'u_FogColor');
  program_tex.u_FogDist = gl.getUniformLocation(program_tex, 'u_FogDist');

  //Check locations
  if(program.u_TransformAddr < 0 || program.a_PositionAddr < 0 ||
     program.a_ColorAddr < 0 || !program.u_ProjMatrix || 
     !program.u_ViewMatrix || !program_tex.u_TransformAddr ||
     program_tex.a_PositionAddr < 0 || !program_tex.u_ProjMatrix ||
     !program_tex.u_ViewMatrix || !program_tex.u_Sampler ||
     program_tex.a_TextCoord < 0 || !program.u_NormalMatrix ||
     !program.u_LightDirection || !program.u_AmbientLight ||
     !program.u_LightColorD || !program.u_LightColorP1 ||
     program.a_Normal < 0 || !program.u_LightPosition1 ||
     !program.u_PointLight1 || !program.u_PointLight2 ||
     !program.u_LightPosition2 || !program.u_LightColorP2 ||
     !program.u_Fog || !program.u_Eye || !program.u_FogColor ||
     !program.u_FogDist || !program_tex.u_Fog || !program_tex.u_Eye ||
     !program_tex.u_FogColor || !program_tex.u_FogDist || !program.u_Dir)
  {
    console.log('Error: Could not get storage location of shader variables');
    return -1;
  }
  //------------------------------------------------

  //Set the initial clear color
  gl.clearColor(0.1,0.7,0.9,1);
  gl.enable(gl.DEPTH_TEST);

  //==============Initialize Lighting==============
  gl.useProgram(program);  //Switch to non-textured program to set up lights  

  //-----Set directional light-----
  var lightDirection = new Vector3([1.0, 1.0, 1.0]);  //set light direction
  gl.uniform3f(program.u_LightColorD, 1.0, 1.0, 1.0); //set white light
  lightDirection.normalize();                         // Normalize
  gl.uniform3fv(program.u_LightDirection, lightDirection.elements);

  //-----Set Ambient Light-----
  gl.uniform3f(program.u_AmbientLight, 0.2, 0.2, 0.2);

  //-----Set Point light 1-----
  gl.uniform3f(program.u_LightColorP1, 0.0, 0.0, 1.0); //set blue light
  gl.uniform3f(program.u_LightPosition1, objVec[1].x, objVec[1].y, objVec[1].z);
  gl.uniform1f(program.u_PointLight1, 1.0); //start with light on

  //-----Set Point light 2-----
  gl.uniform3f(program.u_LightColorP2, 1.0, 0.0, 0.0); //set red light
  gl.uniform3f(program.u_LightPosition2, objVec[2].x, objVec[2].y, objVec[2].z);
  gl.uniform1f(program.u_PointLight2, 1.0); //start with light on
  
  //==============Initialize Fog==================
  var fogColor = new Float32Array([0.6, 0.7, 0.8]); //Fog color

  //Non-Textured fog
  gl.uniform3fv(program.u_FogColor, fogColor);
  gl.uniform1f(program.u_Fog, 1.0);
  gl.uniform2fv(program.u_FogDist, new Float32Array([0, 30]));
  gl.uniform4fv(program.u_Eye, 
                new Float32Array([camera.x, camera.y, camera.z, 1.0]));

  //Textured fog
  gl.useProgram(program_tex);  //Switch to textured program to set up fog 
  gl.uniform3fv(program_tex.u_FogColor, fogColor);
  gl.uniform1f(program_tex.u_Fog, 1.0);
  gl.uniform2fv(program_tex.u_FogDist, new Float32Array([8, 400]));
  gl.uniform4fv(program_tex.u_Eye, 
                new Float32Array([camera.x, camera.y, camera.z, 1.0]));
  gl.useProgram(program);     //Switch back

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
  if(keys.w_key == 1) //Move lights forward
  {
    objVec[1].z -= 0.1;
    objVec[2].z -= 0.1;
  }
  if(keys.s_key == 1) //Move lights backwards
  {
    objVec[1].z += 0.1;
    objVec[2].z += 0.1;
  }
  if(keys.a_key == 1) //Move lights right
  {
    objVec[1].x -= 0.1;
    objVec[2].x -= 0.1;
  }
  if(keys.d_key == 1) //Move lights left
  {
    objVec[1].x += 0.1;
    objVec[2].x += 0.1;
  }
  if(keys.f_key == 1) //Toggle Fog
  {
    gl.clearColor(0.6,0.7,0.8,1); //Set background to fog color

    gl.useProgram(program);  //Switch to textured program to set up fog 
    gl.uniform1f(program.u_Fog, 1.0);

    gl.useProgram(program_tex);  //Switch to textured program to set up fog 
    gl.uniform1f(program_tex.u_Fog, 1.0);
  }
  else
  {
    gl.clearColor(0.1,0.7,0.9,1); //Set background to sky color

    gl.useProgram(program); //Switch to non-textured program to set up fog
    gl.uniform1f(program.u_Fog, 0.0);

    gl.useProgram(program_tex); //Switch to textured program to set up fog 
    gl.uniform1f(program_tex.u_Fog, 0.0);
  }
  if(keys.g_key == 1)
  {
    gl.useProgram(program);
    gl.uniform1f(program.u_Dir, 1.0);
  }
  else
  {
    gl.useProgram(program);
    gl.uniform1f(program.u_Dir, 0.0);
  }
  if(keys.one_key == 1)
  {
    gl.useProgram(program); 
    gl.uniform1f(program.u_PointLight1, 1.0); //turn light on
  }
  else
  {
    gl.useProgram(program);
    gl.uniform1f(program.u_PointLight1, 0.0); //turn light on
  }
  if(keys.two_key == 1)
  {
    gl.useProgram(program);
    gl.uniform1f(program.u_PointLight2, 1.0); //turn light on
  }
  else
  {
    gl.useProgram(program); 
    gl.uniform1f(program.u_PointLight2, 0.0); //turn light on
  }

  //Move Camera
  camera.at_z = camera.z - Math.cos(camera.yaw * Math.PI/180)/5;
  camera.at_x = camera.x + Math.sin(camera.yaw * Math.PI/180)/5;

  //Switch to non-texture program and move lightsources
  gl.useProgram(program); 
  gl.uniform3f(program.u_LightPosition1, objVec[1].x, objVec[1].y, objVec[1].z);
  gl.uniform3f(program.u_LightPosition2, objVec[2].x, objVec[2].y, objVec[2].z);

  //Update fog
  gl.uniform4fv(program.u_Eye,
                new Float32Array([camera.x, camera.y, camera.z, 1.0]));
  gl.uniform2fv(program.u_FogDist, new Float32Array([0, 30]));

  //Switch to textured program and update textured fog
  gl.useProgram(program_tex);  
  gl.uniform4fv(program_tex.u_Eye,
                new Float32Array([camera.x, camera.y, camera.z, 1.0]));
  gl.uniform2fv(program_tex.u_FogDist, new Float32Array([8, 400]));

  for(var i = 18; i < 22; i++)
  {
    objVec[i].rotation_y = (objVec[i].rotation_y + 1) % 360;
  }

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

    //Calculate normals 
    objVec[i].normalMatrix.setInverseOf(objVec[i].transform);
    objVec[i].normalMatrix.transpose();
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
    gl.useProgram(program);    
    gl.uniformMatrix4fv(program.u_TransformAddr, false,
                        drawObject.transform.elements);
    gl.uniformMatrix4fv(program.u_ViewMatrix, false, viewMatrix.elements);
    gl.uniformMatrix4fv(program.u_ProjMatrix, false, projMatrix.elements);
    gl.uniformMatrix4fv(program.u_NormalMatrix, false,
                        drawObject.normalMatrix.elements);
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

  //Draw object
  gl.drawElements(drawObject.draw_type,
                  Primitives[drawObject.p].indices.length,
                  gl.UNSIGNED_SHORT, 0);
}

/**
 *  Binds a draw buffer from the provided vertices
 *
 *  @param {drawObject}     object of buffer to bind        
 */
function bindVertexBuffer(drawObject)
{
  //Bind buffer and fill it with vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Primitives[drawObject.p].indexBuffer);

  //Only call bufferdata if the object's array changes
  if(drawObject.bufferChange == 1)
  {
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, 
                  new Uint16Array(Primitives[drawObject.p].indices),
                  gl.STATIC_DRAW);
    drawObject.bufferChange = 0;
  }

  if(drawObject.textured == 0) //Non-textured shaders
  {
    //Set the attribute pointer to the position buffer and enable
    gl.bindBuffer(gl.ARRAY_BUFFER, Primitives[drawObject.p].modelBuffer);
    gl.vertexAttribPointer(program.a_PositionAddr, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.a_PositionAddr);

    //Set the attribute pointer to the color buffer and enable
    gl.bindBuffer(gl.ARRAY_BUFFER, Primitives[drawObject.p].colorBuffer);
    gl.vertexAttribPointer(program.a_ColorAddr, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.a_ColorAddr);

    //Set the attribute pointer to the normals buffer and enable
    gl.bindBuffer(gl.ARRAY_BUFFER, Primitives[drawObject.p].normalBuffer);
    gl.vertexAttribPointer(program.a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.a_Normal);
  }
  else                         //Textured shaders
  {
    //Set the attribute pointer to the position buffer and enable
    gl.bindBuffer(gl.ARRAY_BUFFER, Primitives[drawObject.p].modelBuffer);
    gl.vertexAttribPointer(program_tex.a_PositionAddr,
                           3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program_tex.a_PositionAddr);

    //Set the attribute pointer to the texture buffer and enable
    gl.bindBuffer(gl.ARRAY_BUFFER, Primitives[drawObject.p].texBuffer);
    gl.vertexAttribPointer(program_tex.a_TexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program_tex.a_TexCoord);
  }
  return;
}


