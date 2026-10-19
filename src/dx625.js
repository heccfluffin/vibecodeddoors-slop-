/* =====================================================================================================
   r637: FASTER CAR-AGAINST-CAR CHECKS (step 3 of the performance work). Obstacles already had a grid (obsNear). What
   was left: every time a car tests a spot (vehOK, many times a frame for every moving car), it measured the distance
   from each test point to EVERY other vehicle's centre line, with sines and cosines each time.
   Now (the results are exactly the same, only cheaper):
     - a car that is clearly too far away along x or z to touch is skipped before the full measurement (the margin is
       the car's half length plus both radii plus 1 cm, so it only ever skips cars that could not be hit). The cars are
       still checked in the same order, so the first one hit (who hit whom, damage, AI reactions) is unchanged;
     - each vehicle's centre line is remembered while it has not moved or turned, instead of being worked out again
       for every point (the same arithmetic, so the same numbers to the last bit).
   The skip itself is a build.py patch inside vehOK and vehHit (it reads VCG.on). ?novcg turns it all off to compare.
   ===================================================================================================== */
var VCG={on:!/[?&]novcg/.test(location.search),sd0:vehSegD};
{const sd0=vehSegD;vehSegD=function(w,x,lz){if(!VCG.on)return sd0(w,x,lz);
 const d=Math.max(0,w.K.len/2-w.r);let c=w.__sd;
 if(!c||c.h!==w.h||c.x!==w.x||c.z!==w.z||c.d!==d){const ax=w.x-Math.sin(w.h)*d,az=w.z-Math.cos(w.h)*d,bx=w.x+Math.sin(w.h)*d,bz=w.z+Math.cos(w.h)*d,vx=bx-ax,vz=bz-az;c=w.__sd={h:w.h,x:w.x,z:w.z,d,ax,az,vx,vz,L:vx*vx+vz*vz||1}}
 const t=Math.max(0,Math.min(1,((x-c.ax)*c.vx+(lz-c.az)*c.vz)/c.L));return Math.hypot(x-c.ax-c.vx*t,lz-c.az-c.vz*t)}}
/* can w be within reach of a point (x, lz) with radius r? false only when it surely cannot */
function vcgNear(w,x,lz,r){const rr=Math.max(0,w.K.len/2-w.r)+w.r+r+.01;return!(x-w.x>rr||w.x-x>rr||lz-w.z>rr||w.z-lz>rr)}
