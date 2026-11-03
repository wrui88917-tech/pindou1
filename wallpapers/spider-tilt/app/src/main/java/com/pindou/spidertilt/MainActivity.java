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
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.SeekBar;
import android.widget.Spinner;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

public final class MainActivity extends Activity implements MotionInput.Listener {
 private MotionInput motion;private Preview preview;private SharedPreferences prefs;private float tx,ty,tr,gain;private boolean active;private Button choose;
 private int dp(float n){return (int)(n*getResources().getDisplayMetrics().density+.5f);}
 private TextView text(String s,int size,int color){TextView t=new TextView(this);t.setText(s);t.setTextSize(size);t.setTextColor(color);t.setPadding(0,dp(5),0,dp(5));return t;}
 private Button button(String s){Button b=new Button(this);b.setText(s);b.setTextColor(Color.WHITE);return b;}
 @Override public void onCreate(Bundle saved){super.onCreate(saved);getWindow().setStatusBarColor(0xff090e18);getWindow().setNavigationBarColor(0xff090e18);
  prefs=getSharedPreferences("wallpaper",MODE_PRIVATE);gain=prefs.getFloat("gain",1f);motion=new MotionInput(this,this);
  ScrollView scroll=new ScrollView(this);scroll.setFitsSystemWindows(true);scroll.setFillViewport(true);scroll.setBackgroundColor(0xff090e18);LinearLayout content=new LinearLayout(this);content.setOrientation(LinearLayout.VERTICAL);content.setPadding(dp(24),dp(22),dp(24),dp(20));scroll.addView(content);
  content.addView(text("CINEMATIC DEPTH",11,0xff91a0b8));TextView title=text("蛛网都市 · 电影景深",26,0xfff1f7ff);title.setTypeface(Typeface.DEFAULT,Typeface.BOLD);content.addView(title);content.addView(text("保留原图质感，让倾斜产生轻柔景深",14,0xffa4b3c9));
  choose=button(PhotoStore.hasPhoto(this)?"更换壁纸原图":"选择壁纸原图");choose.setBackgroundTintList(android.content.res.ColorStateList.valueOf(0xffb52c43));content.addView(choose,new LinearLayout.LayoutParams(-1,dp(50)));choose.setOnClickListener(v->{Intent pick=new Intent(Intent.ACTION_OPEN_DOCUMENT);pick.setType("image/*");pick.addCategory(Intent.CATEGORY_OPENABLE);pick.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);try{startActivityForResult(pick,100);}catch(android.content.ActivityNotFoundException e){Toast.makeText(this,"此设备没有可用的图片选择器",Toast.LENGTH_LONG).show();}});
  preview=new Preview();LinearLayout.LayoutParams pp=new LinearLayout.LayoutParams(-1,dp(390));pp.topMargin=dp(12);pp.bottomMargin=dp(8);content.addView(preview,pp);
  content.addView(text(motion.hasSensor()?"轻轻倾斜手机，或拖动预览":"本机没有可用体感传感器，仍可拖动预览",12,0xff9cb6ce));
  Button apply=button("设为动态壁纸");apply.setEnabled(PhotoStore.hasPhoto(this));content.addView(apply,new LinearLayout.LayoutParams(-1,dp(50)));apply.setOnClickListener(v->{try{Intent intent=new Intent(WallpaperManager.ACTION_CHANGE_LIVE_WALLPAPER);intent.putExtra(WallpaperManager.EXTRA_LIVE_WALLPAPER_COMPONENT,new ComponentName(this,SpiderWallpaper.class));startActivity(intent);}catch(android.content.ActivityNotFoundException unavailable){try{startActivity(new Intent(WallpaperManager.ACTION_LIVE_WALLPAPER_CHOOSER));}catch(android.content.ActivityNotFoundException missing){Toast.makeText(this,"请在系统壁纸设置中选择本壁纸",Toast.LENGTH_LONG).show();}}});
  content.addView(text("景深构图",14,0xffd9e4f2));Spinner preset=new Spinner(this);ArrayAdapter<String> adapter=new ArrayAdapter<String>(this,android.R.layout.simple_spinner_item,new String[]{"图一：斜向近景人物","居中的人物或物件","整幅画面轻移"});adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);preset.setAdapter(adapter);preset.setSelection(prefs.getInt("preset",0));content.addView(preset);preset.setOnItemSelectedListener(new android.widget.AdapterView.OnItemSelectedListener(){public void onItemSelected(android.widget.AdapterView<?> a,View v,int p,long id){prefs.edit().putInt("preset",p).apply();}public void onNothingSelected(android.widget.AdapterView<?> a){}});
  content.addView(text("晃动灵敏度",14,0xffd9e4f2));SeekBar seek=new SeekBar(this);seek.setMax(200);seek.setProgress((int)((gain-.5f)*100));content.addView(seek);seek.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener(){public void onProgressChanged(SeekBar b,int p,boolean user){gain=.5f+p/100f;prefs.edit().putFloat("gain",gain).apply();}public void onStartTrackingTouch(SeekBar b){}public void onStopTrackingTouch(SeekBar b){}});
  Switch rain=new Switch(this);rain.setText("独立细雨层");rain.setTextColor(0xffc4d2e6);rain.setChecked(prefs.getBoolean("rain",true));content.addView(rain);rain.setOnCheckedChangeListener((v,value)->prefs.edit().putBoolean("rain",value).apply());
  Switch battery=new Switch(this);battery.setText("省电模式（20帧/秒）");battery.setTextColor(0xffc4d2e6);battery.setChecked(prefs.getBoolean("battery",false));content.addView(battery);battery.setOnCheckedChangeListener((v,value)->prefs.edit().putBoolean("battery",value).apply());
  Button center=button("以当前握姿重新归中");content.addView(center);center.setOnClickListener(v->{motion.recenter();tx=ty=tr=0;preview.dragX=preview.dragY=0;});
  content.addView(text("图片只保存在本设备，不会上传。\n本版为原图体感景深，不支持绕看人物背面。动态锁屏是否可用取决于手机系统。",11,0xff8193ad));setContentView(scroll);
 }
 @Override protected void onActivityResult(int request,int result,Intent data){super.onActivityResult(request,result,data);if(request!=100||result!=RESULT_OK||data==null||data.getData()==null)return;choose.setEnabled(false);choose.setText("正在载入原图…");final android.net.Uri uri=data.getData();new Thread(()->{try{PhotoStore.importPhoto(getApplicationContext(),uri);runOnUiThread(()->{if(!isFinishing())recreate();});}catch(Exception e){runOnUiThread(()->{if(!isFinishing()){choose.setEnabled(true);choose.setText("重新选择图片");Toast.makeText(this,e.getMessage()==null?"图片未能读取，请换用 JPG 或 PNG":e.getMessage(),Toast.LENGTH_LONG).show();}});}},"PhotoImport").start();}
 @Override public void onMotion(float x,float y,float roll){tx=x;ty=y;tr=roll;}
 @Override public void onResume(){super.onResume();active=true;motion.start();if(preview!=null)preview.postInvalidateOnAnimation();}
 @Override public void onPause(){active=false;motion.stop();super.onPause();}
 private final class Preview extends View {
  final SceneCanvas renderer=new SceneCanvas(MainActivity.this);float x,y,r,dragX,dragY,startX,startY;
  Preview(){super(MainActivity.this);setLayerType(View.LAYER_TYPE_HARDWARE,null);setContentDescription("可拖动的原图体感景深预览");}
  @Override protected void onDraw(Canvas c){super.onDraw(c);x+=((tx*gain+dragX)-x)*.15f;y+=((ty*gain+dragY)-y)*.15f;r+=(tr*.24f-r)*.15f;renderer.draw(c,getWidth(),getHeight(),x,y,r);if(active)postInvalidateDelayed(prefs.getBoolean("battery",false)?50:33);}
  @Override public boolean onTouchEvent(MotionEvent e){if(e.getAction()==MotionEvent.ACTION_DOWN){startX=e.getX();startY=e.getY();getParent().requestDisallowInterceptTouchEvent(true);return true;}if(e.getAction()==MotionEvent.ACTION_MOVE){dragX=MotionMath.clamp((e.getX()-startX)/Math.max(1,getWidth()),.7f);dragY=MotionMath.clamp((e.getY()-startY)/Math.max(1,getHeight())*.65f,.65f);return true;}if(e.getAction()==MotionEvent.ACTION_UP||e.getAction()==MotionEvent.ACTION_CANCEL){dragX=dragY=0;getParent().requestDisallowInterceptTouchEvent(false);performClick();return true;}return true;}
  @Override public boolean performClick(){super.performClick();return true;}
 }
}
