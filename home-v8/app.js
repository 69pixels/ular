import { asset, values, divisions, regions, news } from './data.js';
import { copy } from './copy.js';
import { mapDots, MAP_SIZE, DOT_RADIUS, DOT_COLOR } from './map-dots.js';

const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (n,min=0,max=1) => Math.min(max,Math.max(min,n));
const esc = (text) => String(text).replace(/\u2028/g,'\n').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let scale = innerWidth / 1440;
const updateScale = () => {scale = document.documentElement.clientWidth / 1440;document.documentElement.style.setProperty('--s',String(scale));};
updateScale();

/** Render a Figma image slot; SVG intrinsic dimensions are preserved. */
function logoMarkup(logo, name) {
  const vector=logo.file.endsWith('.svg');
  const y=logo.y ?? (40-logo.height)/2;
  const style=`width:${logo.width}px;height:${logo.height}px;left:${logo.x??0}px;top:${y}px`;
  const image=`<img src="${asset(logo.file)}" alt="${esc(name)}" ${vector?'':`width="${logo.width}" height="${logo.height}"`} loading="lazy">`;
  return `<span class="brand-logo ${vector?'vector':'raster'} ${logo.mask?'masked':''} ${logo.crop??''}" style="${style}">${logo.mask?`<span class="mask-content">${image}</span>`:image}</span>`;
}

// Reversible word fill, with the source's first hard line break preserved.
const mission = $('[data-mission]');
const missionCopy=copy['2647:227'].replace(/\u2028/g,'\n').replace(/ +/g,' ');
mission.innerHTML=missionCopy.split(/(\s+)/).map(part => /\S/.test(part)?`<span class="mission-word" aria-hidden="true" data-word="${esc(part)}">${esc(part)}</span>`:part.includes('\n')?'<br>':' ').join('');
const missionWords=$$('.mission-word');

const progressiveBlur = `<span class="progressive-blur" aria-hidden="true">${[1,2,4,8].map((blur,i)=>`<i style="--blur:${blur}px;--start:${i*20}%;--end:${(i+1)*20}%"></i>`).join('')}</span>`;
$('.values-blur').insertAdjacentHTML('afterbegin',progressiveBlur);

// Values: one short native scroll track, with keyboard/click alternatives.
$('.value-images').innerHTML=values.map((v,i)=>`<div class="value-image ${i===0?'is-active':''}" data-node-id="${v.node}"><img src="${asset(v.image)}" class="${v.crop??''}" alt="" loading="${i===0?'eager':'lazy'}"></div>`).join('');
$('.value-controls').innerHTML=values.map((v,i)=>`<button type="button" id="value-tab-${i}" class="value-tab" role="tab" aria-selected="${i===0}" aria-controls="value-${i}" tabindex="${i===0?0:-1}"><span class="value-number">0${i+1}</span><span class="value-line" aria-hidden="true"><img src="${asset('10e01.svg')}" alt=""><span class="line-progress"></span></span><span class="value-name">${esc(v.title.replace(/\u2028/g,'\n'))}</span></button>`).join('');
$('.value-descriptions').innerHTML=values.map((v,i)=>`<p id="value-${i}" role="tabpanel" aria-labelledby="value-tab-${i}" aria-hidden="${i!==0}" class="value-description ${i===0?'is-active':''}" style="--index:${i}">${esc(v.description)}</p>`).join('');
const valueTabs=$$('.value-tab'),valueImages=$$('.value-image'),valueDescriptions=$$('.value-description');
const valueSection=$('.values'),valueStage=$('.values-stage');
let currentValue=0;
function setValue(index,progress=1){
  currentValue=index;
  valueSection.dataset.active=String(index);
  valueTabs.forEach((tab,i)=>{
    tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;
    tab.style.setProperty('--progress',String(i===index?Math.max(.08,progress):0));
    valueImages[i].classList.toggle('is-active',i===index);
    valueDescriptions[i].classList.toggle('is-active',i===index);
    valueDescriptions[i].setAttribute('aria-hidden',String(i!==index));
  });
}
function selectValue(index){
  if(reducedMotion.matches){setValue(index);return;}
  const track=valueSection.offsetHeight-valueStage.offsetHeight;
  window.scrollTo({top:window.scrollY+valueSection.getBoundingClientRect().top+(index+.2)/4*track,behavior:'instant'});
  setValue(index,.2);
}
valueTabs.forEach((tab,i)=>tab.addEventListener('click',()=>selectValue(i)));
function wireTabs(tabs,select){
  tabs.forEach((tab,i)=>tab.addEventListener('keydown',event=>{
    let next=i;
    if(event.key==='ArrowRight')next=(i+1)%tabs.length;
    else if(event.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;
    else if(event.key==='Home')next=0;
    else if(event.key==='End')next=tabs.length-1;
    else return;
    event.preventDefault();tabs[next].focus({preventScroll:true});select(next);
  }));
}
wireTabs(valueTabs,selectValue);

// All panels are data driven; replacing content never moves keyboard focus.
$('.company-backgrounds').innerHTML=divisions.map((d,i)=>`<div class="company-background ${i===0?'is-active':''}"><img class="photo ${d.crop??''}" src="${asset(d.image)}" alt="" loading="lazy">${progressiveBlur}<div class="company-overlay"><img src="${asset('55a83.svg')}" alt=""></div>${d.overlays===2?`<div class="company-overlay"><img src="${asset('71bf2.svg')}" alt=""></div>`:''}</div>`).join('');
$('.company-tabs').innerHTML=divisions.map((d,i)=>`<button type="button" id="division-${i}" class="company-tab" role="tab" aria-controls="company-panel" aria-selected="${i===0}" tabindex="${i===0?0:-1}">${d.name}</button>`).join('');
const companyTabs=$$('.company-tab'),companyBackgrounds=$$('.company-background');
const description=$('.company-description'),grid=$('.brand-grid'),companiesSection=$('#companies');
const brandCards=(d)=>d.brands.map((brand,i)=>{
    const tag=brand.url?'a':'button';
    const attrs=brand.url?`href="${brand.url}" target="_blank" rel="noopener noreferrer"`:`type="button" data-unavailable data-brand="${i}"`;
    return `<${tag} class="brand-card" ${attrs} aria-label="${esc(brand.name)}${brand.url?' — открыть сайт в новой вкладке':' — информация'}"><span class="brand-logos"><span class="logo-stage">${brand.logos.map(l=>logoMarkup(l,brand.name)).join('')}</span></span><img class="brand-arrow" src="${asset('3a3c6.svg')}" alt="" aria-hidden="true"><span class="brand-description">${esc(brand.description)}</span></${tag}>`;
  }).join('');
let currentCompany=0,backgroundToken=0;
/** Swap backgrounds only once the next photo is decoded: the old one stays opaque underneath, so nothing flashes. */
async function showBackground(index){
  const token=++backgroundToken,next=companyBackgrounds[index],img=$('img.photo',next);
  img.loading='eager';
  if(!img.complete)await img.decode().catch(()=>{});
  if(token!==backgroundToken)return;
  companyBackgrounds.forEach(bg=>{bg.classList.remove('is-prev');});
  const current=companyBackgrounds.find(bg=>bg.classList.contains('is-active'));
  if(current&&current!==next){current.classList.remove('is-active');current.classList.add('is-prev');}
  next.classList.add('is-active');
}
function setCompany(index,animate=true){
  const d=divisions[index];
  currentCompany=index;
  companiesSection.dataset.active=d.name;
  companiesSection.dataset.nodeId=d.node;
  companyTabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
  showBackground(index);
  $('#company-panel').setAttribute('aria-labelledby',`division-${index}`);
  description.textContent=d.description;
  grid.innerHTML=brandCards(d);
  $$('[data-unavailable]',grid).forEach(button=>button.addEventListener('click',()=>{
    const brand=d.brands[Number(button.dataset.brand)];
    openInfo(brand.name,`${brand.description}\n\nАдрес сайта бренда пока не указан. Свяжитесь с ULAR, чтобы узнать больше.`);
  }));
  if(animate&&!reducedMotion.matches){
    // Opacity only: no movement, and section height is reserved below, so the page never shifts.
    [description,grid].forEach(el=>{el.getAnimations().forEach(a=>a.cancel());el.animate([{opacity:0},{opacity:1}],{duration:260,easing:'cubic-bezier(.3,.6,.3,1)'});});
  }
}
/** Reserve the tallest description and card row of all eight directions. */
function reserveCompanyHeights(){
  description.style.height='';grid.style.height='';
  let textMax=0,gridMax=0;
  divisions.forEach(d=>{description.textContent=d.description;grid.innerHTML=brandCards(d);textMax=Math.max(textMax,description.getBoundingClientRect().height);gridMax=Math.max(gridMax,grid.getBoundingClientRect().height);});
  description.style.height=`${Math.ceil(textMax)}px`;grid.style.height=`${Math.ceil(gridMax)}px`;
  setCompany(currentCompany,false);
}
// Start decoding every direction's photo before the section is reached.
new IntersectionObserver((entries,observer)=>{if(entries.some(e=>e.isIntersecting)){companyBackgrounds.forEach(bg=>{const img=$('img.photo',bg);img.loading='eager';img.decode().catch(()=>{});});observer.disconnect();}},{rootMargin:'1200px 0px'}).observe(companiesSection);
companyTabs.forEach((tab,i)=>tab.addEventListener('click',()=>setCompany(i)));
wireTabs(companyTabs,setCompany);
setCompany(0,false);
document.fonts.ready.then(reserveCompanyHeights);

$('.news-grid').innerHTML=news.map(n=>`<article class="news-card"><h3>${esc(n.title)}</h3><div class="news-meta mono"><time datetime="2026-02-24">${esc(n.date)}</time>${n.category?`<span>${esc(n.category)}</span>`:''}</div></article>`).join('');

// Map popovers share a safe pointer corridor and clamp to the visible viewport.
const map=$('.map'),mapPanel=$('.map-panel'),officeList=$('.office-list');
$('.map-markers').innerHTML=regions.map(r=>`<button type="button" class="map-marker" data-region="${r.id}" data-name="${r.name}" style="--x:${r.x/1280*100}%;--y:${r.y/702.445*100}%" aria-label="${r.name} — компании и адреса" aria-expanded="false" aria-controls="region-panel"></button>`).join('');
const markers=$$('.map-marker');
let selectedRegion=null,closeTimer=0,pinned=false;
function positionPanel(){
  if(mapPanel.hidden||!selectedRegion)return;
  const rect=map.getBoundingClientRect(),r=selectedRegion;
  const panelWidth=mapPanel.offsetWidth,panelHeight=mapPanel.offsetHeight;
  const x=r.x/1280*rect.width,y=r.y/702.445*rect.height;
  let left=x+25*scale;
  if(left+panelWidth>rect.width)left=x-panelWidth-25*scale;
  const minTop=Math.max(8-rect.top,0);
  const maxTop=Math.min(rect.height-panelHeight,innerHeight-rect.top-panelHeight-12);
  mapPanel.style.left=`${clamp(left,0,rect.width-panelWidth)}px`;
  mapPanel.style.top=`${clamp(y-8*scale,Math.min(minTop,maxTop),Math.max(minTop,maxTop))}px`;
}
function openRegion(id,{pin=false}={}){
  clearTimeout(closeTimer);
  const r=regions.find(region=>region.id===id);
  const changed=selectedRegion?.id!==id;
  selectedRegion=r;pinned=pin;
  markers.forEach(marker=>marker.setAttribute('aria-expanded',String(marker.dataset.region===id)));
  $('#region-title').textContent=r.name;
  if(changed){
    officeList.innerHTML=r.offices.map(office=>`<article class="office">${office.logo?`<div class="office-logo">${logoMarkup(office.logo,office.name||'Логотип компании')}</div>`:office.name?`<strong class="office-name">${esc(office.name)}</strong>`:''}<p>${esc(office.address)}</p></article>`).join('');
    officeList.scrollTop=0;
  }
  mapPanel.hidden=false;positionPanel();
}
function closeRegion(){clearTimeout(closeTimer);mapPanel.hidden=true;markers.forEach(m=>m.setAttribute('aria-expanded','false'));selectedRegion=null;pinned=false;}
function deferClose(){clearTimeout(closeTimer);if(!pinned)closeTimer=setTimeout(()=>{if(!mapPanel.matches(':hover')&&!mapPanel.contains(document.activeElement)&&!markers.some(m=>m.matches(':hover')||m===document.activeElement))closeRegion();},280);}
markers.forEach(marker=>{
  marker.addEventListener('pointerenter',()=>openRegion(marker.dataset.region));
  marker.addEventListener('pointerleave',deferClose);
  marker.addEventListener('focus',()=>openRegion(marker.dataset.region));
  marker.addEventListener('blur',deferClose);
  marker.addEventListener('click',()=>openRegion(marker.dataset.region,{pin:true}));
  marker.addEventListener('keydown',event=>{if(event.key==='ArrowDown'){event.preventDefault();openRegion(marker.dataset.region,{pin:true});officeList.focus({preventScroll:true});}});
});
// One cursor field moves both the soft silhouette dots and the inactive region markers.
// Push is small (≤ 9px at 1440) and eases back, so the silhouette stays stable and recognizable.
const field={radius:()=>150*scale,push:()=>9*scale};
const fieldPush=(vx,vy)=>{const dist=Math.hypot(vx,vy),radius=field.radius();if(dist<=1||dist>=radius)return[0,0];const push=(1-dist/radius)**1.5*field.push();return[vx/dist*push,vy/dist*push];};
let pointer=null,fieldFrame=0;
function repelMarkers(){
  markers.forEach(marker=>{
    let dx=0,dy=0;
    if(pointer&&marker.getAttribute('aria-expanded')!=='true'&&!marker.matches(':hover')){
      const r=marker.getBoundingClientRect();[dx,dy]=fieldPush(r.left+r.width/2-pointer.x,r.top+r.height/2-pointer.y);
    }
    marker.style.setProperty('--dx',`${dx.toFixed(2)}px`);marker.style.setProperty('--dy',`${dy.toFixed(2)}px`);
  });
}
// Canvas redraw of the Figma SVG: same 3106 dot centres, radius and colour, plus a per-dot offset.
const dotCanvas=$('.map-dots'),dotContext=dotCanvas.getContext('2d'),dotCount=mapDots.length/2,dotOffset=new Float32Array(mapDots.length);
const DOT_PAD=16;let dotWidth=0,dotHeight=0,dotRatio=1,dotScale=1;
function drawDots(){
  dotContext.setTransform(dotRatio,0,0,dotRatio,0,0);
  dotContext.clearRect(0,0,dotWidth+DOT_PAD*2,dotHeight+DOT_PAD*2);
  dotContext.fillStyle=DOT_COLOR;dotContext.beginPath();
  const radius=DOT_RADIUS*dotScale;
  for(let i=0;i<dotCount;i++){const x=DOT_PAD+mapDots[i*2]*dotScale+dotOffset[i*2],y=DOT_PAD+mapDots[i*2+1]*dotScale+dotOffset[i*2+1];dotContext.moveTo(x+radius,y);dotContext.arc(x,y,radius,0,Math.PI*2);}
  dotContext.fill();
}
function sizeDots(){
  const rect=map.getBoundingClientRect();if(!rect.width)return;
  dotWidth=rect.width;dotHeight=rect.height;dotScale=rect.width/MAP_SIZE.width;dotRatio=Math.min(2,devicePixelRatio||1);
  dotCanvas.width=Math.round((dotWidth+DOT_PAD*2)*dotRatio);dotCanvas.height=Math.round((dotHeight+DOT_PAD*2)*dotRatio);
  drawDots();map.classList.add('has-canvas');
}
function stepField(){
  fieldFrame=0;repelMarkers();
  const rect=map.getBoundingClientRect(),px=pointer&&pointer.x-rect.left,py=pointer&&pointer.y-rect.top,radius=field.radius();
  let moving=false;
  for(let i=0;i<dotCount;i++){
    let tx=0,ty=0;
    if(pointer){const vx=mapDots[i*2]*dotScale-px,vy=mapDots[i*2+1]*dotScale-py;if(Math.abs(vx)<radius&&Math.abs(vy)<radius)[tx,ty]=fieldPush(vx,vy);}
    const ox=dotOffset[i*2],oy=dotOffset[i*2+1];
    if(ox===tx&&oy===ty)continue;
    const nx=ox+(tx-ox)*.14,ny=oy+(ty-oy)*.14;
    if(Math.abs(tx-nx)<.02&&Math.abs(ty-ny)<.02){dotOffset[i*2]=tx;dotOffset[i*2+1]=ty;}else{dotOffset[i*2]=nx;dotOffset[i*2+1]=ny;moving=true;}
  }
  drawDots();
  if(moving)fieldFrame=requestAnimationFrame(stepField);
}
const requestField=()=>{if(!fieldFrame)fieldFrame=requestAnimationFrame(stepField);};
map.addEventListener('pointermove',event=>{pointer=reducedMotion.matches||mapPanel.contains(event.target)?null:{x:event.clientX,y:event.clientY};requestField();});
map.addEventListener('pointerleave',()=>{pointer=null;requestField();});
new ResizeObserver(sizeDots).observe(map);
mapPanel.addEventListener('pointerenter',()=>clearTimeout(closeTimer));
mapPanel.addEventListener('pointerleave',deferClose);
mapPanel.addEventListener('focusout',deferClose);
$('.panel-close').addEventListener('click',closeRegion);
document.addEventListener('pointerdown',event=>{if(!map.contains(event.target))closeRegion();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!mapPanel.hidden){const trigger=markers.find(m=>m.dataset.region===selectedRegion?.id);if(mapPanel.contains(document.activeElement))trigger?.focus({preventScroll:true});closeRegion();}});

// The form deliberately does not claim to deliver a message without a backend.
const form=$('.contact-form'),status=$('.form-status');
const inputs=[form.elements.namedItem('name'),form.elements.namedItem('email')];
function validateInput(input){
  let error='';
  if(!input.value.trim())error=input.name==='name'?'Укажите ваше имя.':'Укажите адрес электронной почты.';
  else if(input.name==='email'&&input.validity.typeMismatch)error='Введите корректный e-mail, например name@company.kz.';
  input.setAttribute('aria-invalid',String(Boolean(error)));
  $(`#${input.name}-error`).textContent=error;
  return !error;
}
inputs.forEach(input=>input.addEventListener('input',()=>{if(input.hasAttribute('aria-invalid'))validateInput(input);status.hidden=true;}));
form.addEventListener('submit',event=>{
  event.preventDefault();const valid=inputs.map(validateInput).every(Boolean);
  if(!valid){inputs.find(input=>input.getAttribute('aria-invalid')==='true').focus();status.hidden=true;return;}
  status.textContent='Форма проверена. Сообщение не отправлено: отправка пока не подключена. Вы можете написать нам на office@ulargroup.com.';
  status.hidden=false;
});

const dialog=$('.info-dialog');
function openInfo(title,body){$('#dialog-title').textContent=title;$('.dialog-copy').textContent=body;dialog.showModal();}
$('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
$$('[data-document]').forEach(button=>button.addEventListener('click',()=>openInfo(button.dataset.document,'Документ пока не опубликован. Запросить актуальную версию можно по адресу office@ulargroup.com.')));
document.addEventListener('click',event=>{const details=$('.language');if(!details.contains(event.target))details.open=false;});

const heroVideo=$('.hero-video');
const syncHeroVideo=()=>{if(reducedMotion.matches)heroVideo.pause();else heroVideo.play().catch(()=>{});};
syncHeroVideo();

const header=$('.header');let lastY=scrollY;
function updateHeader(){
  const y=Math.max(0,scrollY),delta=y-lastY;
  header.classList.toggle('is-scrolled',y>8);
  const busy=header.contains(document.activeElement)||$('.language').open;
  if(y<120||delta<-4||busy)header.classList.remove('is-hidden');
  else if(delta>4)header.classList.add('is-hidden');
  if(Math.abs(delta)>4||y<120)lastY=y;
}
header.addEventListener('focusin',()=>header.classList.remove('is-hidden'));
let raf=0;
function renderScroll(){
  raf=0;
  updateHeader();
  const mr=mission.getBoundingClientRect();
  const progress=reducedMotion.matches?1:clamp((innerHeight*.85-mr.top)/(mr.height+innerHeight*.1));
  missionWords.forEach((word,i)=>word.style.setProperty('--fill',`${clamp(progress*missionWords.length-i)*100}%`));
  if(!reducedMotion.matches){
    const rect=valueSection.getBoundingClientRect();
    const travel=valueSection.offsetHeight-valueStage.offsetHeight;
    const p=clamp(-rect.top/Math.max(1,travel));
    const index=Math.min(3,Math.floor(p*4));
    setValue(index,p===1?1:(p*4)%1);
  }
  positionPanel();
}
function schedule(){if(!raf)raf=requestAnimationFrame(renderScroll);}
window.addEventListener('scroll',schedule,{passive:true});
let resizeTimer=0;
window.addEventListener('resize',()=>{updateScale();schedule();clearTimeout(resizeTimer);resizeTimer=setTimeout(reserveCompanyHeights,150);});
reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches)setValue(currentValue);syncHeroVideo();schedule();});
document.fonts.ready.then(schedule);
schedule();
