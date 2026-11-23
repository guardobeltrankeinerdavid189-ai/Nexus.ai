const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
const messages=$('#messages'),welcome=$('#welcome');
let userName=localStorage.getItem('nexus_name')||'',history=JSON.parse(localStorage.getItem('nexus_history')||'[]');
const costs={chat:5,code:20,image:60,web:10};
function updateBalance(n){$('#tokenBalance').textContent='◈ '+n+' tokens';}
function addMessage(text,who){const el=document.createElement('div');el.className='message '+who;el.textContent=text;messages.appendChild(el);messages.scrollTop=messages.scrollHeight;}
function persist(){localStorage.setItem('nexus_history',JSON.stringify(history.slice(-100)));$('#savedHistory').textContent=history.length?history.map(m=>(m.role==='user'?'Tú: ':'NEXUS: ')+m.content).join('\\n\\n'):'Todavía no hay mensajes guardados.';}
function showView(name){$$('.view').forEach(v=>v.classList.remove('active'));$('#'+name+'View').classList.add('active');$$('.nav').forEach(n=>n.classList.toggle('active',n.dataset.view===name));$('#viewName').textContent=({chat:'Asistente',code:'Programación',image:'Crear imágenes',files:'Archivos y proyectos',plans:'Planes Premium',history:'Historial y memoria',links:'NEXUS Link Access'})[name];$('#sidebar').classList.remove('open');}
async function profile(){if(!userName)return;try{const r=await fetch('/api/profile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:userName})});if(r.ok){const d=await r.json();updateBalance(d.tokens);$('#refillInfo').textContent='Recarga siguiente: '+new Date(d.nextRefillAt).toLocaleString()+' · +100 tokens cada 24 horas hasta un máximo de 900.';}}catch{}}
function tokenError(d){updateBalance(d.tokens??0);const when=d.nextRefillAt?new Date(d.nextRefillAt).toLocaleString():'cuando se recarguen';return `Te faltan tokens. Esta acción cuesta ${d.cost??'?'} tokens y tienes ${d.tokens??0}. Próxima recarga: ${when}.`;}
async function send(q,modeOverride){if(!q.trim())return;const mode=modeOverride||$('#aiMode').value;welcome.style.display='none';addMessage(q,'user');history.push({role:'user',content:q});persist();$('#connectionStatus').textContent='Procesando · coste '+(costs[mode]||15)+' tokens';try{const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:userName,messages:history.slice(-12),mode})});const d=await r.json();if(r.status===402){addMessage(tokenError(d),'ai');return;}if(!r.ok)throw Error(d.error||'Servidor no disponible');addMessage(d.reply,'ai');history.push({role:'assistant',content:d.reply});persist();updateBalance(d.tokens);$('#connectionStatus').textContent='Listo · −'+d.cost+' tokens';}catch(e){addMessage('No pude conectar con la IA: '+e.message+'. Comprueba que el backend esté publicado y la clave API configurada.','ai');$('#connectionStatus').textContent='API no conectada';}}
$('#enterApp').onclick=async()=>{userName=$('#profileName').value.trim()||'Invitado';localStorage.setItem('nexus_name',userName);$('#authScreen').style.display='none';$('#userAvatar').textContent=userName[0].toUpperCase();await profile();};
if(userName){$('#authScreen').style.display='none';$('#profileName').value=userName;$('#userAvatar').textContent=userName[0].toUpperCase();profile();}
$('#chatForm').addEventListener('submit',e=>{e.preventDefault();const q=$('#chatInput').value;$('#chatInput').value='';send(q);});
$$('.quick').forEach(b=>b.onclick=()=>send(b.dataset.prompt));
$$('.nav').forEach(b=>b.onclick=()=>showView(b.dataset.view));
$('#newChat').onclick=()=>{messages.innerHTML='';history=[];persist();welcome.style.display='block';showView('chat');};
$('#menu').onclick=()=>$('#sidebar').classList.toggle('open');
$('#generateCode').onclick=()=>{const idea=$('#codeIdea').value.trim()||'Crea una aplicación de ejemplo';const lang=$('#codeLang').value;send(`Genera un proyecto ${lang} funcional para esta idea: ${idea}. Devuelve el código completo, con instrucciones para ejecutarlo.`,'code');showView('chat');};
$('#copyCode').onclick=async()=>{try{await navigator.clipboard.writeText($('#codeOutput').value);$('#copyCode').textContent='¡Copiado!';}catch(e){$('#codeOutput').select();document.execCommand('copy');}};
$('#makePrompt').onclick=async()=>{const idea=$('#imageIdea').value.trim();if(!idea){$('#imageResult').textContent='Escribe una descripción primero.';return;}const prompt=`${idea}. Estilo: ${$('#imageStyle').value}. Composición cuidada, iluminación coherente y acabado profesional.`;$('#imageResult').innerHTML='';const b=document.createElement('button');b.className='primary';b.textContent='Generar imagen · 60 tokens';b.onclick=async()=>{b.disabled=true;b.textContent='Generando…';try{const r=await fetch('/api/image',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:userName,prompt})});const d=await r.json();if(r.status===402)throw Error(tokenError(d));if(!r.ok)throw Error(d.error);updateBalance(d.tokens);const img=document.createElement('img');img.src=d.image;img.style.maxWidth='100%';img.style.borderRadius='12px';$('#imageResult').append(img);b.textContent='Imagen creada';}catch(e){b.disabled=false;b.textContent='Reintentar generación';alert(e.message);}};const p=document.createElement('p');p.textContent=prompt;$('#imageResult').append(p,b);};
$('#fileInput').onchange=async e=>{const f=e.target.files[0];if(!f)return;if(f.type.startsWith('image/')){const reader=new FileReader();reader.onload=()=>{send('Analiza esta imagen: '+f.name+' (para análisis visual completo usa el endpoint de análisis de imagen).','file');};reader.readAsDataURL(f);}else{const reader=new FileReader();reader.onload=()=>send('Analiza este archivo de texto: '+f.name+'\\n'+String(reader.result).slice(0,10000),'file');reader.readAsText(f);}e.target.value='';};

let lastAnalyzedUrl='';
$('#analyzeLink').onclick=async()=>{
 const url=$('#linkInput').value.trim();if(!url){alert('Pega un enlace primero.');return;}
 const btn=$('#analyzeLink'),out=$('#linkResult');btn.disabled=true;btn.textContent='Analizando…';out.textContent='Conectando con la página pública…';
 try{
  const r=await fetch('/api/link-analyze',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:userName,url})});const d=await r.json();
  if(!r.ok)throw Error(d.error||'No se pudo analizar');
  updateBalance(d.tokens);lastAnalyzedUrl=d.url;$('#openOriginal').disabled=false;
  out.replaceChildren();const h=document.createElement('h3');h.textContent=d.title||'Página analizada';const link=document.createElement('a');link.href=d.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=d.url;const summary=document.createElement('p');summary.textContent=d.summary;const label=document.createElement('b');label.textContent='Texto extraído';const excerpt=document.createElement('p');excerpt.className='muted';excerpt.textContent=d.excerpt||'No se pudo extraer texto legible.';const cost=document.createElement('small');cost.className='muted';cost.textContent=`Coste: ${d.cost} tokens · Tipo: ${d.contentType}`;out.append(h,link,summary,label,excerpt,cost);$('#connectionStatus').textContent='Enlace analizado · −'+d.cost+' tokens';
 }catch(e){out.textContent='Error: '+e.message;$('#connectionStatus').textContent='No se pudo analizar el enlace';}
 finally{btn.disabled=false;btn.textContent='Analizar enlace · 10 tokens';}
};
$('#openOriginal').onclick=()=>{if(lastAnalyzedUrl)window.open(lastAnalyzedUrl,'_blank','noopener,noreferrer');};

$('#voiceBtn').onclick=()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){alert('El dictado por voz no está disponible en este navegador.');return;}const rec=new SR();rec.lang='es-CO';rec.onresult=e=>{$('#chatInput').value=e.results[0][0].transcript;};rec.start();};
$('#clearHistory').onclick=()=>{history=[];messages.innerHTML='';persist();localStorage.removeItem('nexus_history');};
$('#exportChat').onclick=()=>{const txt=history.map(x=>(x.role==='user'?'Tú: ':'NEXUS: ')+x.content).join('\\n\\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt||'Sin conversación'],{type:'text/plain'}));a.download='nexus-historial.txt';a.click();URL.revokeObjectURL(a.href);};
$$('[data-plan]').forEach(b=>b.onclick=()=>{addMessage('Plan '+b.dataset.plan+': vista de demostración. No hay cobros ni activación real.','ai');showView('chat');});
$('#aiMode').onchange=()=>{const m=$('#aiMode').value;$('#chatInput').placeholder='Escribe a NEXUS · '+(costs[m]||15)+' tokens por solicitud';};
fetch('/api/health').then(r=>r.json()).then(d=>$('#connectionStatus').textContent=d.aiConfigured?'IA conectada':'Backend activo · falta configurar API').catch(()=>$('#connectionStatus').textContent='Abre desde el servidor para usar IA');
persist();
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
