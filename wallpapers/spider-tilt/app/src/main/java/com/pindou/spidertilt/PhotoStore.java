package com.pindou.spidertilt;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.media.ExifInterface;
import android.net.Uri;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.IOException;

final class PhotoStore {
 private static Bitmap cached;private static long cachedVersion=-1;
 static File file(Context c){return new File(c.getFilesDir(),"wallpaper-photo.bin");}
 static boolean hasPhoto(Context c){return file(c).isFile();}
 static synchronized Bitmap get(Context c){long version=c.getSharedPreferences("wallpaper",Context.MODE_PRIVATE).getLong("photoVersion",0);if(cached!=null&&cachedVersion==version)return cached;if(!file(c).isFile())return null;try{cached=decode(file(c));cachedVersion=version;}catch(IOException e){return null;}return cached;}
 static Bitmap decode(File f)throws IOException{
  BitmapFactory.Options bounds=new BitmapFactory.Options();bounds.inJustDecodeBounds=true;BitmapFactory.decodeFile(f.getPath(),bounds);if(bounds.outWidth<200||bounds.outHeight<200)throw new IOException("请使用清晰的 JPG、PNG 或 WebP 原图");
  int sample=1;while(bounds.outWidth/sample>4096||bounds.outHeight/sample>4096||(long)(bounds.outWidth/sample)*(bounds.outHeight/sample)>6000000L)sample*=2;
  BitmapFactory.Options options=new BitmapFactory.Options();options.inSampleSize=sample;options.inPreferredConfig=Bitmap.Config.ARGB_8888;Bitmap bitmap=BitmapFactory.decodeFile(f.getPath(),options);if(bitmap==null)throw new IOException("这张图片无法读取，请换用 JPG 或 PNG");
  try(InputStream in=new FileInputStream(f)){int orientation=new ExifInterface(in).getAttributeInt(ExifInterface.TAG_ORIENTATION,ExifInterface.ORIENTATION_NORMAL);Matrix m=new Matrix();switch(orientation){case 2:m.setScale(-1,1);break;case 3:m.setRotate(180);break;case 4:m.setScale(1,-1);break;case 5:m.setRotate(90);m.postScale(-1,1);break;case 6:m.setRotate(90);break;case 7:m.setRotate(270);m.postScale(-1,1);break;case 8:m.setRotate(270);break;default:break;}if(!m.isIdentity())bitmap=Bitmap.createBitmap(bitmap,0,0,bitmap.getWidth(),bitmap.getHeight(),m,true);}catch(IOException unsupportedExif){}
  return bitmap;
 }
 static void importPhoto(Context context,Uri uri)throws IOException{
  File temporary=new File(context.getFilesDir(),"wallpaper-import.tmp");try{
   try(InputStream in=context.getContentResolver().openInputStream(uri);FileOutputStream out=new FileOutputStream(temporary)){if(in==null)throw new IOException("未能读取所选图片");byte[] buffer=new byte[32768];int n;long total=0;while((n=in.read(buffer))!=-1){total+=n;if(total>64L*1024*1024)throw new IOException("请选择 64MB 以内的原图");out.write(buffer,0,n);}out.getFD().sync();}
   Bitmap bitmap=decode(temporary);if(!temporary.renameTo(file(context)))throw new IOException("保存图片失败，请重试");long version=System.currentTimeMillis();synchronized(PhotoStore.class){cached=bitmap;cachedVersion=version;}context.getSharedPreferences("wallpaper",Context.MODE_PRIVATE).edit().putLong("photoVersion",version).apply();
  }finally{if(temporary.exists())temporary.delete();}
 }
}
