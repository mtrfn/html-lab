'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const init=require('./vendor/sql-wasm.js'),core=require('./lesson-core.js');
(async()=>{
 const library=core.library(JSON.parse(fs.readFileSync('lessons.json','utf8')));assert.equal(library.lessons.length,8);
 let output;const ctx={initSqlJs:()=>init({locateFile:f=>path.join(__dirname,'vendor',f)}),importScripts(){},postMessage:m=>output=m,Uint8Array,Error};vm.createContext(ctx);vm.runInContext(fs.readFileSync('worker.js','utf8'),ctx);
 const call=async m=>{output=null;await ctx.onmessage({data:{id:1,...m}});return output};
 const ok=async m=>{const r=await call(m);assert(!r.error,r.error);return r};
 await ok({kind:'load'});
 let free=await ok({kind:'exec',sql:"CREATE TABLE personal(id INTEGER PRIMARY KEY,nume TEXT);INSERT INTO personal VALUES(1,'Cartea mea');"});
 for(const l of library.lessons){
  const preview=await ok({kind:'lessonPreview',sql:l.setupSQL});
  let r=await ok({kind:'exec',sql:'SELECT nume FROM personal'});assert.equal(r.result[0].values[0][0],'Cartea mea','Lesson preview modified current project');
  await ok({kind:'load',bytes:preview.bytes});
  await ok({kind:'exec',sql:l.starterSQL});
  await ok({kind:'exec',sql:l.hints[2]});
  await ok({kind:'load',bytes:free.bytes});
 }
 const before=await ok({kind:'exec',sql:'SELECT * FROM personal'});
 const bad=await call({kind:'lessonPreview',sql:'CREATE TABLE bad(a);SELECT * FROM missing;'});assert(bad.error);
 const after=await ok({kind:'exec',sql:'SELECT * FROM personal'});assert.equal(JSON.stringify(after.result),JSON.stringify(before.result));
 const badFk=await call({kind:'lessonPreview',sql:'CREATE TABLE p(id INTEGER PRIMARY KEY); CREATE TABLE c(id INTEGER REFERENCES p(id)); INSERT INTO c VALUES(99);'});assert(badFk.error);
 // Imported content is data: validator never evaluates markup or SQL.
 const custom={...library.lessons[0],id:'custom',title:'<img src=x onerror=alert(1)>',setupSQL:'DROP TABLE personal;',hints:['<script>bad()</script>','syntax','example']};
 assert.equal(core.lesson(custom).title,custom.title);
 assert.throws(()=>core.library({...library,lessons:[custom,custom]}),/duplicat/);
 assert.throws(()=>core.lesson({...custom,id:'__proto__'}),/Identificator/);
 assert.throws(()=>core.lesson({...custom,hints:['only one']}),/trei/);
 assert.throws(()=>core.library({...library,version:2}),/Format/);
 assert.throws(()=>core.library({...library,lessons:Array.from({length:101},(_,i)=>({...custom,id:'x'+i}))}),/100/);
 assert.throws(()=>core.lesson({...custom,setupSQL:'x'.repeat(200001)}),/200000/);
 const merged=core.merge({format:'DB-Lab-lessons',version:1,lessons:[custom]},{format:'DB-Lab-lessons',version:1,lessons:[{...custom,title:'Updated'},library.lessons[0]]});assert.equal(merged.lessons.length,2);assert.equal(merged.lessons[0].title,'Updated');
 const legacy={format:'DB-Lab',version:1,name:'Legacy V1.0',sql:'SELECT * FROM personal',bytes:Array.from(free.bytes)};
 assert.equal(core.project(legacy).lesson,null);
 const metadata={key:'local:custom',definition:custom,hintsUsed:2};const exported={...legacy,lesson:metadata};
 assert.equal(core.project(JSON.parse(JSON.stringify(exported))).lesson.hintsUsed,2);
 assert.throws(()=>core.metadata({...metadata,key:'local:wrong'}),/incompatibil/);
 // Existing V1.0 worker can still load the V1.2 database bytes.
 await ok({kind:'load',bytes:core.project(exported).bytes});
 console.log('PASS V1.2: 8 lesson setups/starters/examples, isolated preview, failed preview rollback, FK validation, legacy projects, metadata roundtrip, library validation/merge and hostile text as data.');
})().catch(e=>{console.error(e);process.exitCode=1});
