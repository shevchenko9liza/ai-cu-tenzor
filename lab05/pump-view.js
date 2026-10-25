/* Stylized interactive pump geometry. No manufacturer CAD, physics or telemetry. */
(function(){
'use strict';
window.mountPumpView=function(host,onSelect){
 const T=window.THREE;if(!host)return()=>{};if(!T){host.innerHTML='<div class="model-fallback">3D-библиотека недоступна. Выберите узел кнопками ниже.</div>';return()=>{};}
 let renderer,raf,disposed=false;
 try{renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}catch(e){host.innerHTML='<div class="model-fallback">3D недоступно в этом браузере.<br>Выберите узел кнопками ниже — показатели и рабочий сценарий доступны.</div>';return()=>{};}
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.5;host.prepend(renderer.domElement);renderer.domElement.setAttribute('aria-label','Интерактивная 3D-схема насосного агрегата. Вращение мышью или стрелками, плюс и минус для масштаба. Узлы также доступны кнопками под моделью.');renderer.domElement.setAttribute('role','img');renderer.domElement.tabIndex=0;
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(35,1,.1,100),root=new T.Group();scene.add(root);root.rotation.y=-.17;
 scene.add(new T.HemisphereLight(0xc7fff1,0x223146,2.2));
 const key=new T.DirectionalLight(0xffffff,4.1);key.position.set(2,6,7);scene.add(key);const rim=new T.DirectionalLight(0x4cf4c1,4);rim.position.set(-5,2,-4);scene.add(rim);const blue=new T.DirectionalLight(0x9c96ff,3);blue.position.set(5,3,-1);scene.add(blue);
 const mat=(color,metal=.65,rough=.3)=>new T.MeshStandardMaterial({color,metalness:metal,roughness:rough});
 const steel=mat(0x9bacb9,.8,.24),dark=mat(0x243e4c,.76,.28),mint=mat(0x3caa9c,.66,.3),silver=mat(0xe2edf2,.82,.17),bolt=mat(0x263a44,.7,.3),amber=mat(0xf4b45f,.55,.25);amber.emissive=new T.Color(0xcb6e13);amber.emissiveIntensity=.24;const gold=mat(0xb98b4b,.76,.24);
 const groups={motor:new T.Group(),coupling:new T.Group(),bearing:new T.Group(),pump:new T.Group()};Object.entries(groups).forEach(([k,g])=>{g.userData.part=k;root.add(g);});const meshes=[];
 function mesh(geo,m,x,y,z,g){const o=new T.Mesh(geo,m);o.position.set(x,y,z);(g||root).add(o);if(g){o.userData.part=g.userData.part;meshes.push(o);}return o;}
 function cyl(x,y,z,r,len,m,g,vertical=false){const o=mesh(new T.CylinderGeometry(r,r,len,48,1,false),m,x,y,z,g);if(!vertical)o.rotation.z=Math.PI/2;return o;}
 function box(x,y,z,w,h,d,m,g){return mesh(new T.BoxGeometry(w,h,d),m,x,y,z,g);}
 function torus(x,y,z,r,t,m,g){const o=mesh(new T.TorusGeometry(r,t,10,64),m,x,y,z,g);o.rotation.y=Math.PI/2;return o;}
 function screws(x,r,n,g){for(let i=0;i<n;i++){let a=i/n*Math.PI*2;cyl(x,Math.sin(a)*r,Math.cos(a)*r,.045,.10,bolt,g);}}
 // Shared base and feet.
 box(0,-1.0,0,7.1,.19,2.05,dark);box(0,-.89,0,6.9,.035,1.92,steel);
 for(const x of [-2.3,-1.5,1.0,2.4]){box(x,-.68,0,.24,.43,1.12,dark);for(const z of [-.55,.55])cyl(x,-.75,z,.09,.08,silver,null,true);}
 // Motor: cylinder, cooling ribs, terminal box, rear ventilation guard.
 const gm=groups.motor;cyl(-2.15,0,0,.63,1.6,steel,gm);cyl(-3.03,0,0,.64,.18,dark,gm);cyl(-1.28,0,0,.65,.15,silver,gm);
 for(let i=0;i<24;i++){const a=i/24*Math.PI*2;const o=box(-2.16,Math.sin(a)*.66,Math.cos(a)*.66,1.48,.09,.06,mint,gm);o.rotation.x=-a;}
 for(const x of [-3.13,-1.18]){torus(x,0,0,.51,.024,silver,gm);screws(x,.48,8,gm);}
 box(-2.1,.76,0,.63,.32,.57,dark,gm);box(-2.1,.94,0,.69,.04,.62,silver,gm);
 for(let i=-3;i<=3;i++)box(-3.14,i*.11,0,.04,.035,.70,steel,gm);
 const motorShell=[...gm.children];
 const rotor=new T.Group();rotor.userData.part='motor';gm.add(rotor);
 cyl(-2.15,0,0,.31,1.62,gold,rotor);cyl(-2.15,0,0,.10,2.08,silver,rotor);
 for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const o=box(-2.15,Math.sin(a)*.32,Math.cos(a)*.32,1.4,.04,.05,amber,rotor);o.rotation.x=-a;}
 rotor.visible=false;
 // Shaft and coupling.
 cyl(-.40,0,0,.10,1.65,silver,groups.coupling);cyl(-.66,0,0,.27,.35,dark,groups.coupling);torus(-.83,0,0,.26,.027,mint,groups.coupling);torus(-.47,0,0,.26,.027,mint,groups.coupling);screws(-.43,.19,6,groups.coupling);
 // Bearing housing, focal warning.
 cyl(.02,0,0,.35,.43,amber,groups.bearing);cyl(-.23,0,0,.28,.09,silver,groups.bearing);cyl(.26,0,0,.28,.09,silver,groups.bearing);box(.02,-.47,0,.46,.35,.65,dark,groups.bearing);screws(-.26,.24,6,groups.bearing);
 const sensor=box(.02,.44,.03,.12,.19,.13,amber,groups.bearing);const light=new T.PointLight(0xff9d43,1.1,2);light.position.set(.02,.5,.5);root.add(light);
 // Multi-stage pump housing and visible internal rotating assembly in section view.
 const gp=groups.pump,casings=[],impellers=new T.Group();impellers.userData.part='pump';gp.add(impellers);
 for(let i=0;i<7;i++){const x=.56+i*.285;const c=cyl(x,0,0,.60,.27,(i%2?steel:mint).clone(),gp);casings.push(c);torus(x-.13,0,0,.595,.018,silver,gp);const disk=cyl(x,0,0,.43,.08,gold,impellers);disk.userData.part='pump';for(let j=0;j<8;j++){const a=j/8*Math.PI*2;const o=box(x,Math.sin(a)*.28,Math.cos(a)*.28,.15,.18,.05,gold,impellers);o.rotation.x=-a+.35;}}
 cyl(1.4,0,0,.10,3.0,silver,impellers);for(const x of [.35,2.52]){cyl(x,0,0,.70,.14,dark,gp);torus(x+.08,0,0,.66,.032,silver,gp);screws(x+.12,.57,12,gp);}
 // Tie rods.
 for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2;cyl(1.44,Math.sin(a)*.67,Math.cos(a)*.67,.026,2.3,silver,gp);}
 cyl(2.86,0,0,.30,.50,steel,gp);box(2.86,-.48,0,.40,.37,.68,dark,gp);screws(3.13,.22,6,gp);
 // Inlet/outlet necks and flanges.
 for(const [x,z,h] of [[.65,-.02,1.18],[2.15,0,1.48]]){cyl(x,h/2, z,.18,h,mint,gp,true);cyl(x,h,z,.32,.10,steel,gp,true);cyl(x,h+.055,z,.155,.015,bolt,gp,true);for(let k=0;k<8;k++){const a=k*Math.PI/4;cyl(x+Math.sin(a)*.255,h+.07,z+Math.cos(a)*.255,.025,.04,bolt,gp,true);}}
 // Technical floor rings and grid. They describe the viewing plane, not performance.
 const circle=new T.Mesh(new T.RingGeometry(3.9,3.913,128),new T.MeshBasicMaterial({color:0x5bcbb5,transparent:true,opacity:.22,side:T.DoubleSide}));circle.rotation.x=-Math.PI/2;circle.position.y=-1.12;scene.add(circle);
 const grid=new T.GridHelper(12,24,0x16483f,0x14313a);grid.position.y=-1.13;grid.material.transparent=true;grid.material.opacity=.2;scene.add(grid);
 let yaw=-.17,pitch=.02,distance=9.3,section=false,drag=null,selected='bearing',frame=0;const ray=new T.Raycaster(),pointer=new T.Vector2();
 const selector=torus(.02,0,0,.47,.012,new T.MeshBasicMaterial({color:0x8fffd3,transparent:true,opacity:.7}));
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const pinData=[
  {part:'motor',title:'Электропривод',state:'Режим сопоставим',value:'2 980 об/мин',next:'Сверить ток и температуры: каналов в макете нет.',point:[-2.15,.48,0],side:'left',row:'top'},
  {part:'pump',title:'Проточная часть',state:'Режим сопоставим',value:'780 м³/ч · 18 МПа',next:'Проверить рабочую точку и условия на входе.',point:[1.5,.52,.1],side:'right',row:'top'},
  {part:'coupling',title:'Муфта',state:'Оценка недоступна',value:'Нет осевой вибрации',next:'Запросить спектр и дополнительные направления.',point:[-.66,.2,.08],side:'left',row:'bottom'},
  {part:'bearing',title:'Опора насоса',state:'Отклонение · проверить',value:'4,4 мм/с · 74 °C',next:'Проверить измерения, смазку и охлаждение; запросить диагностику.',point:[.02,.35,.08],side:'right',row:'bottom'}
 ];
 const overlay=document.createElement('div');overlay.className='model-pins';overlay.innerHTML='<svg class="pin-lines" aria-hidden="true">'+pinData.map(d=>`<g data-pin-line="${d.part}" class="${d.part==='bearing'?'warning':''}"><line/><circle r="4"/></g>`).join('')+'</svg>'+pinData.map(d=>`<button class="model-pin ${d.side} ${d.row} ${d.part==='bearing'?'warning':''}" data-action="part" data-part="${d.part}" aria-label="На 3D: ${d.title}" aria-pressed="${d.part===selected}"><span class="pin-title">${d.title}</span><span class="pin-state">${d.state}</span><strong>${d.value}</strong><span class="pin-next">${d.next}</span>${d.part==='bearing'?'<span class="pin-limit">Место сигнала, причина не установлена</span>':''}</button>`).join('');host.append(overlay);
 const pins=pinData.map(d=>({...d,button:overlay.querySelector(`[data-part="${d.part}"]`),line:overlay.querySelector(`[data-pin-line="${d.part}"] line`),dot:overlay.querySelector(`[data-pin-line="${d.part}"] circle`)}));
 function projectPins(){const w=host.clientWidth,h=host.clientHeight;overlay.querySelector('svg').setAttribute('viewBox',`0 0 ${w} ${h}`);for(const d of pins){const v=new T.Vector3(...d.point).applyMatrix4(root.matrixWorld).project(camera);const x=(v.x+1)*w/2,y=(1-v.y)*h/2;const b=d.button;b.setAttribute('aria-pressed',String(d.part===selected));const endX=b.offsetLeft+(d.side==='left'?b.offsetWidth:0),endY=b.offsetTop+b.offsetHeight/2;for(const [key,value]of Object.entries({x1:x,y1:y,x2:endX,y2:endY}))d.line.setAttribute(key,value.toFixed(1));d.dot.setAttribute('cx',x.toFixed(1));d.dot.setAttribute('cy',y.toFixed(1));b.setAttribute('aria-pressed',String(d.part===selected));}}
 function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();draw();}
 function draw(){if(disposed)return;root.rotation.y=yaw;root.rotation.x=pitch;camera.position.set(distance*.44,distance*.26,distance*.82);camera.lookAt(.1,0,0);renderer.render(scene,camera);projectPins();host.dataset.rendered='true';host.dataset.rotation=yaw.toFixed(3);host.dataset.section=String(section);}
 function select(part){if(!groups[part])return;selected=part;const positions={motor:[-2.15,1.65],coupling:[-.66,.8],bearing:[.02,1],pump:[1.4,1.6]};selector.position.x=positions[part][0];selector.scale.setScalar(positions[part][1]);host.dataset.selected=part;onSelect?.(part);draw();}
 function setSection(value){section=value;for(const c of casings)c.visible=!value;motorShell.forEach(o=>o.visible=!value);rotor.visible=value;host.dataset.sectionDescription=value?'Корпуса скрыты: видны ротор двигателя, вал и семь рабочих колёс насоса.':'Корпуса показаны.';draw();return section;}
 const down=e=>{drag={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY};renderer.domElement.setPointerCapture(e.pointerId);};
 const move=e=>{if(!drag)return;yaw+=(e.clientX-drag.lastX)*.008;pitch=Math.max(-.55,Math.min(.45,pitch+(e.clientY-drag.lastY)*.005));drag.lastX=e.clientX;drag.lastY=e.clientY;draw();};
 const up=e=>{if(drag&&Math.abs(e.clientX-drag.x)+Math.abs(e.clientY-drag.y)<6){const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};const hit=ray.intersectObjects(meshes.filter(visible))[0];if(hit?.object.userData.part)select(hit.object.userData.part);}drag=null;};
 const keyboard=e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','='].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')yaw-=.12;if(e.key==='ArrowRight')yaw+=.12;if(e.key==='ArrowUp')pitch=Math.max(-.55,pitch-.06);if(e.key==='ArrowDown')pitch=Math.min(.45,pitch+.06);if(['+','='].includes(e.key))distance=Math.max(7,distance-.4);if(e.key==='-')distance=Math.min(15,distance+.4);draw();}};
 renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('pointercancel',()=>drag=null);renderer.domElement.addEventListener('keydown',keyboard);
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
 host.pumpControls={select,section:()=>setSection(!section),rotate:()=>{yaw+=.3;draw();},reset:()=>{yaw=-.17;pitch=.02;distance=9.3;setSection(false);draw();}};
 function animate(){if(disposed)return;if(!reduced&&!document.hidden){frame++;impellers.rotation.x+=.006;light.intensity=.9+Math.sin(frame*.018)*.15;draw();}raf=requestAnimationFrame(animate);}
 resize();animate();
 return()=>{disposed=true;cancelAnimationFrame(raf);resizeObserver.disconnect();scene.traverse(o=>{o.geometry?.dispose();if(o.material){const list=Array.isArray(o.material)?o.material:[o.material];list.forEach(m=>m.dispose());}});renderer.dispose();renderer.forceContextLoss();};
};
})();
