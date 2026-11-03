package com.pindou.spidertilt;

/** Bounded photographic depth; does not reconstruct hidden geometry. */
public final class DepthMath {
 private DepthMath(){}
 private static float volume(float u,float v,float cx,float cy,float rx,float ry,float angle){float dx=u-cx,dy=v-cy,c=(float)Math.cos(angle),s=(float)Math.sin(angle),x=(c*dx+s*dy)/rx,y=(-s*dx+c*dy)/ry,r=(float)Math.sqrt(x*x+y*y),t=Math.max(0,Math.min(1,(r-.72f)/.38f));return 1-t*t*(3-2*t);}
 public static float depth(float u,float v,int preset){if(preset==2)return .45f;float body;if(preset==1)body=volume(u,v,.5f,.49f,.31f,.36f,0);else{body=Math.max(volume(u,v,.66f,.50f,.335f,.155f,-.22f),volume(u,v,.285f,.385f,.21f,.25f,-.18f));body=Math.max(body,volume(u,v,.12f,.205f,.115f,.15f,-.37f)*.8f);body=Math.max(body,volume(u,v,.69f,.70f,.10f,.16f,-.65f));body=Math.max(body,volume(u,v,.85f,.825f,.08f,.10f,-.3f));}float far=.16f+.20f*v;return far+(.94f-far)*body;}
 public static void project(int imageW,int imageH,int w,int h,float yaw,float pitch,float roll,int preset,int columns,int rows,float[] out){
  float scale=Math.max(w/(float)imageW,h/(float)imageH)*1.105f,coverW=imageW*scale,coverH=imageH*scale,left=(w-coverW)/2,top=(h-coverH)/2;
  float x=MotionMath.clamp(yaw/.7f,1),y=MotionMath.clamp(pitch/.65f,1),angle=MotionMath.clamp(roll,.18f)*.06f,c=(float)Math.cos(angle),s=(float)Math.sin(angle);
  for(int j=0;j<=rows;j++)for(int i=0;i<=columns;i++){float u=i/(float)columns,v=j/(float)rows,d=depth(u,v,preset),px=left+u*coverW+x*w*(.006f+.024f*(d-.36f)),py=top+v*coverH+y*h*(.004f+.014f*(d-.36f)),dx=px-w*.5f,dy=py-h*.5f;int k=(j*(columns+1)+i)*2;out[k]=w*.5f+c*dx-s*dy;out[k+1]=h*.5f+s*dx+c*dy;}
 }
}
