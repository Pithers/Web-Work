/** 
 * Author: Brandon Smith
 * Filename: shaders.js
 * Desc: Shaders for WebGL program
 * Date: 12/13/2016
 * Reference: WebGL Programming Guide: Interactive 3D
 *            Graphics Programming with WebGL
 */

//---------Vertex shader program---------------
var VSHADER =
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Normal;\n' +

  //Matrices
  'uniform mat4 u_Transform;\n' +
  'uniform mat4 u_ProjMatrix;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +

  //Varyings
  'varying vec4 v_Color;\n' +
  'varying vec3 v_Position;\n' +
  'varying vec3 v_Normal;\n' +

  'void main() {\n' +
     //------------------Directional Light-------------
  '  gl_Position = u_ProjMatrix * u_ViewMatrix * u_Transform * a_Position;\n' +
  '  v_Position = vec3(u_Transform * a_Position);\n' +
  '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  '  v_Color = a_Color;\n' +
  '}\n';
//--------------------------------------------

//---------Fragment shader program------------
var FSHADER =
  'precision mediump float;\n' +

  //Varyings
  'varying vec4 v_Color;\n' +
  'varying vec3 v_Position;\n' +
  'varying vec3 v_Normal;\n' +

  //Fog
  'uniform vec3 u_FogColor;\n' +
  'uniform vec2 u_FogDist;\n' +      
  'uniform float u_Fog;\n' +          //Toggles Fog
  'uniform vec4 u_Eye;\n' +           //xyz of camera

  //Point lights
  'uniform vec3 u_LightPosition1;\n' + //xyz of light1
  'uniform vec3 u_LightPosition2;\n' + //xyz of light2
  'uniform vec3 u_LightColorP1;\n' +   //color of light1
  'uniform vec3 u_LightColorP2;\n' +   //color of light2
  'uniform float u_PointLight1;\n' + //Toggles point light 1
  'uniform float u_PointLight2;\n' + //Toggled point light 2

  //Lighting
  'uniform float u_Dir;\n' +         //Turns off directional light
  'uniform vec3 u_LightColorD;\n' +  //Directional light color
  'uniform vec3 u_LightDirection;\n' + //light direction
  'uniform vec3 u_AmbientLight;\n' +   

  'void main() {\n' +
     //Recalculate the normal based on the model matrix and make its length 1.
  '  vec3 normal = normalize(v_Normal);\n' +
     //Calculate the light direction and make it 1.0 in length
  '  float nDotL0 = max(dot(u_LightDirection, normal), 0.0);\n' +
     //Calculate the color due to diffuse reflection
  '  vec3 diffuse0 = u_LightColorD * v_Color.rgb * nDotL0;\n' +

     //--------------------Point Lights-----------------
     //Calculate the light direction and make it 1.0 in length
  '  vec3 lightDirection1 = normalize(u_LightPosition1 - v_Position);\n' +
  '  vec3 lightDirection2 = normalize(u_LightPosition2 - v_Position);\n' +
     //Calculate the dot product of the light direction
     //and the orientation of a surface (the normal)
  '  float nDotL1 = max(dot(lightDirection1, normal), 0.0);\n' +
  '  float nDotL2 = max(dot(lightDirection2, normal), 0.0);\n' +
     //Calculate the color due to diffuse reflection
  '  vec3 diffuse1 = u_LightColorP1 * v_Color.rgb * nDotL1 * u_PointLight1;\n' +
  '  vec3 diffuse2 = u_LightColorP2 * v_Color.rgb * nDotL2 * u_PointLight2;\n' +

     //Calculate the color due to ambient reflection
  '  vec3 ambient = u_AmbientLight * v_Color.rgb;\n' +
     //Add the surface colors due to diffuse reflection and ambient reflection.
  '  vec4 lighting = vec4(diffuse0 * u_Dir + diffuse1 +' +
                         'diffuse2 + ambient, v_Color.a);\n' + 

     //Get distance for fog
  '  float dist = distance(v_Position, vec3(u_Eye));\n' + 
     //Calculation of fog factor
  '  float fogFactor = clamp((u_FogDist.y - dist * u_Fog)/' +
                            '(u_FogDist.y - u_FogDist.x), 0.0, 1.0);\n' +
     //Stronger fog as it gets further
  '  vec3 color = mix(u_FogColor, vec3(lighting), fogFactor);\n' +
  '  gl_FragColor = vec4(color, v_Color.a);\n' + 
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

  //Fog
  'uniform vec4 u_Eye;\n' +
  'varying float v_Dist;\n' +

  'void main() {\n' +
  '  v_Dist = distance(u_Transform * a_Position, u_Eye);\n' +
  '  gl_Position = u_ProjMatrix * u_ViewMatrix * u_Transform * a_Position;\n' +
  '  v_TexCoord = a_TexCoord;\n' +
  '}\n';
//--------------------------------------------

//---------Fragment shader program for textures------------
var FSHADER_TEX =
  'precision mediump float;\n' +
  'uniform sampler2D u_Sampler;\n' +
  'varying vec2 v_TexCoord;\n' +
  'uniform vec3 u_FogColor;\n' +
  'uniform vec2 u_FogDist;\n' +
  'varying float v_Dist;\n' +
  'uniform float u_Fog;\n' +
  'void main() {\n' +
     //Calculation of fog factor
  '  float fogFactor = clamp((u_FogDist.y - v_Dist * u_Fog)/' +
                            '(u_FogDist.y - u_FogDist.x), 0.0, 1.0);\n' +
     //Treat the texture as the color (as in the non-texture shader for fog)
  '  vec4 tex = texture2D(u_Sampler, v_TexCoord);\n' +
     //Stronger fog as it gets further
  '  vec3 color = mix(u_FogColor, vec3(tex), fogFactor);\n' +
  '  gl_FragColor = vec4(color, tex.a);\n' + 
  '}\n';
//-------------------------------------------
