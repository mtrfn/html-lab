'use strict';
// Shared validation for local storage, imported libraries and optional project metadata.
const LessonCore = (() => {
  const MAX_BYTES=2*1024*1024, MAX_LESSONS=100;
  function object(x){return x!==null&&typeof x==='object'&&!Array.isArray(x)}
  function text(x,name,max,required=false){
    if(typeof x!=='string'||x.length>max||(required&&!x.trim()))throw Error(name+': text '+(required?'obligatoriu, ':'')+'maxim '+max+' de caractere.');
    return x;
  }
  function lesson(x){
    if(!object(x))throw Error('Lecție invalidă.');
    if(typeof x.id!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(x.id)||['__proto__','constructor','prototype'].includes(x.id))throw Error('Identificator de lecție invalid.');
    if(!Array.isArray(x.hints)||x.hints.length!==3)throw Error('Lecția trebuie să conțină exact trei trepte de ajutor.');
    return {id:x.id,title:text(x.title,'Titlu',150,true),category:text(x.category,'Categorie',80,true),task:text(x.task,'Enunț',20000,true),setupSQL:text(x.setupSQL,'Baza inițială',200000),starterSQL:text(x.starterSQL,'SQL de pornire',100000),hints:x.hints.map((h,i)=>text(h,'Ajutor '+(i+1),20000,true))};
  }
  function library(x){
    if(!object(x)||x.format!=='DB-Lab-lessons'||x.version!==1||!Array.isArray(x.lessons))throw Error('Format invalid. Importă o bibliotecă DB-Lab-lessons, versiunea 1.');
    if(x.lessons.length>MAX_LESSONS)throw Error('Maximum 100 de lecții într-o bibliotecă.');
    if(new TextEncoder().encode(JSON.stringify(x)).length>MAX_BYTES)throw Error('Biblioteca depășește 2 MB.');
    const ids=new Set();const lessons=x.lessons.map(item=>{const result=lesson(item);if(ids.has(result.id))throw Error('Identificator duplicat: '+result.id);ids.add(result.id);return result});
    return {format:'DB-Lab-lessons',version:1,lessons};
  }
  function metadata(x){
    if(x==null)return null;
    if(!object(x)||typeof x.key!=='string'||!(/^(?:(?:builtin|local):|class:[a-f0-9-]{36}:[a-f0-9-]{36}:)[a-zA-Z0-9_-]{1,80}$/i).test(x.key))throw Error('Datele lecției din proiect sunt invalide.');
    const definition=lesson(x.definition);
    if(x.key.split(':').at(-1)!==definition.id)throw Error('Identificator de proiect / lecție incompatibil.');
    return {key:x.key,definition,hintsUsed:Number.isInteger(x.hintsUsed)&&x.hintsUsed>=0&&x.hintsUsed<=3?x.hintsUsed:0};
  }
  function project(x){
    if(!object(x)||x.version!==1||!Array.isArray(x.bytes)||!x.bytes.every(b=>Number.isInteger(b)&&b>=0&&b<=255)||typeof x.name!=='string'||typeof x.sql!=='string')throw Error('Proiect DB-Lab invalid.');
    return {version:1,name:x.name,sql:x.sql,bytes:x.bytes,lesson:metadata(x.lesson)};
  }
  function merge(existing,incoming){
    const map=new Map(library(existing).lessons.map(l=>[l.id,l]));
    library(incoming).lessons.forEach(l=>map.set(l.id,l));
    return library({format:'DB-Lab-lessons',version:1,lessons:[...map.values()]});
  }
  return {MAX_BYTES,lesson,library,metadata,project,merge};
})();
if(typeof module!=='undefined')module.exports=LessonCore;
