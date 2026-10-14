const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const init=require('./vendor/sql-wasm.js'),builder=require('./row-editor.js');
(async()=>{
 let output; const ctx={initSqlJs:()=>init({locateFile:f=>path.resolve('vendor',f)}),importScripts(){},postMessage:m=>output=m,Uint8Array,Error};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync('worker.js','utf8'),ctx);
 const call=async m=>{await ctx.onmessage({data:{id:1,...m}});return output};
 const run=async sql=>{const r=await call({kind:'exec',sql});assert(!r.error,r.error);return r};
 await call({kind:'load'});
 let r=await run(`CREATE TABLE parent(a TEXT,b INTEGER,label TEXT,PRIMARY KEY(a,b)); INSERT INTO parent VALUES('O''Brien',2,'Etichetă'); CREATE TABLE child(id INTEGER PRIMARY KEY,a TEXT,b INTEGER,n TEXT DEFAULT 'implicit',g TEXT GENERATED ALWAYS AS (a||b) VIRTUAL,FOREIGN KEY(a,b) REFERENCES parent); WITH RECURSIVE x(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM x WHERE n<250) INSERT INTO parent SELECT 'extra',n,'Rând '||n FROM x;`);
 const t=r.state.find(t=>t.name==='child');
 let refs=await call({kind:'references',table:'child'});assert.equal(refs.groups[0].values.length,251);assert.deepEqual(Array.from(refs.groups[0].targets),['a','b']);
 const b=builder.build(t,{a:"O'Brien",b:2,n:''});assert(b.preview.includes("'O''Brien'"));
 r=await call({kind:'exec',sql:b.sql,params:b.params});assert(!r.error,r.error);let child=r.state.find(t=>t.name==='child');assert.equal(child.data.values[0][3],'');assert.equal(child.data.values[0][4],"O'Brien2");
 const u=builder.build(child,{id:8,n:null},child.data.values[0]);r=await call({kind:'exec',sql:u.sql,params:u.params});assert(!r.error);assert.equal(r.state.find(t=>t.name==='child').data.values[0][0],8);assert.equal(r.state.find(t=>t.name==='child').data.values[0][3],null);
 const defaults=builder.build(t,{});r=await call({kind:'exec',sql:defaults.sql,params:defaults.params});assert(!r.error);assert.equal(r.state.find(t=>t.name==='child').data.values[1][3],'implicit');
 r=await call({kind:'exec',sql:b.sql,params:['bad',999,'x']});assert(r.error);r=await run('SELECT count(*) FROM child');assert.equal(r.result[0].values[0][0],2);
 const bytes=Array.from(r.bytes),project=JSON.parse(JSON.stringify({format:'DB-Lab',version:1,name:'V1.0',sql:'SELECT 1',bytes}));r=await call({kind:'load',bytes:project.bytes});assert(!r.error);assert.equal(r.state.find(t=>t.name==='child').data.values.length,2);
 // Literal preview must have the same outcome as parameterized execution, including NUL and identifiers.
 await run('CREATE TABLE "odd""table"("x""y" TEXT)');const odd={name:'odd"table'};
 const literal=builder.build(odd,{'x"y':"a\0b'\nș"});await run(literal.preview);
 r=await run('SELECT hex("x""y") FROM "odd""table"');assert.equal(r.result[0].values[0][0],Buffer.from("a\0b'\nș").toString('hex').toUpperCase());
 console.log('PASS V1.1: FK compuse/implicite, 251 referințe, insert, edit PK, NULL/text gol/default, generate, rollback, format V1.0, SQL preview.');
})().catch(e=>{console.error(e);process.exitCode=1});
