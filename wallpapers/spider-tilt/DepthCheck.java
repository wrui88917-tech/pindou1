import com.pindou.spidertilt.DepthMath;
import com.pindou.spidertilt.MotionMath;

public final class DepthCheck {
 static void require(boolean yes,String message){if(!yes)throw new AssertionError(message);}
 static float cross(float ax,float ay,float bx,float by,float cx,float cy){return(bx-ax)*(cy-ay)-(by-ay)*(cx-ax);}
 static boolean inside(float x,float y,float[] p,int[] corners){float sign=0;for(int i=0;i<4;i++){int a=corners[i]*2,b=corners[(i+1)%4]*2;float c=cross(p[a],p[a+1],p[b],p[b+1],x,y);if(i==0)sign=c;else if(sign*c<0)return false;}return true;}
 public static void main(String[] args){
  float[] out=new float[3];MotionMath.relative(new float[]{0,0,0,1},new float[]{0,0,0,1},out);for(float v:out)require(Math.abs(v)<.0001f,"Calibration");
  int columns=48,rows=96,poses=0;float[] p=new float[(columns+1)*(rows+1)*2];int[] corners={0,columns,rows*(columns+1)+columns,rows*(columns+1)};
  for(int[] size:new int[][]{{1440,3120},{1440,2560},{1080,1920},{1920,1080}})for(int preset=0;preset<3;preset++)for(int x=-3;x<=3;x++)for(int y=-3;y<=3;y++){
   DepthMath.project(942,2048,size[0],size[1],x*.25f,y*.22f,x*.06f,preset,columns,rows,p);for(float v:p)require(Float.isFinite(v),"Finite projection");
   for(int j=0;j<rows;j++)for(int i=0;i<columns;i++){int a=(j*(columns+1)+i)*2,b=a+2,c=a+(columns+1)*2;require(cross(p[a],p[a+1],p[b],p[b+1],p[c],p[c+1])>0,"Folded photo mesh");}
   for(float[] corner:new float[][]{{0,0},{size[0],0},{size[0],size[1]},{0,size[1]}})require(inside(corner[0],corner[1],p,corners),"Exposed photo edge");poses++;
  }
  require(Math.abs(DepthMath.depth(.66f,.5f,0)-.94f)<.0001f,"Face depth plateau");
  require(Math.abs(DepthMath.depth(.5f,.5f,2)-.45f)<.0001f,"Flat preset");
  System.out.println("PASS: "+poses+" poses; photo mesh finite, no folds, no exposed viewport corners; head plateau and flat preset");
 }
}
