'use strict';
const ERDCore=(()=>{
 const equal=(a,b)=>String(a).replace(/[A-Z]/g,c=>c.toLowerCase())===String(b).replace(/[A-Z]/g,c=>c.toLowerCase());
 function relations(tables){return tables.flatMap(t=>[...new Set(t.foreign.map(f=>f.id))].map(id=>{const parts=t.foreign.filter(f=>f.id===id).sort((a,b)=>a.seq-b.seq),parent=tables.find(p=>equal(p.name,parts[0].table)),pk=parent?.columns.filter(c=>c.pk).sort((a,b)=>a.pk-b.pk)||[];const pairs=parts.map((f,i)=>({from:f.from,to:f.to||pk[i]?.name||'?'}));return {key:JSON.stringify([t.name,id]),child:t.name,parent:parent?.name||parts[0].table,pairs,valid:!!parent&&pairs.every(p=>parent.columns.some(c=>equal(c.name,p.to))),onDelete:parts[0].on_delete,onUpdate:parts[0].on_update}}))}
 function layout(tables){const p=new Map();let y=36;for(let i=0;i<tables.length;i+=3){const group=tables.slice(i,i+3);group.forEach((t,j)=>p.set(t.name,{x:40+j*390,y}));y+=Math.max(...group.map(t=>68+t.columns.length*30))+90}return p}
 return {equal,relations,layout};
})();
if(typeof module!=='undefined')module.exports=ERDCore;
