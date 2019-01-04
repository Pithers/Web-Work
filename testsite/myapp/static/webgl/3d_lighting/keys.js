/** 
 * Author: Brandon Smith
 * Filename: keys.js
 * Desc: Assignment6 key checker
 * Date: 12/13/2016
 */

//---------------Deal with key presses-----------
var keys =
{
  left_arrowr: 0,
  right_arrow: 0,
  up_arrow: 0,
  down_arrow: 0,
  w_key: 0,
  s_key: 0,
  a_key: 0,
  d_key: 0,
  f_key: 0,
  g_key: 1,
  one_key: 1,
  two_key: 1
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
  if(ev.keyCode == 83)
  {
    keys.s_key = !keys.s_key;
  }
  if(ev.keyCode == 65)
  {
    keys.a_key = !keys.a_key;
  }
  if(ev.keyCode == 68)
  {
    keys.d_key = !keys.d_key;
  }
  if(ev.keyCode == 70)
  {
    keys.f_key = !keys.f_key;
  }
  if(ev.keyCode == 71)
  {
    keys.g_key = !keys.g_key;
  }
  if(ev.keyCode == 49)
  {
    keys.one_key = !keys.one_key;
  }
  if(ev.keyCode == 50)
  {
    keys.two_key = !keys.two_key;
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
  if(ev.keyCode == 87)
  {
    keys.w_key = 0;
  }
  if(ev.keyCode == 83)
  {
    keys.s_key = 0;
  }
  if(ev.keyCode == 65)
  {
    keys.a_key = 0;
  }
  if(ev.keyCode == 68)
  {
    keys.d_key = 0;
  }
}

//Run functions on key presses
document.onkeydown = function(ev){keydown(ev);};
document.onkeyup = function(ev){keyup(ev);};
