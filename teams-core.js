'use strict';
const TeamsCore=(()=>{
 const GRAPH='https://graph.microsoft.com',ROOT=GRAPH+'/v1.0',GUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i,MAX=2*1024*1024;
 function id(value){if(typeof value!=='string'||!GUID.test(value))throw Error('Identificator Microsoft invalid.');return value.toLowerCase()}
 function scope(tenant,user,team){return 'ms:'+id(tenant)+':'+id(user)+':'+id(team)}
 function identity(auth,me,tenant,context){
  if(!auth?.account||id(auth.account.tenantId)!==id(tenant)||id(me?.id)!==id(auth.account.localAccountId))throw Error('Contul Microsoft nu corespunde organizației configurate.');
  if(context?.user?.id&&id(context.user.id)!==id(me.id))throw Error('Conectează-te cu același cont folosit în Teams.');
  const contextTenant=context?.user?.tenant?.id;
  if(contextTenant&&id(contextTenant)!==id(tenant))throw Error('Clasa aparține altei organizații.');
  return {tenantId:id(tenant),userId:id(me.id),name:String(me.displayName||auth.account.name||'Utilizator Microsoft')};
 }
 class GraphError extends Error{constructor(status){super('Microsoft Graph: HTTP '+status);this.status=status}}
 function endpoint(value){const u=new URL(value,ROOT+'/');if(u.origin!==GRAPH||!u.pathname.startsWith('/v1.0/')||u.username||u.password)throw Error('Adresă Graph invalidă.');return u.href}
 function client(fetcher,token){return async(path,signal)=>{
  const url=endpoint(path.startsWith('/')?ROOT+path:path);
  const r=await fetcher(url,{headers:{Authorization:'Bearer '+token},cache:'no-store',credentials:'omit',redirect:'error',signal});
  if(!r.ok)throw new GraphError(r.status);return limitedJSON(r);
 }}
 async function limitedJSON(response){
  if(Number(response.headers.get('content-length'))>MAX)throw Error('Fișierul depășește 2 MB.');
  const reader=response.body.getReader(),decoder=new TextDecoder();let total=0,text='';
  try{for(;;){const r=await reader.read();if(r.done)break;total+=r.value.byteLength;if(total>MAX){await reader.cancel();throw Error('Fișierul depășește 2 MB.')}text+=decoder.decode(r.value,{stream:true})}text+=decoder.decode();return JSON.parse(text)}finally{reader.releaseLock()}
 }
 async function list(get,path,signal){
  const pathname=new URL(ROOT+path).pathname;let next=ROOT+path,result=[],seen=new Set();
  while(next){const u=new URL(endpoint(next));if(u.pathname!==pathname||seen.has(u.href)||seen.size>=100)throw Error('Paginarea Microsoft este invalidă.');seen.add(u.href);const page=await get(u.href,signal);if(!Array.isArray(page.value))throw Error('Răspuns Microsoft invalid.');result.push(...page.value);next=page['@odata.nextLink']||null}
  return result;
 }
 async function membership(get,team,signal){
  const [classes,taught]=await Promise.all([list(get,'/education/me/classes?$select=id,displayName',signal),list(get,'/education/me/taughtClasses?$select=id,displayName',signal)]);
  const match=classes.find(c=>typeof c.id==='string'&&c.id.toLowerCase()===id(team));
  const teacher=taught.find(c=>typeof c.id==='string'&&c.id.toLowerCase()===id(team));
  if(!match&&!teacher)throw Error('Contul nu este membru al clasei Teams curente.');
  return {teacher:!!teacher,name:String((teacher||match).displayName||'Clasa Teams')};
 }
 function downloadURL(value){const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password)throw Error('Adresa temporară SharePoint este invalidă.');return u.href}
 async function library(get,fetcher,team,signal){
  const group=id(team);let item=await get('/groups/'+group+'/drive/root:/DB-Lab/lectii.json',signal);
  const validateItem=x=>{if(!x?.file||typeof x.id!=='string'||!x.id||!Number.isFinite(x.size)||x.size<0)throw Error('Fișier SharePoint invalid.');if(x.size>MAX)throw Error('Biblioteca depășește 2 MB.')};validateItem(item);
  if(!item['@microsoft.graph.downloadUrl']){
   const path=item.parentReference?.driveId?'/drives/'+encodeURIComponent(item.parentReference.driveId)+'/items/'+encodeURIComponent(item.id):'/groups/'+group+'/drive/items/'+encodeURIComponent(item.id);
   const resolved=await get(path,signal);if(resolved.id!==item.id)throw Error('Fișierul SharePoint s-a schimbat. Reîncearcă.');item=resolved;validateItem(item);
  }
  const url=downloadURL(item['@microsoft.graph.downloadUrl']);
  // URL emis de Graph; nici tokenul, nici cookie-urile nu sunt trimise la descărcare.
  const response=await fetcher(url,{credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store',signal});
  if(!response.ok)throw new GraphError(response.status);return limitedJSON(response);
 }
 function message(e){if(e?.name==='AbortError')return 'Operația a expirat sau a fost întreruptă. Reîncearcă.';if(e.status===404)return 'Biblioteca nu există încă. Publică DB-Lab/lectii.json în biblioteca de documente a clasei.';if(e.status===401)return 'Sesiunea Microsoft a expirat. Reconectează-te.';if(e.status===403)return 'Acces refuzat. Verifică permisiunile aplicației și accesul contului la clasă / SharePoint.';return e instanceof TypeError?'Nu am putut contacta Microsoft. Verifică rețeaua și încearcă din nou.':e.message||'Operația nu a reușit.'}
 return {id,scope,identity,client,list,membership,library,limitedJSON,message,endpoint,GraphError};
})();
if(typeof module!=='undefined')module.exports=TeamsCore;
