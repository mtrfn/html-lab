'use strict';
// The stored project format stays at version 1; this is only a UI update.
const RowSQL = {
  quote: name => '"'+String(name).replaceAll('"','""')+'"',
  literal(value) {
    if(value===null)return 'NULL';
    if(typeof value==='number') {if(!Number.isFinite(value))throw Error('Număr invalid');return String(value)}
    if(value.includes('\0'))return "CAST(X'"+Array.from(new TextEncoder().encode(value),b=>b.toString(16).padStart(2,'0')).join('')+"' AS TEXT)";
    return "'"+value.replaceAll("'","''")+"'";
  },
  build(t, entries, original) {
    const keys=Object.keys(entries), names=keys.map(this.quote), params=Object.values(entries);
    let sql, preview;
    if(!original){
      sql=keys.length?'INSERT INTO '+this.quote(t.name)+' ('+names.join(', ')+') VALUES ('+keys.map(()=>'?').join(', ')+');':'INSERT INTO '+this.quote(t.name)+' DEFAULT VALUES;';
      preview=keys.length?'INSERT INTO '+this.quote(t.name)+' ('+names.join(', ')+') VALUES ('+params.map(v=>this.literal(v)).join(', ')+');':sql;
    }else{
      if(!keys.length)throw Error('Nu există modificări de aplicat.');
      const pk=t.columns.filter(c=>c.pk).sort((a,b)=>a.pk-b.pk);
      if(!pk.length)throw Error('Editarea necesită o cheie primară.');
      const old=pk.map(c=>original[t.data.columns.indexOf(c.name)]);
      if(old.some(v=>v===null||v===undefined))throw Error('Cheia primară nu poate fi NULL.');
      const base='UPDATE '+this.quote(t.name)+' SET ';
      sql=base+names.map(n=>n+' = ?').join(', ')+' WHERE '+pk.map(c=>this.quote(c.name)+' IS ?').join(' AND ')+';';
      preview=base+names.map((n,i)=>n+' = '+this.literal(params[i])).join(', ')+' WHERE '+pk.map((c,i)=>this.quote(c.name)+' IS '+this.literal(old[i])).join(' AND ')+';';
      params.push(...old);
    }
    return {sql,params,preview};
  }
};
if(typeof module!=='undefined')module.exports=RowSQL;

async function openRowEditor(original){
  const t=current();if(!t)return;
  let groups;
  try{groups=(await call({kind:'references',table:t.name})).groups}catch(e){msg('Nu se poate deschide formularul: '+e.message);return}
  const dialog=$('rowDialog'),fields=$('rowFields'),references=$('rowReferences'),controls=new Map();
  fields.replaceChildren();references.replaceChildren();$('rowError').textContent='';
  $('rowTitle').textContent=(original?'Editează: ':'Adaugă: ')+t.name;
  let prepared=null,applying=false;
  function read(c){
    if(c.mode.value==='default')return undefined;
    if(c.mode.value==='null')return null;
    if(c.kind.value==='text')return c.input.value;
    const raw=c.input.value.trim();
    if(!raw||!/^[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?$/.test(raw)||!Number.isFinite(Number(raw)))throw Error(c.column.name+': introdu un număr valid sau alege Text.');
    const n=Number(raw);
    if(Number.isInteger(n)&&!Number.isSafeInteger(n))throw Error(c.column.name+': pentru întregi foarte mari folosește editorul SQL.');
    return n;
  }
  function update(){
    prepared=null;
    for(const c of controls.values())c.input.disabled=c.kind.disabled=c.mode.value!=='value';
    try{
      const entries=Object.create(null);
      for(const [name,c] of controls){
        if(original&&!c.dirty)continue;
        const value=read(c);
        if(value!==undefined&&(!original||value!==original[t.data.columns.indexOf(name)]))entries[name]=value;
      }
      prepared=RowSQL.build(t,entries,original);$('rowPreview').textContent=prepared.preview;$('rowError').textContent='';
    }catch(e){$('rowPreview').textContent='Completează formularul pentru previzualizare.';$('rowError').textContent=e.message}
    $('rowApply').disabled=!prepared||applying;
  }
  for(const column of t.columns.filter(c=>!c.hidden)){
    const container=document.createElement('div');container.className='row-field';
    const label=document.createElement('label'),id='rowValue'+controls.size;
    label.htmlFor=id;label.textContent=column.name+' · '+(column.type||'fără tip')+(column.pk?' · PK':'')+(column.notnull?' · obligatoriu':'');
    const input=document.createElement('textarea');input.id=id;input.rows=2;
    const mode=document.createElement('select');mode.setAttribute('aria-label','Mod pentru '+column.name);
    mode.add(new Option('Valoare','value'));mode.add(new Option('NULL','null'));
    if(!original)mode.add(new Option('Implicit / automat','default'));
    const kind=document.createElement('select');kind.setAttribute('aria-label','Tipul valorii pentru '+column.name);kind.add(new Option('Text','text'));kind.add(new Option('Număr','number'));
    const old=original?.[t.data.columns.indexOf(column.name)];
    input.value=old==null?'':String(old);
    kind.value=original?(typeof old==='number'?'number':'text'):(/INT|REAL|FLOA|DOUB|NUM|DEC|BOOL/i.test(column.type)?'number':'text');
    mode.value=original?(old===null?'null':'value'):'default';
    const blob=/BLOB/i.test(column.type);
    const hint=document.createElement('small');hint.textContent=blob?'BLOB: folosește editorul SQL pentru valori binare.':column.dflt_value!==null?'Valoare implicită: '+column.dflt_value:'NULL este diferit de textul gol.';
    controls.set(column.name,{column,input,mode,kind,blob});container.append(label,mode,input,kind,hint);fields.append(container);
    for(const element of [input,mode,kind])element.oninput=()=>{controls.get(column.name).dirty=true;update();syncReferences()};
  }
  const selectors=[];
  function syncReferences(){
    for(const {group,select} of selectors){
      try{const values=group.from.map(n=>read(controls.get(n)));const index=group.values.findIndex(row=>values.every((v,i)=>v===row[i]));select.value=index<0?'':String(index)}catch{select.value=''}
    }
  }
  for(const group of groups){
    if(group.from.some(n=>!controls.has(n)))continue;
    const label=document.createElement('label');label.className='reference-field';label.textContent=group.from.join(' + ')+' → '+group.table+' ('+group.targets.join(', ')+')';
    const select=document.createElement('select');select.setAttribute('aria-label','Referință '+group.from.join(' + '));select.add(new Option('Alege o referință existentă / valoare manuală',''));
    group.values.forEach((row,i)=>{const option=new Option(row.map(v=>v===null?'NULL':v instanceof Uint8Array?'[BLOB]':String(v)).join(' · '),String(i));option.disabled=row.some(v=>v instanceof Uint8Array);select.add(option)});
    select.onchange=()=>{if(select.value==='')return;const row=group.values[Number(select.value)];group.from.forEach((name,i)=>{const c=controls.get(name);c.dirty=true;c.mode.value=row[i]===null?'null':'value';c.kind.value=typeof row[i]==='number'?'number':'text';c.input.value=row[i]===null?'':String(row[i])});update();syncReferences()};
    selectors.push({group,select});label.append(select);references.append(label);
  }
  $('rowCancel').onclick=()=>dialog.close();
  dialog.oncancel=e=>{if(applying)e.preventDefault()};
  $('rowForm').onsubmit=async e=>{
    e.preventDefault();if(applying)return;update();if(!prepared)return;
    const command=prepared;applying=true;
    for(const el of dialog.querySelectorAll('input,textarea,select,button'))el.disabled=true;
    const ok=await apply(command.sql,command.params);applying=false;
    if(ok)dialog.close();else{
      const error=$('message').textContent;
      for(const el of dialog.querySelectorAll('input,textarea,select,button'))el.disabled=false;
      update();$('rowError').textContent=error;
    }
  };
  update();syncReferences();dialog.showModal();
}
