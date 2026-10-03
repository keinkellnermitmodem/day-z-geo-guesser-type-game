import {clamp,fromUV,toUV,WORLD} from './core.js';
export class MapView {
 constructor(canvas,image,onPin,labels=[]){
  this.canvas=canvas;this.ctx=canvas.getContext('2d');this.image=image;this.onPin=onPin;this.labels=labels;this.center={u:.5,v:.5};this.zoom=1;this.pin=null;this.answer=null;this.locked=false;
  new ResizeObserver(()=>this.draw()).observe(canvas);
  let down=null;
  canvas.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,u:this.center.u,v:this.center.v,moved:false};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-down.x,dy=e.clientY-down.y;if(Math.hypot(dx,dy)>5)down.moved=true;if(down.moved){this.center.u=down.u-dx/this.size;this.center.v=down.v-dy/this.size;this.limit();this.draw();}});
  canvas.addEventListener('pointerup',e=>{if(down&&!down.moved&&!this.locked){const r=canvas.getBoundingClientRect();this.place(e.clientX-r.left,e.clientY-r.top);}down=null;});
  canvas.addEventListener('pointercancel',()=>down=null);
  canvas.addEventListener('wheel',e=>{e.preventDefault();const r=canvas.getBoundingClientRect();this.changeZoom(e.deltaY<0?1.2:1/1.2,e.clientX-r.left,e.clientY-r.top);},{passive:false});
  canvas.addEventListener('keydown',e=>{
   if(e.key==='+'||e.key==='='){e.preventDefault();this.changeZoom(1.4);return;}if(e.key==='-'){e.preventDefault();this.changeZoom(1/1.4);return;}
   if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)||this.locked)return;
   e.preventDefault();const p=this.pin||fromUV(this.center.u,this.center.v),step=(e.shiftKey?500:100)/this.zoom;
   if(e.key==='ArrowLeft')p.x-=step;if(e.key==='ArrowRight')p.x+=step;if(e.key==='ArrowUp')p.z+=step;if(e.key==='ArrowDown')p.z-=step;
   this.pin={x:Math.round(clamp(p.x,0,WORLD)),z:Math.round(clamp(p.z,0,WORLD))};this.draw();this.onPin(this.pin);
  });
 }
 limit(){this.center.u=clamp(this.center.u,0,1);this.center.v=clamp(this.center.v,0,1);}
 coords(u,v){return {x:this.w/2+(u-this.center.u)*this.size,y:this.h/2+(v-this.center.v)*this.size};}
 place(x,y){const u=(x-this.w/2)/this.size+this.center.u,v=(y-this.h/2)/this.size+this.center.v;if(u<0||u>1||v<0||v>1)return;this.pin=fromUV(u,v);this.draw();this.onPin(this.pin);}
 changeZoom(f,x=this.w/2,y=this.h/2){const u=(x-this.w/2)/this.size+this.center.u,v=(y-this.h/2)/this.size+this.center.v;this.zoom=clamp(this.zoom*f,1,10);this.size=Math.min(this.w,this.h)*this.zoom;this.center={u:u-(x-this.w/2)/this.size,v:v-(y-this.h/2)/this.size};this.limit();this.draw();}
 reset(){this.zoom=1;this.center={u:.5,v:.5};this.draw();}
 draw(){
  const r=this.canvas.getBoundingClientRect();if(!r.width||!r.height)return;const dpr=Math.min(devicePixelRatio||1,2);this.w=r.width;this.h=r.height;this.size=Math.min(this.w,this.h)*this.zoom;
  this.canvas.width=Math.round(this.w*dpr);this.canvas.height=Math.round(this.h*dpr);const c=this.ctx;c.setTransform(dpr,0,0,dpr,0,0);c.fillStyle='#1b2822';c.fillRect(0,0,this.w,this.h);
  const origin=this.coords(0,0);if(this.image.complete&&this.image.naturalWidth){c.filter='brightness(1.6) saturate(.62)';c.drawImage(this.image,origin.x,origin.y,this.size,this.size);c.filter='none';}
  c.strokeStyle='#d6e5c41f';c.lineWidth=1;for(let i=0;i<=8;i++){const t=i/8;const p=this.coords(t,t);c.beginPath();c.moveTo(p.x,origin.y);c.lineTo(p.x,origin.y+this.size);c.moveTo(origin.x,p.y);c.lineTo(origin.x+this.size,p.y);c.stroke();}
  for(const l of this.labels){if(this.zoom<1.4&&l.importance<3)continue;const p=this.coords(l.u,l.v);if(p.x<0||p.x>this.w||p.y<0||p.y>this.h)continue;c.font=`${this.zoom<1.5?9:11}px Arial`;c.textAlign='center';c.lineWidth=3;c.strokeStyle='#122018cc';c.strokeText(l.name,p.x,p.y);c.fillStyle='#e5e8d9';c.fillText(l.name,p.x,p.y);}
  if(this.pin&&this.answer){const a=this.coords(...Object.values(toUV(this.pin))),b=this.coords(...Object.values(toUV(this.answer)));c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.strokeStyle='#ffe1aa';c.lineWidth=2;c.setLineDash([5,5]);c.stroke();c.setLineDash([]);}
  const marker=(p,color,ring)=>{if(!p)return;const uv=toUV(p),pos=this.coords(uv.u,uv.v);c.beginPath();c.arc(pos.x,pos.y,ring?9:6,0,Math.PI*2);c.fillStyle=color;c.fill();c.strokeStyle='#152116';c.lineWidth=3;c.stroke();if(ring){c.beginPath();c.arc(pos.x,pos.y,3,0,Math.PI*2);c.fillStyle='#182517';c.fill();}};
  marker(this.pin,'#d3eb79',false);marker(this.answer,'#ffbe86',true);
  if(this.canvas.id==='guess-map'){const el=document.querySelector('#map-scale');el.textContent=`${Math.round(55/this.size*WORLD)} m`;}
 }
}
export class SceneViewer {
 constructor(canvas,flat){
  this.canvas=canvas;this.flat=flat;this.yaw=0;this.pitch=0;this.fov=80;this.mode='photo';this.gl=canvas.getContext('webgl',{antialias:true,alpha:false});this.texture=null;this.flatX=0;this.flatY=0;
  flat.tabIndex=0;flat.draggable=false;flat.style.touchAction='none';
  let flatDown;
  flat.addEventListener('pointerdown',e=>{flatDown={x:e.clientX,y:e.clientY,ox:this.flatX,oy:this.flatY};flat.setPointerCapture(e.pointerId);});
  flat.addEventListener('pointermove',e=>{if(!flatDown)return;this.flatX=flatDown.ox+e.clientX-flatDown.x;this.flatY=flatDown.oy+e.clientY-flatDown.y;this.draw();});
  flat.addEventListener('pointerup',()=>flatDown=null);flat.addEventListener('pointercancel',()=>flatDown=null);
  flat.addEventListener('wheel',e=>{e.preventDefault();this.zoom(e.deltaY>0?8:-8);},{passive:false});
  flat.addEventListener('keydown',e=>{if(['+','=','-','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();if(e.key==='+'||e.key==='=')this.zoom(-8);if(e.key==='-')this.zoom(8);if(e.key==='ArrowLeft')this.flatX+=30;if(e.key==='ArrowRight')this.flatX-=30;if(e.key==='ArrowUp')this.flatY+=30;if(e.key==='ArrowDown')this.flatY-=30;this.draw();}});
  if(this.gl){const g=this.gl,make=(type,src)=>{const s=g.createShader(type);g.shaderSource(s,src);g.compileShader(s);if(!g.getShaderParameter(s,g.COMPILE_STATUS))throw new Error(g.getShaderInfoLog(s));return s;};
   const vert=make(g.VERTEX_SHADER,'attribute vec2 p; varying vec2 v; void main(){v=p;gl_Position=vec4(p,0.,1.);}');
   const frag=make(g.FRAGMENT_SHADER,`precision highp float; varying vec2 v; uniform sampler2D tex; uniform float aspect,yaw,pitch,fov;
    void main(){vec3 d=normalize(vec3(v.x*aspect*fov,v.y*fov,1.));float y=d.y*cos(pitch)+d.z*sin(pitch);float z=-d.y*sin(pitch)+d.z*cos(pitch);float x=d.x*cos(yaw)+z*sin(yaw);z=-d.x*sin(yaw)+z*cos(yaw);vec2 uv=vec2(fract(atan(x,z)/6.28318530718+.5),.5-asin(clamp(y,-1.,1.))/3.14159265359);gl_FragColor=texture2D(tex,uv);}`);
   this.program=g.createProgram();g.attachShader(this.program,vert);g.attachShader(this.program,frag);g.linkProgram(this.program);if(!g.getProgramParameter(this.program,g.LINK_STATUS))throw new Error('Scene viewer unavailable');g.useProgram(this.program);
   const b=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,b);g.bufferData(g.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),g.STATIC_DRAW);const p=g.getAttribLocation(this.program,'p');g.enableVertexAttribArray(p);g.vertexAttribPointer(p,2,g.FLOAT,false,0,0);this.uniforms=Object.fromEntries(['aspect','yaw','pitch','fov'].map(x=>[x,g.getUniformLocation(this.program,x)]));
  }
  new ResizeObserver(()=>this.draw()).observe(canvas);
  let down;
  canvas.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,yaw:this.yaw,pitch:this.pitch};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!down)return;this.yaw=down.yaw-(e.clientX-down.x)*.004;this.pitch=clamp(down.pitch+(e.clientY-down.y)*.004,-1.3,1.3);this.draw();});
  canvas.addEventListener('pointerup',()=>down=null);canvas.addEventListener('pointercancel',()=>down=null);
  canvas.addEventListener('wheel',e=>{e.preventDefault();this.zoom(e.deltaY>0?8:-8);},{passive:false});
  canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')this.yaw-=.12;if(e.key==='ArrowRight')this.yaw+=.12;if(e.key==='ArrowUp')this.pitch+=.1;if(e.key==='ArrowDown')this.pitch-=.1;if(e.key==='+'||e.key==='=')this.zoom(-8);if(e.key==='-')this.zoom(8);this.pitch=clamp(this.pitch,-1.3,1.3);this.draw();}});
 }
 async load(location){
  const request=Symbol();this.request=request;this.mode=location.type;this.yaw=0;this.pitch=0;this.fov=80;this.flatX=0;this.flatY=0;this.canvas.hidden=true;this.flat.hidden=true;
  const im=new Image();im.src=location.image;await im.decode();if(this.request!==request)return false;
  if(location.type!=='panorama'||!this.gl){this.flat.src=location.image;this.flat.hidden=false;this.draw();return true;}
  const g=this.gl;let source=im,max=Math.min(g.getParameter(g.MAX_TEXTURE_SIZE),8192);if(im.width>max||im.height>max){const small=document.createElement('canvas');const ratio=max/Math.max(im.width,im.height);small.width=Math.round(im.width*ratio);small.height=Math.round(im.height*ratio);small.getContext('2d').drawImage(im,0,0,small.width,small.height);source=small;}
  if(this.texture)g.deleteTexture(this.texture);this.texture=g.createTexture();g.bindTexture(g.TEXTURE_2D,this.texture);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_S,g.CLAMP_TO_EDGE);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_T,g.CLAMP_TO_EDGE);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MAG_FILTER,g.LINEAR);g.texImage2D(g.TEXTURE_2D,0,g.RGBA,g.RGBA,g.UNSIGNED_BYTE,source);this.canvas.hidden=false;this.draw();return true;
 }
 zoom(delta){this.fov=clamp(this.fov+delta,35,100);this.draw();}
 reset(){this.yaw=0;this.pitch=0;this.fov=80;this.flatX=0;this.flatY=0;this.draw();}
 draw(){if(!this.flat.hidden){const scale=Math.max(1,80/this.fov),maxX=this.flat.clientWidth*(scale-1)/2,maxY=this.flat.clientHeight*(scale-1)/2;this.flatX=clamp(this.flatX,-maxX,maxX);this.flatY=clamp(this.flatY,-maxY,maxY);this.flat.style.transform=`translate(${this.flatX}px,${this.flatY}px) scale(${scale})`;return;}if(!this.gl||this.canvas.hidden||!this.texture)return;const g=this.gl,r=this.canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.5);if(!r.width||!r.height)return;this.canvas.width=Math.round(r.width*dpr);this.canvas.height=Math.round(r.height*dpr);g.viewport(0,0,this.canvas.width,this.canvas.height);g.useProgram(this.program);g.uniform1f(this.uniforms.aspect,r.width/r.height);g.uniform1f(this.uniforms.yaw,this.yaw);g.uniform1f(this.uniforms.pitch,this.pitch);g.uniform1f(this.uniforms.fov,Math.tan(this.fov*Math.PI/360));g.drawArrays(g.TRIANGLE_STRIP,0,4);}
}
