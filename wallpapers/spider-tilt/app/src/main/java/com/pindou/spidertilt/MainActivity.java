package com.pindou.spidertilt;

import android.app.Activity;
import android.app.WallpaperManager;
import android.content.ComponentName;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.MotionEvent;
import android.view.View;
import android.view.Window;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.SeekBar;
import android.widget.Switch;
import android.widget.TextView;

public final class MainActivity extends Activity implements MotionInput.Listener {
 private MotionInput motion;private Preview preview;private SharedPreferences prefs;private float tx,ty,tr,gain;private boolean active;
 private int dp(float n){return (int)(n*getResources().getDisplayMetrics().density+.5f);}
 private TextView text(String s,int size,int color){TextView t=new TextView(this);t.setText(s);t.setTextSize(size);t.setTextColor(color);t.setPadding(0,dp(5),0,dp(5));return t;}
 @Override public void onCreate(Bundle saved){super.onCreate(saved);getWindow().setStatusBarColor(0xff071222);getWindow().setNavigationBarColor(0xff071222);
  prefs=getSharedPreferences("wallpaper",MODE_PRIVATE);gain=prefs.getFloat("gain",1f);motion=new MotionInput(this,this);
  ScrollView scroll=new ScrollView(this);scroll.setFitsSystemWindows(true);scroll.setFillViewport(true);scroll.setBackgroundColor(0xff071222);LinearLayout content=new LinearLayout(this);content.setOrientation(LinearLayout.VERTICAL);content.setPadding(dp(24),dp(22),dp(24),dp(20));scroll.addView(content);
  TextView title=text("蜘蛛侠 · 体感3D",27,0xfff1f7ff);title.setTypeface(Typeface.DEFAULT,Typeface.BOLD);content.addView(title);
  content.addView(text("倾斜手机，改变真实立体视角",15,0xff9cb6ce));
  preview=new Preview();LinearLayout.LayoutParams pp=new LinearLayout.LayoutParams(-1,dp(315));pp.topMargin=dp(10);pp.bottomMargin=dp(12);content.addView(preview,pp);
  String sensor=motion.hasSensor()?(motion.usesRotation()?"体感传感器已就绪 · 可拖动预览":"使用重力感应 · 可拖动预览"):"本机无可用传感器 · 可拖动预览，桌面显示静态3D画面";
  content.addView(text(sensor,12,0xff9cb6ce));
  Button apply=new Button(this);apply.setText("设为动态壁纸");apply.setTextColor(Color.WHITE);apply.setBackgroundTintList(android.content.res.ColorStateList.valueOf(0xffb9253c));content.addView(apply,new LinearLayout.LayoutParams(-1,dp(54)));apply.setOnClickListener(v->{try{Intent intent=new Intent(WallpaperManager.ACTION_CHANGE_LIVE_WALLPAPER);intent.putExtra(WallpaperManager.EXTRA_LIVE_WALLPAPER_COMPONENT,new ComponentName(this,SpiderWallpaper.class));startActivity(intent);}catch(android.content.ActivityNotFoundException unavailable){try{startActivity(new Intent(WallpaperManager.ACTION_LIVE_WALLPAPER_CHOOSER));}catch(android.content.ActivityNotFoundException missing){android.widget.Toast.makeText(this,"此设备的桌面未提供动态壁纸入口，请在系统壁纸设置中查找。",android.widget.Toast.LENGTH_LONG).show();}}});
  TextView sensitivity=text("晃动灵敏度",16,0xfff1f7ff);content.addView(sensitivity);SeekBar seek=new SeekBar(this);seek.setMax(200);seek.setProgress((int)((gain-.5f)*100));content.addView(seek);seek.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener(){public void onProgressChanged(SeekBar b,int p,boolean user){gain=.5f+p/100f;prefs.edit().putFloat("gain",gain).apply();}public void onStartTrackingTouch(SeekBar b){}public void onStopTrackingTouch(SeekBar b){}});
  Switch battery=new Switch(this);battery.setText("省电模式（20帧/秒）");battery.setTextColor(0xffd7e6f5);battery.setChecked(prefs.getBoolean("battery",false));content.addView(battery);battery.setOnCheckedChangeListener((v,value)->prefs.edit().putBoolean("battery",value).apply());
  Button center=new Button(this);center.setText("以当前姿势重新校准");content.addView(center);center.setOnClickListener(v->{motion.recenter();tx=ty=tr=0;preview.dragX=preview.dragY=0;});
  content.addView(text("先自然握住手机，再校准。桌面双击也可重新校准。\n锁屏是否支持动态壁纸，取决于手机系统；通常可用于主屏幕。\n无需联网或照片权限。非官方粉丝作品。",12,0xff829bb5));
  setContentView(scroll);
 }
 @Override public void onMotion(float x,float y,float roll){tx=x;ty=y;tr=roll;}
 @Override public void onResume(){super.onResume();active=true;motion.start();if(preview!=null)preview.postInvalidateOnAnimation();}
 @Override public void onPause(){active=false;motion.stop();super.onPause();}
 private final class Preview extends View {
  final SceneCanvas renderer=new SceneCanvas();float x,y,r,dragX,dragY,startX,startY;
  Preview(){super(MainActivity.this);setLayerType(View.LAYER_TYPE_HARDWARE,null);setContentDescription("可拖动的蜘蛛侠3D体感预览");}
  @Override protected void onDraw(Canvas c){super.onDraw(c);x+=((tx*gain+dragX)-x)*.15f;y+=((ty*gain+dragY)-y)*.15f;r+=(tr*.24f-r)*.15f;renderer.draw(c,getWidth(),getHeight(),x,y,r);if(active)postInvalidateDelayed(prefs.getBoolean("battery",false)?50:33);}
  @Override public boolean onTouchEvent(MotionEvent e){if(e.getAction()==MotionEvent.ACTION_DOWN){startX=e.getX();startY=e.getY();getParent().requestDisallowInterceptTouchEvent(true);return true;}if(e.getAction()==MotionEvent.ACTION_MOVE){dragX=MotionMath.clamp((e.getX()-startX)/Math.max(1,getWidth()),.65f);dragY=MotionMath.clamp((e.getY()-startY)/Math.max(1,getHeight())*.6f,.45f);return true;}if(e.getAction()==MotionEvent.ACTION_UP||e.getAction()==MotionEvent.ACTION_CANCEL){dragX=dragY=0;getParent().requestDisallowInterceptTouchEvent(false);performClick();return true;}return true;}
  @Override public boolean performClick(){super.performClick();return true;}
 }
}
