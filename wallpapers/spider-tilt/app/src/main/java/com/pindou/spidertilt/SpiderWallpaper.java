package com.pindou.spidertilt;

import android.content.SharedPreferences;
import android.graphics.Canvas;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.service.wallpaper.WallpaperService;
import android.view.MotionEvent;
import android.view.SurfaceHolder;

public final class SpiderWallpaper extends WallpaperService {
 @Override public Engine onCreateEngine(){return new TiltEngine();}
 private final class TiltEngine extends Engine implements MotionInput.Listener,SharedPreferences.OnSharedPreferenceChangeListener {
  private final Handler handler=new Handler(Looper.getMainLooper());private final SceneCanvas renderer=new SceneCanvas(SpiderWallpaper.this);
  private MotionInput motion;private SharedPreferences prefs;private boolean visible,surfaceReady,alive=true;private float targetX,targetY,targetRoll,x,y,roll,gain=1;
  private int fps=30;private long lastTap;private boolean drawn;private float drawnX,drawnY,drawnRoll;
  private final Runnable frame=new Runnable(){@Override public void run(){drawFrame();}};
  @Override public void onCreate(SurfaceHolder holder){super.onCreate(holder);setTouchEventsEnabled(true);prefs=getSharedPreferences("wallpaper",MODE_PRIVATE);prefs.registerOnSharedPreferenceChangeListener(this);readSettings();motion=new MotionInput(SpiderWallpaper.this,this);}
  private void readSettings(){gain=prefs.getFloat("gain",1.0f);fps=prefs.getBoolean("battery",false)?20:30;}
  @Override public void onSharedPreferenceChanged(SharedPreferences p,String key){readSettings();drawn=false;}
  @Override public void onMotion(float a,float b,float c){targetX=a;targetY=b;targetRoll=c;}
  @Override public void onVisibilityChanged(boolean value){visible=value;handler.removeCallbacks(frame);if(value&&surfaceReady){drawn=false;motion.start();drawFrame();}else motion.stop();}
  @Override public void onSurfaceCreated(SurfaceHolder holder){super.onSurfaceCreated(holder);surfaceReady=true;drawn=false;if(visible)motion.start();drawFrame();}
  @Override public void onSurfaceChanged(SurfaceHolder holder,int format,int w,int h){super.onSurfaceChanged(holder,format,w,h);surfaceReady=true;drawn=false;drawFrame();}
  @Override public void onSurfaceDestroyed(SurfaceHolder holder){surfaceReady=false;handler.removeCallbacks(frame);if(motion!=null)motion.stop();super.onSurfaceDestroyed(holder);}
  @Override public void onTouchEvent(MotionEvent event){if(event.getAction()==MotionEvent.ACTION_UP){long now=SystemClock.elapsedRealtime();if(now-lastTap<330){motion.recenter();targetX=targetY=targetRoll=0;lastTap=0;}else lastTap=now;}super.onTouchEvent(event);}
  private void drawFrame(){
   handler.removeCallbacks(frame);if(!alive||!surfaceReady)return;long start=SystemClock.uptimeMillis();
   x+=(targetX*gain-x)*.12f;y+=(targetY*gain-y)*.12f;roll+=(targetRoll*.24f*gain-roll)*.12f;
   if(!drawn||renderer.animated()||Math.abs(x-drawnX)+Math.abs(y-drawnY)+Math.abs(roll-drawnRoll)>.0008f){
    SurfaceHolder holder=getSurfaceHolder();Canvas canvas=null;
    try{if(!holder.getSurface().isValid())return;try{canvas=holder.lockHardwareCanvas();}catch(RuntimeException unavailable){canvas=holder.lockCanvas();}if(canvas!=null){renderer.draw(canvas,canvas.getWidth(),canvas.getHeight(),x,y,roll);drawn=true;drawnX=x;drawnY=y;drawnRoll=roll;}}
    catch(RuntimeException surfaceRace){android.util.Log.w("SpiderTilt","Surface draw interrupted",surfaceRace);}
    finally{if(canvas!=null){try{holder.unlockCanvasAndPost(canvas);}catch(RuntimeException ignored){}}}
   }
   if(visible&&surfaceReady&&alive)handler.postDelayed(frame,Math.max(8,1000/fps-(SystemClock.uptimeMillis()-start)));
  }
  @Override public void onDestroy(){alive=false;handler.removeCallbacks(frame);if(motion!=null)motion.stop();if(prefs!=null)prefs.unregisterOnSharedPreferenceChangeListener(this);super.onDestroy();}
 }
}
