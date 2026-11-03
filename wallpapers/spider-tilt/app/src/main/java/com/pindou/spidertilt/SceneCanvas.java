package com.pindou.spidertilt;

import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RadialGradient;
import android.graphics.Shader;
import java.util.Random;

final class SceneCanvas {
 private final Scene scene=new Scene();private final Paint paint=new Paint(Paint.ANTI_ALIAS_FLAG);private final Path path=new Path();
 private int width,height;private Shader sky,glow,lowerGlow;private final float[] stars=new float[180];
 SceneCanvas(){Random random=new Random(88917);for(int i=0;i<stars.length;i++)stars[i]=random.nextFloat();}
 void draw(Canvas c,int w,int h,float yaw,float pitch,float roll){
  if(w<=0||h<=0)return;
  if(w!=width||h!=height){width=w;height=h;sky=new LinearGradient(0,0,0,h,new int[]{0xff020713,0xff0d2540,0xff12283c,0xff050c18},null,Shader.TileMode.CLAMP);glow=new RadialGradient(w*.80f,h*.28f,w*.9f,new int[]{0x504083a7,0x00152640},null,Shader.TileMode.CLAMP);lowerGlow=new RadialGradient(w*.13f,h*.65f,w*.8f,new int[]{0x554a1935,0x00081223},null,Shader.TileMode.CLAMP);}
  paint.setStyle(Paint.Style.FILL);paint.setShader(sky);c.drawRect(0,0,w,h,paint);paint.setShader(glow);c.drawRect(0,0,w,h,paint);paint.setShader(lowerGlow);c.drawRect(0,0,w,h,paint);paint.setShader(null);
  for(int i=0;i<stars.length;i+=3){paint.setColor(Color.argb((int)(45+stars[i+2]*95),160,199,221));c.drawCircle(stars[i]*w-yaw*12,stars[i+1]*h*.48f+pitch*10,.6f+stars[i+2]*w*.001f,paint);}
  // A small moon and a soft halo occupy the distant sky, leaving room for icons.
  float moonX=w*.81f-yaw*18,moonY=h*.18f+pitch*12;paint.setColor(0x0868b7dc);c.drawCircle(moonX,moonY,w*.075f,paint);paint.setColor(0x1566a9c4);c.drawCircle(moonX,moonY,w*.048f,paint);paint.setColor(0xffbfd0d1);c.drawCircle(moonX,moonY,w*.026f,paint);
  for(Scene.Primitive prim:scene.project(w,h,yaw,pitch,roll)){
   if(!prim.visible)continue;path.rewind();path.moveTo(prim.xy[0],prim.xy[1]);for(int i=2;i<prim.xy.length;i+=2)path.lineTo(prim.xy[i],prim.xy[i+1]);
   paint.setColor(prim.color);if(prim.isLine()){paint.setStyle(Paint.Style.STROKE);paint.setStrokeWidth(Math.max(.65f,prim.width*w*1.6f/prim.depth));paint.setStrokeCap(Paint.Cap.ROUND);}else{path.close();paint.setStyle(Paint.Style.FILL_AND_STROKE);paint.setStrokeWidth(1.0f);}
   c.drawPath(path,paint);
  }
  paint.setStyle(Paint.Style.FILL);paint.setShader(new LinearGradient(0,h*.82f,0,h,new int[]{0x00030a16,0xa0030a16},null,Shader.TileMode.CLAMP));c.drawRect(0,h*.82f,w,h,paint);paint.setShader(null);
 }
}
