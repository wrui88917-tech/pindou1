import com.pindou.spidertilt.Scene;
import com.pindou.spidertilt.MotionMath;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Locale;

/** Runs the actual Android app's pure-Java geometry and sensor math, not a separate illustration. */
public final class PreviewCheck {
 static void require(boolean condition,String message){if(!condition)throw new AssertionError(message);}
 static void near(float a,float b){require(Math.abs(a-b)<.0001f,"Expected "+a+" ~= "+b);}
 static float[] quat(float angle,int axis){float[] q={0,0,0,(float)Math.cos(angle/2)};q[axis]=(float)Math.sin(angle/2);return q;}
 static String rgb(int color){return String.format(Locale.ROOT,"#%06x",color&0xffffff);}
 static String svg(Scene scene,int w,int h,float yaw,float pitch,float roll){StringBuilder s=new StringBuilder();s.append("<svg xmlns='http://www.w3.org/2000/svg' width='").append(w).append("' height='").append(h).append("' viewBox='0 0 ").append(w).append(" ").append(h).append("'><defs><linearGradient id='sky' x2='0' y2='1'><stop stop-color='#020713'/><stop offset='.5' stop-color='#0d2540'/><stop offset='1' stop-color='#050c18'/></linearGradient><radialGradient id='glow'><stop stop-color='#4383a7' stop-opacity='.35'/><stop offset='1' stop-color='#12263c' stop-opacity='0'/></radialGradient></defs><rect width='100%' height='100%' fill='url(#sky)'/><ellipse cx='1100' cy='800' rx='1100' ry='1100' fill='url(#glow)'/><circle cx='").append(w*.81f-yaw*18).append("' cy='").append(h*.18f+pitch*12).append("' r='").append(w*.026f).append("' fill='#bfd0d1'/>");
  for(Scene.Primitive p:scene.project(w,h,yaw,pitch,roll)){if(!p.visible)continue;s.append("<path d='M");for(int i=0;i<p.xy.length;i+=2){if(i>0)s.append('L');s.append(String.format(Locale.ROOT,"%.2f,%.2f",p.xy[i],p.xy[i+1]));}if(!p.isLine())s.append('Z');s.append("' ");if(p.isLine())s.append("fill='none' stroke='").append(rgb(p.color)).append("' stroke-width='").append(Math.max(.65f,p.width*w*1.6f/p.depth)).append("' stroke-linecap='round'");else s.append("fill='").append(rgb(p.color)).append("'");s.append("/>");}
  s.append("</svg>");return s.toString();
 }
 public static void main(String[] args)throws Exception{
  float[] out=new float[3],identity={0,0,0,1};MotionMath.relative(identity,identity,out);for(float x:out)near(x,0);
  MotionMath.relative(identity,quat(.3f,1),out);near(out[0],.3f);near(out[1],0);
  float[] arbitrary=quat(.7f,0);MotionMath.relative(arbitrary,arbitrary,out);for(float x:out)near(x,0);
  MotionMath.relative(identity,new float[]{0,0,0,-1},out);for(float x:out)near(x,0);
  MotionMath.relative(identity,quat(2.0f,1),out);near(out[0],.85f);
  Scene scene=new Scene();require(scene.size()>1000,"3D model missing");int poses=0;
  for(int w:new int[]{720,1080,1440})for(int j=-3;j<=3;j++)for(int k=-3;k<=3;k++){
   float lastDepth=Float.POSITIVE_INFINITY;for(Scene.Primitive p:scene.project(w,(int)(w*2.167f),j*.23f,k*.17f,j*.06f)){require(p.depth<=lastDepth+.0001f,"Depth sorting");lastDepth=p.depth;for(float xy:p.xy)require(Float.isFinite(xy),"Projection not finite");}poses++;
  }
  Files.createDirectories(Paths.get("previews"));String[] names={"center","left","right"};float[] angles={0,-.42f,.42f};for(int i=0;i<3;i++)Files.write(Paths.get("previews/"+names[i]+".svg"),svg(scene,1440,3120,angles[i],i==0?0:.12f,0).getBytes(StandardCharsets.UTF_8));
  require(!svg(scene,1440,3120,-.3f,0,0).equals(svg(scene,1440,3120,.3f,0,0)),"Tilt must change perspective");
  System.out.println("PASS: quaternion calibration, axes, sign equivalence, bounds; "+poses+" 3D poses; "+scene.size()+" scene primitives; 1440x3120 previews");
 }
}
