package com.pindou.spidertilt;

/** Sensor math independent of Android, so relative orientation is testable on a JVM. */
public final class MotionMath {
 private MotionMath() {}
 public static float clamp(float v,float max){return Math.max(-max,Math.min(max,v));}
 public static void relative(float[] base,float[] current,float[] out){
  float ax=-base[0],ay=-base[1],az=-base[2],aw=base[3];
  float bx=current[0],by=current[1],bz=current[2],bw=current[3];
  float x=aw*bx+ax*bw+ay*bz-az*by,y=aw*by-ax*bz+ay*bw+az*bx,z=aw*bz+ax*by-ay*bx+az*bw,w=aw*bw-ax*bx-ay*by-az*bz;
  if(w<0){x=-x;y=-y;z=-z;w=-w;}
  out[0]=clamp((float)(2*Math.atan2(y,w)),.85f);
  out[1]=clamp((float)(2*Math.atan2(x,w)),.75f);
  out[2]=clamp((float)(2*Math.atan2(z,w)),.55f);
 }
}
