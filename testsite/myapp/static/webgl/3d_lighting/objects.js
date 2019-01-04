/** 
 * Author: Brandon Smith
 * Filename: objects.js
 * Desc: Objects for WebGl 3D environment 
 * Date: 12/13/2016
 * Reference: WebGL Programming Guide: Interactive 3D
 *            Graphics Programming with WebGL
 *            Learningwebgl.com/blog/?p=1253 for sphere generation
 */

//********************************************************
//----------------------Object Stuff----------------------
//********************************************************
var objVec = new Array();
var numObj = 22;

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
    p: 0,               //primitive type (0 = cube, 1 = sphere)
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
    normalMatrix: new Matrix4 //Normal Matrix
  });
}

//--------------------Objects------------------------
//Ground
objVec[0].scale_x = 250;
objVec[0].scale_z = 250;
objVec[0].y = -2;
objVec[0].textured = 1;

//Point light 1
objVec[1].p = 1;
objVec[1].y = 2;
objVec[1].z = 5;
objVec[1].x = 4;
objVec[1].scale_y = 0.1;
objVec[1].scale_x = 0.1;
objVec[1].scale_z = 0.1;

//Point light 2
objVec[2].p = 1;
objVec[2].y = 2;
objVec[2].z = 5;
objVec[2].x = -4;
objVec[2].scale_y = 0.1;
objVec[2].scale_x = 0.1;
objVec[2].scale_z = 0.1;

//Box 1
objVec[3].y = 2;
objVec[3].z = -30;
objVec[3].x = 0;
objVec[3].scale_y = 75;
objVec[3].scale_x = 5;
objVec[3].scale_z = 5;
objVec[3].rotation_y = 225;

//Walls
objVec[4].y = 2;
objVec[4].z = 0;
objVec[4].x = -20;
objVec[4].scale_y = 25;
objVec[4].scale_x = 5;
objVec[4].scale_z = 50;

objVec[5].y = 2;
objVec[5].z = 0;
objVec[5].x = 20;
objVec[5].scale_y = 25;
objVec[5].scale_x = 5;
objVec[5].scale_z = 50;

objVec[6].y = 2;
objVec[6].z = 30;
objVec[6].x = 0;
objVec[6].scale_y = 25;
objVec[6].scale_x = 5;
objVec[6].scale_z = 50;
objVec[6].rotation_y = 90;

objVec[7].y = 2;
objVec[7].z = -70;
objVec[7].x = 0 ;
objVec[7].scale_y = 25;
objVec[7].scale_x = 5;
objVec[7].scale_z = 50;
objVec[7].rotation_y = 90;

//Sphere sculpture
objVec[8].p = 1;
objVec[8].y = -8;
objVec[8].z = -5;
objVec[8].x = 0;
objVec[8].scale_y = 4;
objVec[8].scale_x = 4;
objVec[8].scale_z = 4;

objVec[9].p = 1;
objVec[9].y = 2;
objVec[9].z = -5;
objVec[9].x = 0;
objVec[9].scale_y = 1;
objVec[9].scale_x = 1;
objVec[9].scale_z = 1;

objVec[10].p = 1;
objVec[10].y = 5;
objVec[10].z = -5;
objVec[10].x = 0;
objVec[10].scale_y = 0.5;
objVec[10].scale_x = 0.5;
objVec[10].scale_z = 0.5;

objVec[11].p = 1;
objVec[11].y = 6.5;
objVec[11].z = -5;
objVec[11].x = 0;
objVec[11].scale_y = 0.25;
objVec[11].scale_x = 0.25;
objVec[11].scale_z = 0.25;

//Structural Stuff
objVec[12].y = 5;
objVec[12].z = -22;
objVec[12].x = -10;
objVec[12].scale_y = 0.25;
objVec[12].scale_x = 20;
objVec[12].scale_z = 0.25;
objVec[12].rotation_z = 45;

objVec[13].y = 5;
objVec[13].z = -22;
objVec[13].x = 10;
objVec[13].scale_y = 0.25;
objVec[13].scale_x = 20;
objVec[13].scale_z = 0.25;
objVec[13].rotation_z = -45;

//Pillars
objVec[14].y = 1;
objVec[14].z = 0;
objVec[14].x = 5;
objVec[14].scale_y = 25;
objVec[14].scale_x = 0.25;
objVec[14].scale_z = 0.25;
objVec[14].rotation_y = 45;

objVec[15].y = 1;
objVec[15].z = 0;
objVec[15].x = -5;
objVec[15].scale_y = 25;
objVec[15].scale_x = 0.25;
objVec[15].scale_z = 0.25;
objVec[15].rotation_y = 135;

objVec[16].y = 1;
objVec[16].z = -14;
objVec[16].x = 5;
objVec[16].scale_y = 25;
objVec[16].scale_x = 0.25;
objVec[16].scale_z = 0.25;
objVec[16].rotation_y = -45;

objVec[17].y = 1;
objVec[17].z = -14;
objVec[17].x = -5;
objVec[17].scale_y = 25;
objVec[17].scale_x = 0.25;
objVec[17].scale_z = 0.25;
objVec[17].rotation_y = -135;

//Spinning orbs
objVec[18].p = 1;
objVec[18].y = 8;
objVec[18].z = -5;
objVec[18].x = 0;
objVec[18].scale_y = 0.2;
objVec[18].scale_x = 0.2;
objVec[18].scale_z = 0.2;
objVec[18].rot_x = 5;
objVec[18].rot_y = 0;
objVec[18].rot_z = 0;

objVec[19].p = 1;
objVec[19].y = 8;
objVec[19].z = -5;
objVec[19].x = 0;
objVec[19].scale_y = 0.2;
objVec[19].scale_x = 0.2;
objVec[19].scale_z = 0.2;
objVec[19].rot_x = -5;
objVec[19].rot_y = 0;
objVec[19].rot_z = 0;

objVec[20].p = 1;
objVec[20].y = 8;
objVec[20].z = -5;
objVec[20].x = 0;
objVec[20].scale_y = 0.2;
objVec[20].scale_x = 0.2;
objVec[20].scale_z = 0.2;
objVec[20].rot_x = 0;
objVec[20].rot_y = 0;
objVec[20].rot_z = 5;

objVec[21].p = 1;
objVec[21].y = 8;
objVec[21].z = -5;
objVec[21].x = 0;
objVec[21].scale_y = 0.2;
objVec[21].scale_x = 0.2;
objVec[21].scale_z = 0.2;
objVec[21].rot_x = 0;
objVec[21].rot_y = 0;
objVec[21].rot_z = -5;

