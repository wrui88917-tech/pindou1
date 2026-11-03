package com.pindou.spidertilt;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.view.Surface;
import android.view.WindowManager;

final class MotionInput implements SensorEventListener {
 interface Listener { void onMotion(float x,float y,float roll); }
 private final SensorManager manager;private final Sensor sensor;private final Listener listener;private final WindowManager window;
 private final float[] base=new float[4],current=new float[4],angles=new float[3],gravityBase=new float[3];
 private boolean calibrated,active;private int settling;
 MotionInput(Context context,Listener listener){
  this.listener=listener;manager=(SensorManager)context.getSystemService(Context.SENSOR_SERVICE);window=(WindowManager)context.getSystemService(Context.WINDOW_SERVICE);
  Sensor s=manager.getDefaultSensor(Sensor.TYPE_GAME_ROTATION_VECTOR);
  if(s==null)s=manager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR);
  if(s==null)s=manager.getDefaultSensor(Sensor.TYPE_GRAVITY);
  if(s==null)s=manager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);sensor=s;
 }
 boolean hasSensor(){return sensor!=null;}
 boolean usesRotation(){return sensor!=null&&(sensor.getType()==Sensor.TYPE_GAME_ROTATION_VECTOR||sensor.getType()==Sensor.TYPE_ROTATION_VECTOR);}
 void start(){if(active||sensor==null)return;recenter();active=manager.registerListener(this,sensor,20000);}
 void stop(){manager.unregisterListener(this);active=false;}
 void recenter(){calibrated=false;settling=0;listener.onMotion(0,0,0);}
 @Override public void onAccuracyChanged(Sensor sensor,int accuracy){}
 @Override public void onSensorChanged(SensorEvent event){
  if(!active)return;
  if(usesRotation()){
   current[0]=event.values[0];current[1]=event.values[1];current[2]=event.values[2];current[3]=event.values.length>3?event.values[3]:(float)Math.sqrt(Math.max(0,1-current[0]*current[0]-current[1]*current[1]-current[2]*current[2]));
   if(!calibrated){System.arraycopy(current,0,base,0,4);if(++settling<5)return;calibrated=true;}
   MotionMath.relative(base,current,angles);
  }else{
   if(!calibrated){System.arraycopy(event.values,0,gravityBase,0,3);if(++settling<5)return;calibrated=true;}
   angles[0]=MotionMath.clamp((event.values[0]-gravityBase[0])/9.81f,.85f);angles[1]=MotionMath.clamp((event.values[2]-gravityBase[2])/9.81f,.75f);angles[2]=0;
  }
  float x=angles[0],y=angles[1];int rotation=window.getDefaultDisplay().getRotation();
  if(rotation==Surface.ROTATION_90){float t=x;x=-y;y=t;}else if(rotation==Surface.ROTATION_180){x=-x;y=-y;}else if(rotation==Surface.ROTATION_270){float t=x;x=y;y=-t;}
  listener.onMotion(x,y,angles[2]);
 }
}
