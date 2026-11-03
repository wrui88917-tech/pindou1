package com.pindou.spidertilt;

import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.os.SystemClock;
import java.util.Random;

final class SceneCanvas {
 private static final int COLUMNS=48,ROWS=96;
 private final Context context;private final SharedPreferences prefs;private final Paint paint=new Paint(Paint.ANTI_ALIAS_FLAG|Paint.FILTER_BITMAP_FLAG|Paint.DITHER_FLAG);
 private final float[] mesh=new float[(COLUMNS+1)*(ROWS+1)*2],rain=new float[400];
 SceneCanvas(Context context){this.context=context.getApplicationContext();prefs=context.getSharedPreferences("wallpaper",Context.MODE_PRIVATE);Random random=new Random(1989);for(int i=0;i<rain.length;i++)rain[i]=random.nextFloat();}
 boolean hasPhoto(){return PhotoStore.hasPhoto(context);}
 boolean animated(){return hasPhoto()&&prefs.getBoolean("rain",true);}
 void draw(Canvas c,int w,int h,float yaw,float pitch,float roll){
  c.drawColor(0xff080d17);Bitmap photo=PhotoStore.get(context);if(photo==null){paint.setColor(0xffbbc6d8);paint.setTextAlign(Paint.Align.CENTER);paint.setTextSize(w*.038f);c.drawText("在应用中选择你的原图",w*.5f,h*.5f,paint);return;}
  int preset=prefs.getInt("preset",0);DepthMath.project(photo.getWidth(),photo.getHeight(),w,h,yaw,pitch,roll,preset,COLUMNS,ROWS,mesh);paint.setColor(Color.WHITE);paint.setAlpha(255);c.drawBitmapMesh(photo,COLUMNS,ROWS,mesh,0,null,0,paint);
  if(prefs.getBoolean("rain",true)){double time=SystemClock.uptimeMillis()/1000.0;paint.setColor(0xffbddaf4);paint.setStrokeWidth(Math.max(.8f,w*.00065f));paint.setStrokeCap(Paint.Cap.ROUND);
   for(int i=0;i<100;i++){int k=i*4;float depth=.3f+rain[k+2]*.7f;float x=(rain[k]*1.4f-.2f)*w-yaw*w*.018f*depth;float v=(float)((rain[k+1]+time*(.14+depth*.15))%1.0),y=v*h;float len=h*(.003f+depth*.009f);paint.setAlpha((int)(18+depth*25));c.drawLine(x,y,x-len*.24f,y+len,paint);}
   paint.setAlpha(255);
  }
 }
}
