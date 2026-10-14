importScripts('./vendor/sql-wasm.js');
let SQL,db;
const ready=initSqlJs({locateFile:f=>'./vendor/'+f}).then(s=>SQL=s);
const quote=x=>'"'+String(x).replaceAll('"','""')+'"';
function rows(sql,target=db){const r=target.exec(sql)[0];return r?r.values.map(v=>Object.fromEntries(r.columns.map((k,i)=>[k,v[i]]))):[]}
function snapshot(target=db){return rows("SELECT name FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",target).map(t=>({name:t.name,columns:rows('PRAGMA table_xinfo('+quote(t.name)+')',target),foreign:rows('PRAGMA foreign_key_list('+quote(t.name)+')',target),data:target.exec('SELECT * FROM '+quote(t.name)+' LIMIT 200')[0]||{columns:[],values:[]}}))}
onmessage=async e=>{let old;try{await ready;const m=e.data;
if(m.kind==='lessonPreview'){
 const candidate=new SQL.Database();
 try{
  candidate.exec('PRAGMA foreign_keys=ON');candidate.exec(m.sql);
  if(candidate.exec('PRAGMA foreign_key_check')[0]?.values.length)throw Error('Relațiile bazei inițiale sunt încălcate.');
  const state=snapshot(candidate),bytes=candidate.export();
  postMessage({id:m.id,state,bytes});
 }finally{candidate.close()}
 return;
}
if(m.kind==='references'){const tables=snapshot();const t=tables.find(t=>t.name===m.table);if(!t)throw Error('Tabel inexistent');const groups=[];for(const id of new Set(t.foreign.map(f=>f.id))){const parts=t.foreign.filter(f=>f.id===id).sort((a,b)=>a.seq-b.seq),parent=tables.find(t=>t.name===parts[0].table);if(!parent)throw Error('Tabel referit inexistent: '+parts[0].table);const pk=parent.columns.filter(c=>c.pk).sort((a,b)=>a.pk-b.pk);const targets=parts.map((f,i)=>f.to||pk[i]?.name);if(targets.some(x=>!x))throw Error('Cheie externă incompletă');const label=parent.columns.find(c=>!targets.includes(c.name)&&/TEXT|CHAR|CLOB/i.test(c.type));const cols=[...targets,...(label?[label.name]:[])];const data=db.exec('SELECT DISTINCT '+cols.map(quote).join(',')+' FROM '+quote(parent.name))[0];groups.push({table:parent.name,from:parts.map(f=>f.from),targets,values:data?.values||[]});}postMessage({id:m.id,groups});return;}if(m.kind==='load'){const candidate=m.bytes?new SQL.Database(new Uint8Array(m.bytes)):new SQL.Database();if(candidate.exec('PRAGMA integrity_check')[0]?.values[0][0]!=='ok'){candidate.close();throw Error('Bază SQLite deteriorată.')}old=db;db=candidate;db.exec('PRAGMA foreign_keys=ON');}else{old=db;db=new SQL.Database(old.export());db.exec('PRAGMA foreign_keys=ON');if(m.params)db.run(m.sql,m.params);else var result=db.exec(m.sql);if(db.exec('PRAGMA foreign_key_check')[0]?.values.length)throw Error('Relațiile dintre tabele sunt încălcate.');}
const state=snapshot(),bytes=db.export();db.exec('PRAGMA foreign_keys=ON');old?.close();postMessage({id:e.data.id,state,bytes,result:result||[]});}catch(err){if(old){db?.close();db=old;db.exec('PRAGMA foreign_keys=ON');}postMessage({id:e.data.id,error:err.message});}};
