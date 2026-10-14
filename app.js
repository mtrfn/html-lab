'use strict';
const $=id=>document.getElementById(id),q=x=>'"'+String(x).replaceAll('"','""')+'"';
let activeLesson=null,workspaceScope=DBLabHost.embedded?null:'local';
function storageKey(key,scope=workspaceScope){if(!scope)throw Error('Conectează-te înainte de a salva în Teams.');return scope==='local'?key:scope+'::'+key}
let worker,state=[],bytes,selected='',pending=null,serial=0,storage,saveQueue=Promise.resolve(),timer;
function msg(s){$('message').textContent=s}
function spawn(){worker=new Worker('./worker.js?v=1.4.0');worker.onmessage=e=>{if(!pending||pending.id!==e.data.id)return;const p=pending;pending=null;clearTimeout(timer);busy(false);e.data.error?p.reject(Error(e.data.error)):p.resolve(e.data)};worker.onerror=e=>{if(pending){clearTimeout(timer);pending.reject(Error(e.message));pending=null;busy(false)}}}
let busyDepth=0;
function refreshBusyButtons(){if(!busyDepth)return;document.querySelectorAll('button,input,select,textarea').forEach(x=>{if(x.id==='stop')return;if(x.dataset.wasDisabled===undefined)x.dataset.wasDisabled=String(x.disabled);x.disabled=true})}
function busy(b){busyDepth=Math.max(0,busyDepth+(b?1:-1));if(busyDepth){refreshBusyButtons();return}document.querySelectorAll('button,input,select,textarea').forEach(x=>{if(x.dataset.wasDisabled!==undefined){x.disabled=x.dataset.wasDisabled==='true';delete x.dataset.wasDisabled}})}
function call(m){if(pending)return Promise.reject(Error('Așteaptă finalizarea operației.'));busy(true);return new Promise((resolve,reject)=>{pending={id:++serial,resolve,reject};worker.postMessage({...m,id:serial});timer=setTimeout(()=>stop('Interogarea a depășit 15 secunde. Starea anterioară a fost restaurată.'),15000)})}
function current(){return state.find(t=>t.name===selected)}
function table(columns,values){const t=document.createElement('table'),head=t.createTHead().insertRow();columns.forEach(c=>{let h=document.createElement('th');h.textContent=c;head.append(h)});const body=t.createTBody();values.forEach(v=>{const row=body.insertRow();v.forEach(c=>row.insertCell().textContent=c===null?'NULL':typeof c==='object'?'[BLOB]':String(c))});return t}
function render(){window.DBLabERD?.update(state);const list=$('tables');list.replaceChildren();if(!current())selected=state[0]?.name||'';state.forEach(t=>{const b=document.createElement('button');b.textContent='▦ '+t.name;b.className=t.name===selected?'active':'';b.onclick=()=>{selected=t.name;render()};list.append(b)});document.querySelectorAll('.selected').forEach(x=>x.textContent=selected||'—');const t=current();$('schema').replaceChildren();$('grid').replaceChildren();$('alter').hidden=!t;$('insert').disabled=!t;if(!t)return;
$('schema').append(table(['Câmp','Tip','PK','Obligatoriu','Referință'],t.columns.map(c=>[c.name,c.type,c.pk?'Da':'—',c.notnull?'Da':'—',t.foreign.filter(f=>f.from===c.name).map(f=>f.table+'.'+f.to).join(', ')])));
const grid=table(t.data.columns,t.data.values),pk=t.columns.filter(c=>c.pk).sort((a,b)=>a.pk-b.pk);grid.tHead.rows[0].append(document.createElement('th'));t.data.values.forEach((v,i)=>{const cell=grid.tBodies[0].rows[i].insertCell();for(const [label,action]of [['Editează',()=>edit(v)],['Șterge',()=>remove(v)]]){const b=document.createElement('button');b.textContent=label;b.disabled=!pk.length||pk.some(c=>v[t.data.columns.indexOf(c.name)]===null)||v.some(x=>x instanceof Uint8Array);b.onclick=action;cell.append(b)}});$('grid').append(grid);refreshBusyButtons()}
function projectSnapshot(){return {format:'DB-Lab',version:1,name:$('name').value,sql:$('editor').value,bytes:Array.from(bytes),...(activeLesson?{lesson:LessonCore.metadata(activeLesson)}:{})}}
async function save(){
 if(!bytes||!workspaceScope)return false;
 const scope=workspaceScope,project=projectSnapshot();$('saved').textContent='Se salvează…';
 saveQueue=saveQueue.catch(()=>{}).then(()=>new Promise((resolve,reject)=>{
  if(!storage)return reject(Error('Stocarea locală indisponibilă'));
  const tx=storage.transaction('projects','readwrite'),store=tx.objectStore('projects');
  store.put(project,storageKey('active',scope));store.put(project,storageKey(activeLessonKey(project),scope));
  tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Salvare anulată'));
 }));
 try{await saveQueue;$('saved').textContent='Salvat local';return true}catch(e){$('saved').textContent='Nesalvat · folosește Export';msg(e.message);return false}
}
function activeLessonKey(project){return project.lesson?'lesson-progress:'+project.lesson.key:'workspace-free'}
async function apply(sql,params){try{const r=await call({kind:'exec',sql,params});state=r.state;bytes=r.bytes;render();$('results').replaceChildren();r.result.forEach(x=>$('results').append(table(x.columns,x.values.slice(0,500))));msg('Executat cu succes. Rezultatele sunt limitate vizual la 500 de rânduri.');await save();return true}catch(e){msg('Eroare: '+e.message);return false}}
async function load(b){const r=await call({kind:'load',bytes:b});state=r.state;bytes=r.bytes;window.DBLabERD?.reset();render()}
async function stop(message='Operație oprită. Starea anterioară a fost restaurată.'){if(!pending)return;worker.terminate();clearTimeout(timer);const p=pending;pending=null;busy(false);p.reject(Error(message));spawn();try{await load(bytes);msg(message)}catch(e){msg(e.message)}}
function download(name,data,type){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([data],{type}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
const filename=()=>($('name').value||'proiect').replace(/[^\p{L}\p{N}_-]/gu,'_');
$('export').onclick=()=>download(filename()+'.dblab.json',JSON.stringify(projectSnapshot()),'application/json');
$('sqlite').onclick=()=>download(filename()+'.sqlite',bytes,'application/vnd.sqlite3');
$('import').onclick=()=>$('file').click();$('file').onchange=async()=>{const f=$('file').files[0];if(!f)return;try{if(f.size>20*1024*1024)throw Error('Limita de import: 20 MB.');if(!confirm('Importul înlocuiește proiectul curent. Ai exportat lucrarea?'))return;let b,name=f.name,sql='',lesson=null;if(f.name.endsWith('.json')){const p=JSON.parse(await f.text());if(p.format!=='DB-Lab'||p.version!==1||!Array.isArray(p.bytes)||!p.bytes.every(x=>Number.isInteger(x)&&x>=0&&x<=255))throw Error('Proiect DB-Lab invalid');lesson=LessonCore.metadata(p.lesson);b=new Uint8Array(p.bytes);name=String(p.name);sql=String(p.sql||'')}else b=new Uint8Array(await f.arrayBuffer());if(!(await save()))throw Error('Exportă proiectul curent: copia locală nu a putut fi salvată.');await load(b);activeLesson=lesson;window.renderActiveLesson?.();$('name').value=name;$('editor').value=sql;await save();msg('Proiect importat.')}catch(e){msg('Import eșuat: '+e.message)}finally{$('file').value=''}};
async function fresh(demo){if(!confirm('Înlocuiești proiectul curent? Exportă-l mai întâi dacă vrei să-l păstrezi.'))return;if(!(await save()))throw Error('Exportă proiectul curent înainte de înlocuire.');await load();activeLesson=null;window.renderActiveLesson?.();$('name').value=demo?'Catalog școlar':'Proiect nou';$('editor').value=demo?'SELECT * FROM elevi;':'';if(demo)await apply(await(await fetch('./demo.sql')).text());else await save()}
$('new').onclick=()=>fresh(false).catch(e=>msg(e.message));$('demo').onclick=()=>fresh(true).catch(e=>msg(e.message));$('run').onclick=()=>apply($('editor').value);$('stop').onclick=()=>stop();$('editor').onkeydown=e=>{if(e.ctrlKey&&e.key==='Enter'){e.preventDefault();apply($('editor').value)}};let debounce;for(const id of ['name','editor'])$(id).oninput=()=>{clearTimeout(debounce);debounce=setTimeout(save,400)};
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x===b));for(const id of ['sql','structure','data','help','lessons','author','erd'])$(id).hidden=id!==b.dataset.tab});
function field(name='camp',pk=false){const row=$('fields').insertRow();const n=document.createElement('input');n.value=name;row.insertCell().append(n);const type=document.createElement('select');['INTEGER','REAL','TEXT','NUMERIC','BLOB'].forEach(v=>type.add(new Option(v,v)));type.value=pk?'INTEGER':'TEXT';row.insertCell().append(type);for(let i=0;i<2;i++){const c=document.createElement('input');c.type='checkbox';c.checked=pk;row.insertCell().append(c)}const ref=document.createElement('input');ref.placeholder='clase.id';row.insertCell().append(ref);const del=document.createElement('button');del.textContent='×';del.onclick=()=>{row.remove();preview()};row.insertCell().append(del);row.oninput=preview;preview()}
function createSQL(){const cols=[],names=new Set();for(const row of $('fields').rows){const [name,type,pk,required,ref]=row.querySelectorAll('input,select');if(!name.value.trim()||names.has(name.value.trim()))throw Error('Numele câmpurilor trebuie să fie distincte și completate');names.add(name.value.trim());let s=q(name.value.trim())+' '+type.value+(required.checked?' NOT NULL':'');if(ref.value.trim()){const bits=ref.value.trim().split('.');if(bits.length!==2||!bits.every(Boolean))throw Error('Referință: tabel.câmp');s+=' REFERENCES '+q(bits[0])+'('+q(bits[1])+')'}cols.push(s)}const keys=Array.from($('fields').rows).filter(r=>r.querySelectorAll('input')[1].checked).map(r=>q(r.querySelector('input').value.trim()));if(keys.length)cols.push('PRIMARY KEY ('+keys.join(', ')+')');if(!cols.length||!$('tableName').value.trim())throw Error('Completează tabelul și cel puțin un câmp');return 'CREATE TABLE '+q($('tableName').value.trim())+' (\n  '+cols.join(',\n  ')+'\n);'}
function preview(){try{$('generated').textContent=createSQL()}catch(e){$('generated').textContent=e.message}}$('tableName').oninput=preview;$('addField').onclick=()=>field();$('create').onclick=()=>{try{apply(createSQL())}catch(e){msg(e.message)}};field('id',true);field('denumire');
$('renameTable').onclick=()=>{if(selected&&$('rename').value.trim())apply('ALTER TABLE '+q(selected)+' RENAME TO '+q($('rename').value.trim()))};$('renameColumn').onclick=()=>{const old=prompt('Câmpul de redenumit:');if(old&&$('rename').value.trim())apply('ALTER TABLE '+q(selected)+' RENAME COLUMN '+q(old)+' TO '+q($('rename').value.trim()))};$('addColumn').onclick=()=>{const name=prompt('Numele câmpului nou:');if(!name)return;const type=prompt('Tip: INTEGER, REAL, TEXT, NUMERIC, BLOB','TEXT');if(!['INTEGER','REAL','TEXT','NUMERIC','BLOB'].includes(type))return msg('Tip invalid');apply('ALTER TABLE '+q(selected)+' ADD COLUMN '+q(name)+' '+type)};
$('insert').onclick=()=>openRowEditor();
function condition(t,v){const keys=t.columns.filter(c=>c.pk);return {sql:keys.map(c=>q(c.name)+' IS ?').join(' AND '),params:keys.map(c=>v[t.data.columns.indexOf(c.name)])}}
function edit(v){openRowEditor(v)}
function remove(v){const t=current();if(!confirm('Ștergi această înregistrare?'))return;const where=condition(t,v);apply('DELETE FROM '+q(t.name)+' WHERE '+where.sql,where.params)}
window.dbReady=(async()=>{spawn();let saved;try{storage=await new Promise((resolve,reject)=>{const r=indexedDB.open('db-lab-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('projects');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});if(workspaceScope)saved=await new Promise((resolve,reject)=>{const r=storage.transaction('projects').objectStore('projects').get(storageKey('active'));r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}catch(e){msg('Salvarea locală indisponibilă. Folosește Export.')}try{await load(saved?new Uint8Array(saved.bytes):undefined);if(saved){try{activeLesson=LessonCore.metadata(saved.lesson)}catch{activeLesson=null}window.renderActiveLesson?.();$('name').value=saved.name;$('editor').value=saved.sql;msg('Proiect restaurat.');await save()}else if(workspaceScope)await apply(await(await fetch('./demo.sql')).text());return true}catch(e){msg('Inițializare eșuată: '+e.message);return false}})();

// Local workspaces are isolated by verified organization, account and Teams class.
window.DBLabWorkspace={
 async flush(){clearTimeout(debounce);return !workspaceScope||!bytes||await save()},
 async lock(){
  await window.dbReady;clearTimeout(debounce);
  if(workspaceScope&&bytes)await save();await saveQueue.catch(()=>{});
  workspaceScope=null;activeLesson=null;if($('rowDialog').open)$('rowDialog').close();$('rowFields').replaceChildren();$('rowReferences').replaceChildren();await load();$('name').value='';$('editor').value='';$('results').replaceChildren();window.renderActiveLesson?.();
 },
 async open(scope){
  await window.dbReady;clearTimeout(debounce);await saveQueue.catch(()=>{});
  workspaceScope=scope;
  const saved=await new Promise((resolve,reject)=>{if(!storage)return reject(Error('Stocarea locală este indisponibilă.'));const r=storage.transaction('projects').objectStore('projects').get(storageKey('active'));r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
  const p=saved?LessonCore.project(saved):null;
  await load(p?new Uint8Array(p.bytes):undefined);activeLesson=p?.lesson||null;
  $('name').value=p?.name||'Proiectul meu';$('editor').value=p?.sql||'SELECT * FROM elevi;';$('results').replaceChildren();window.renderActiveLesson?.();
  if(!p){const r=await fetch('./demo.sql');if(!r.ok)throw Error('Catalogul inițial nu poate fi încărcat.');if(!(await apply(await r.text())))throw Error('Catalogul inițial nu poate fi creat.')}else await save();
 }
};
