var xValues = [];
var yValues = [];
var zValues = [];

var started = false;
var ready = false;
var ended = false;
var statsGiven = false;

var startTime;
var time;

var allAngles;

var avgAcceleration;
var velocity;
var height = 1.7185;
var horDisplacement;

simply.text({
  title: 'press any right button',
  subtitle: 'to start',
}, true);


simply.on('singleClick', function(e) {
  if (e.button == 'select' || e.button == 'up' || e.button == 'down')
  {
    ready = true;
    simply.title('get your arm ready');
    simply.subtitle('Throw after the pebble vibrates');
    simply.body('');
    simply.scrollable(true);
  }
});

simply.on('accelData', function(e) {
  if (ended === false){
    if (e.accel.x > 800  && ready === true && started === false)
    {
      started = true;
      simply.vibe('long');
      startTime = new Date().getTime();
    }
    if (started === true){
      simply.subtitle('x: ' + e.accel.x + '\ny: ' + e.accel.y + '\nz: ' + e.accel.z);
      xValues.push(e.accel.x);
      yValues.push(e.accel.y);
      zValues.push(e.accel.z);
      simply.title('throw');
    }
    if (started === true && e.accel.z < -550 && e.accel.x < 900)
    {
      ended = true;
      simply.title('your stats');
      simply.scrollable(true);
      simply.subtitle('');
      var init = [];
      var fin = [];
      init.push(xValues[0]);
      init.push(zValues[0]);
      fin.push(xValues[xValues.length-1]);
      fin.push(zValues[zValues.length-1]);
      angles(init,fin,xValues.length);
      actualAcceleration(allAngles);
      time = new Date().getTime() - startTime;
      avgAccel();
      velocity = avgAcceleration * time / 5000 * 9.8 / 1060;
      displacement();
      simply.body('velocity: ' + Math.round(velocity) + 'm/s\ndistance: ' + Math.round(horDisplacement) + 'meters');
      xValues = [];
      yValues = [];
      zValues = [];

      started = false;
      ready = false;
      ended = false;
      statsGiven = false;
      height = 1.7185;
    }
  }
    
});
  
//  Angles not corrected for gravity yet.
//  init is initial x and z values
//  fin is final x and z values
//  num is number of x, y, and zValues
//  obtains angles assuming exponential acceleration
function angles(init, fin, num)
{        
  var startAngle = (Math.atan(-1 * init[1]/init[0])) * (180 / Math.PI);
  console.log(startAngle);
  var endAngle = (Math.atan(fin[1]/fin[0])) * (180 / Math.PI);
  if (startAngle < 0)  startAngle+=180;
  if (endAngle < 0)   endAngle+=180;    
  allAngles = new Array(num);
  var b;
  b = Math.pow(endAngle/startAngle,1.0/(num-1));
  var i;      
  for (i=1;i<num-1;i++)
  {
    allAngles[i]= startAngle * Math.pow(b,i);
  }
  allAngles[0] = startAngle;
  allAngles[num-1] = endAngle;
}

//  returns 2d array of actual accel. corrected for gravity and accelerometer direction
//  row is same accelDataPoint, columns are x and z accelerations.
function actualAcceleration(angles)
{
  var XZCorrects = [[],[]];
  var i;
  for (i = 0; i < xValues.length; i++)
  {
    XZCorrects[0][i] = Math.cos((angles[i]) * Math.PI)/180 * -1000;
    XZCorrects[1][i] = Math.sin((angles[i]) * Math.PI)/180 * 1000;
  }

  for (i=0;i<xValues.length;i++)
  {
    xValues[i] = -xValues[i] - XZCorrects[0][i];
    zValues[i] = -zValues[i] - XZCorrects[1][i];
  }
}

function avgAccel()
{
  var i;
  var squareSum = 0;
  for (i = 0; i < xValues.length; i++)
  {
    squareSum+= Math.pow(xValues[i] * xValues[i] + zValues[i] * zValues[i], 0.5);
  }
  avgAcceleration = squareSum/i;
}

function displacement()
{
  horDisplacement = velocity * Math.sqrt(height / 4.9);
}