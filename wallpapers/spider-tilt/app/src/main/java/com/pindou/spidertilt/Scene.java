package com.pindou.spidertilt;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.Random;

/** Real perspective-projected geometry. No images, network, WebView or video loop. */
public final class Scene {
 public static final int RED=0xffce293f,BLUE=0xff164875,INK=0xff0a1426,WHITE=0xffe6f7ff;
 public static final class Primitive {
  public final float[] world;public final float[] xy;public final int color;public final float width;
  public float depth;public boolean visible;
  Primitive(float[] world,int color,float width){this.world=world;this.xy=new float[world.length/3*2];this.color=color;this.width=width;}
  public boolean isLine(){return width>0;}
 }
 private final ArrayList<Primitive> source=new ArrayList<Primitive>();
 private Primitive[] sorted;
 public Scene(){buildCity();buildHero();sorted=source.toArray(new Primitive[source.size()]);}
 private static float[] p(float x,float y,float z){return new float[]{x,y,z};}
 private static float[] lerp(float[] a,float[] b,float t){return p(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t);}
 private static int shade(int color,float x,float y,float z){float length=(float)Math.sqrt(x*x+y*y+z*z);if(length<.00001f)length=1;float light=.38f+.62f*Math.max(0,(-.40f*x+.65f*y+.64f*z)/length);float rim=.12f*(1-Math.abs(z)/length);int r=(int)(((color>>16)&255)*light),g=(int)(((color>>8)&255)*light+rim*30),b=(int)((color&255)*light+rim*80);return 0xff000000|(Math.min(r,255)<<16)|(Math.min(g,255)<<8)|Math.min(b,255);}
 private void tri(float[] a,float[] b,float[] d,int color,boolean lit){
  float ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=d[0]-a[0],vy=d[1]-a[1],vz=d[2]-a[2];
  int col=lit?shade(color,uy*vz-uz*vy,uz*vx-ux*vz,ux*vy-uy*vx):color;
  source.add(new Primitive(new float[]{a[0],a[1],a[2],b[0],b[1],b[2],d[0],d[1],d[2]},col,0));
 }
 private void quad(float[] a,float[] b,float[] c,float[] d,int color,boolean lit){tri(a,b,c,color,lit);tri(a,c,d,color,lit);}
 private void line(float[] a,float[] b,int color,float width){source.add(new Primitive(new float[]{a[0],a[1],a[2],b[0],b[1],b[2]},color,width));}
 private void box(float x,float y,float z,float w,float h,float depth,int color){
  float l=x-w/2,r=x+w/2,b=y-h/2,t=y+h/2,f=z+depth/2,k=z-depth/2;
  quad(p(l,b,f),p(r,b,f),p(r,t,f),p(l,t,f),color,true);quad(p(r,b,k),p(l,b,k),p(l,t,k),p(r,t,k),color,true);
  quad(p(l,b,k),p(l,b,f),p(l,t,f),p(l,t,k),color,true);quad(p(r,b,f),p(r,b,k),p(r,t,k),p(r,t,f),color,true);
  quad(p(l,t,f),p(r,t,f),p(r,t,k),p(l,t,k),color,true);quad(p(l,b,k),p(r,b,k),p(r,b,f),p(l,b,f),color,true);
 }
 private float[] spherePoint(float x,float y,float z,float rx,float ry,float rz,float latitude,float longitude){float cp=(float)Math.cos(latitude);return p(x+rx*cp*(float)Math.cos(longitude),y+ry*(float)Math.sin(latitude),z+rz*cp*(float)Math.sin(longitude));}
 private void ellipsoid(float x,float y,float z,float rx,float ry,float rz,int color,int columns,int rows){
  for(int j=0;j<rows;j++){float a=(float)(-Math.PI/2+Math.PI*j/rows),b=(float)(-Math.PI/2+Math.PI*(j+1)/rows);
   for(int i=0;i<columns;i++){float u=(float)(2*Math.PI*i/columns),v=(float)(2*Math.PI*(i+1)/columns);
    float[] p00=spherePoint(x,y,z,rx,ry,rz,a,u),p10=spherePoint(x,y,z,rx,ry,rz,b,u),p01=spherePoint(x,y,z,rx,ry,rz,a,v),p11=spherePoint(x,y,z,rx,ry,rz,b,v);
    tri(p00,p10,p01,color,true);tri(p10,p11,p01,color,true);
   }
  }
 }
 private void limb(float[] a,float[] b,float radius,int color,boolean web){
  float dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],len=(float)Math.sqrt(dx*dx+dy*dy+dz*dz);float[] axis=p(dx/len,dy/len,dz/len);
  float[] side=p(axis[1],-axis[0],0);float sl=(float)Math.sqrt(side[0]*side[0]+side[1]*side[1]);if(sl<.001f){side=p(1,0,0);sl=1;}side[0]/=sl;side[1]/=sl;
  float[] cross=p(axis[1]*side[2]-axis[2]*side[1],axis[2]*side[0]-axis[0]*side[2],axis[0]*side[1]-axis[1]*side[0]);
  float[] mid=lerp(a,b,.5f);int cols=10,rows=6;float[][][] points=new float[rows+1][cols+1][];
  for(int j=0;j<=rows;j++){float phi=(float)(-Math.PI/2+Math.PI*j/rows),along=(float)Math.sin(phi)*(len*.5f+radius*.1f),r=(float)Math.cos(phi)*radius;
   for(int i=0;i<=cols;i++){float theta=(float)(2*Math.PI*i/cols),s=(float)Math.cos(theta)*r,t=(float)Math.sin(theta)*r;points[j][i]=p(mid[0]+axis[0]*along+side[0]*s+cross[0]*t,mid[1]+axis[1]*along+side[1]*s+cross[1]*t,mid[2]+axis[2]*along+side[2]*s+cross[2]*t);}
  }
  for(int j=0;j<rows;j++)for(int i=0;i<cols;i++){tri(points[j][i],points[j+1][i],points[j][i+1],color,true);tri(points[j+1][i],points[j+1][i+1],points[j][i+1],color,true);}
  if(web){for(int j=1;j<rows;j++)for(int i=0;i<cols;i++)line(points[j][i],points[j][i+1],0xff351b2b,.006f);for(int i=0;i<cols;i+=2)for(int j=0;j<rows;j++)line(points[j][i],points[j+1][i],0xff351b2b,.006f);}
 }
 private void buildCity(){
  Random r=new Random(1983);
  for(int i=0;i<24;i++){
   float x=(r.nextFloat()-.5f)*32,z=-5-r.nextFloat()*21,h=3+r.nextFloat()*12,w=.8f+r.nextFloat()*1.5f,depth=.7f+r.nextFloat()*1.0f;
   int col=i%3==0?0xff25445e:0xff182c46;box(x,-4+h/2,z,w,h,depth,col);
   int floors=(int)(h/.5f);for(int row=0;row<floors;row++)for(int column=0;column<3;column++)if(r.nextFloat()>.48f){float wx=x-w*.32f+column*w*.32f,wy=-3.7f+row*.48f,sz=.035f,wz=z+depth/2+.01f;int light=r.nextFloat()>.3f?0xffd7b17a:0xff74b7d7;quad(p(wx-.032f,wy-.08f,wz),p(wx+.032f,wy-.08f,wz),p(wx+.032f,wy+.08f,wz),p(wx-.032f,wy+.08f,wz),light,false);}
   if(i%6==0)line(p(x,-4+h,z),p(x,-3+h,z),0xff5584a0,.016f);
  }
  box(0,-2.0f,.05f,5.3f,.6f,3.6f,0xff263848);box(0,-1.69f,.05f,5.5f,.10f,3.75f,0xff53707f);
  // Architectural strips reinforce perspective and the near/far depth separation.
  for(int i=-5;i<=5;i++)line(p(i*.48f,-1.63f,-1.7f),p(i*.48f,-1.63f,1.9f),0xff718f9b,.012f);
  line(p(-2.75f,-1.62f,1.93f),p(2.75f,-1.62f,1.93f),0xff86c7df,.025f);
 }
 private void buildHero(){
  // Stylized, sculpted classic suit, genuinely volumetric rather than a cutout.
  limb(p(-.26f,-.33f,0),p(-1.02f,-.65f,.25f),.30f,BLUE,false);
  limb(p(-1.02f,-.65f,.25f),p(-1.28f,-1.36f,.55f),.23f,BLUE,false);
  limb(p(.18f,-.36f,-.03f),p(.90f,-.48f,.50f),.31f,BLUE,false);
  limb(p(.90f,-.48f,.50f),p(.38f,-1.32f,.95f),.23f,BLUE,false);
  limb(p(-1.22f,-1.08f,.50f),p(-1.30f,-1.48f,.62f),.24f,RED,true);
  limb(p(.57f,-1.03f,.78f),p(.34f,-1.49f,1.0f),.24f,RED,true);
  ellipsoid(-1.36f,-1.49f,.74f,.33f,.15f,.43f,RED,12,6);ellipsoid(.27f,-1.49f,1.12f,.31f,.15f,.44f,RED,12,6);
  ellipsoid(-.04f,-.29f,.02f,.47f,.36f,.34f,BLUE,12,6);
  ellipsoid(.02f,.46f,.03f,.45f,.76f,.31f,RED,16,10);
  ellipsoid(-.31f,.39f,.07f,.16f,.50f,.27f,BLUE,10,6);ellipsoid(.38f,.39f,.04f,.14f,.48f,.27f,BLUE,10,6);
  ellipsoid(.30f,1.18f,.03f,.23f,.26f,.22f,RED,12,6);
  ellipsoid(-.43f,.91f,.04f,.29f,.31f,.30f,RED,12,6);ellipsoid(.49f,.91f,.04f,.28f,.31f,.29f,RED,12,6);
  limb(p(-.47f,.86f,.07f),p(-1.03f,.05f,.40f),.235f,BLUE,false);
  limb(p(-1.03f,.05f,.40f),p(-1.44f,-1.16f,1.02f),.19f,RED,true);
  ellipsoid(-1.47f,-1.24f,1.05f,.19f,.20f,.16f,RED,10,6);
  for(int i=0;i<4;i++)limb(p(-1.62f+i*.08f,-1.29f,1.08f),p(-1.65f+i*.09f,-1.58f,1.18f),.038f,RED,false);
  limb(p(-1.32f,-1.21f,1.08f),p(-1.19f,-1.41f,1.14f),.055f,RED,false);
  limb(p(.56f,.89f,.03f),p(1.13f,.38f,.03f),.23f,BLUE,false);
  limb(p(1.13f,.38f,.03f),p(1.22f,1.12f,.39f),.18f,RED,true);
  ellipsoid(1.22f,1.24f,.42f,.17f,.19f,.15f,RED,10,6);
  limb(p(1.10f,1.35f,.43f),p(1.10f,1.64f,.42f),.040f,RED,false);limb(p(1.34f,1.35f,.43f),p(1.40f,1.58f,.41f),.036f,RED,false);
  limb(p(1.18f,1.31f,.55f),p(1.17f,1.18f,.59f),.05f,RED,false);limb(p(1.27f,1.31f,.55f),p(1.27f,1.18f,.59f),.05f,RED,false);
  // Head, mask webbing and convex white eye lenses.
  float hx=.34f,hy=1.69f,hz=.08f;ellipsoid(hx,hy,hz,.43f,.54f,.43f,RED,24,16);
  for(int j=-3;j<=3;j++){float phi=j*.22f;for(int i=0;i<48;i++)line(spherePoint(hx,hy,hz,.434f,.544f,.434f,phi,(float)(i*Math.PI/24)),spherePoint(hx,hy,hz,.434f,.544f,.434f,phi,(float)((i+1)*Math.PI/24)),0xff39172a,.006f);}
  for(int i=0;i<12;i++){float theta=(float)(i*Math.PI/6);for(int j=0;j<20;j++)line(spherePoint(hx,hy,hz,.434f,.544f,.434f,(float)(-1.5+j*.15),theta),spherePoint(hx,hy,hz,.434f,.544f,.434f,(float)(-1.5+(j+1)*.15),theta),0xff39172a,.006f);}
  float[][] eye={{-.34f,.16f},{-.06f,.015f},{-.10f,-.14f},{-.20f,-.20f},{-.29f,-.13f}};
  for(int side:new int[]{-1,1}){eyePatch(eye,side,1.11f,INK);eyePatch(eye,side,.87f,WHITE);}
  // Chest web follows the front convex surface, not a flat texture.
  for(int row=0;row<6;row++){float y=-.05f+row*.19f;for(int i=0;i<12;i++){float x=-.31f+i*.052f,x2=x+.052f;line(chest(x,y),chest(x2,y+.012f*(float)Math.sin(i)),0xff521a31,.007f);}}
  for(float x:new float[]{-.22f,-.11f,0,.11f,.22f})for(int j=0;j<10;j++)line(chest(x,.0f+j*.1f),chest(x,.1f+j*.1f),0xff521a31,.007f);
  ellipsoid(.02f,.55f,.363f,.065f,.12f,.015f,INK,10,6);ellipsoid(.02f,.69f,.356f,.043f,.047f,.014f,INK,10,6);
  for(int sign:new int[]{-1,1})for(int i=0;i<4;i++){float y=.67f-i*.08f;line(p(.02f+sign*.04f,y,.38f),p(.02f+sign*.16f,y+.10f-i*.04f,.36f),INK,.018f);line(p(.02f+sign*.16f,y+.10f-i*.04f,.36f),p(.02f+sign*.24f,y+.20f-i*.08f,.33f),INK,.014f);}
  // A real 3D web strand extends upward into the city; multiple fibres catch the light.
  for(int i=0;i<3;i++)line(p(1.22f+i*.012f,1.31f,.57f),p(5.4f+i*.012f,10f,-3.5f),0xffa1c4d4,.009f);
 }
 private float[] chest(float x,float y){float z=.03f+.317f*(float)Math.sqrt(Math.max(.02f,1-x*x/(.45f*.45f)-(y-.46f)*(y-.46f)/(.76f*.76f)));return p(x+.02f,y,z+.015f);}
 private float[] eyeSurface(float x,float y,int color){float offset=color==WHITE?.065f:.045f;float z=.08f+.43f*(float)Math.sqrt(Math.max(.01f,1-x*x/(.43f*.43f)-y*y/(.54f*.54f)))+offset;return p(.34f+x,1.69f+y,z);}
 private void eyePatch(float[][] shape,int side,float scale,int color){
  float cx=-.198f,cy=-.02f;float[][] vertices=new float[shape.length][];for(int i=0;i<shape.length;i++){float x=(cx+(shape[i][0]-cx)*scale)*side,y=cy+(shape[i][1]-cy)*scale;vertices[i]=p(x,y,0);}
  // Subdivide on the mask surface: a single planar polygon would sink into the curved head.
  for(int edge=0;edge<vertices.length;edge++){float[] a=p(cx*side,cy,0),b=vertices[edge],c=vertices[(edge+1)%vertices.length];int n=5;
   for(int row=0;row<n;row++)for(int col=0;col<n-row;col++){
    float[] u=eyeUV(a,b,c,row,col,n),v=eyeUV(a,b,c,row+1,col,n),w=eyeUV(a,b,c,row,col+1,n);
    tri(eyeSurface(u[0],u[1],color),eyeSurface(v[0],v[1],color),eyeSurface(w[0],w[1],color),color,false);
    if(row+col<n-1){float[] z=eyeUV(a,b,c,row+1,col+1,n);tri(eyeSurface(v[0],v[1],color),eyeSurface(z[0],z[1],color),eyeSurface(w[0],w[1],color),color,false);}
   }
  }
 }
 private static float[] eyeUV(float[] a,float[] b,float[] c,int row,int col,int n){float u=row/(float)n,v=col/(float)n;return p(a[0]*(1-u-v)+b[0]*u+c[0]*v,a[1]*(1-u-v)+b[1]*u+c[1]*v,0);}
 public Primitive[] project(int width,int height,float yaw,float pitch,float roll){
  yaw=MotionMath.clamp(yaw,.70f);pitch=MotionMath.clamp(pitch,.52f);roll=MotionMath.clamp(roll,.18f);
  float cy=(float)Math.cos(yaw),sy=(float)Math.sin(yaw),cx=(float)Math.cos(pitch),sx=(float)Math.sin(pitch),cr=(float)Math.cos(roll),sr=(float)Math.sin(roll);
  float focal=Math.min(width*1.60f,height*.85f),originX=width*.50f,originY=height*.58f;
  for(Primitive prim:sorted){float sum=0;prim.visible=true;for(int i=0,j=0;i<prim.world.length;i+=3,j+=2){float x=prim.world[i],y=prim.world[i+1],z=prim.world[i+2];float tx=x*cy+z*sy,tz=-x*sy+z*cy,ty=y*cx-tz*sx;tz=y*sx+tz*cx;float xx=tx*cr-ty*sr,yy=tx*sr+ty*cr,depth=7.2f-tz;
    if(depth<.5f){prim.visible=false;depth=.5f;}prim.xy[j]=originX+xx*focal/depth;prim.xy[j+1]=originY-yy*focal/depth;sum+=depth;
   }prim.depth=sum/(prim.world.length/3);
  }
  Arrays.sort(sorted,new Comparator<Primitive>(){public int compare(Primitive a,Primitive b){return Float.compare(b.depth,a.depth);}});return sorted;
 }
 public int size(){return sorted.length;}
}
