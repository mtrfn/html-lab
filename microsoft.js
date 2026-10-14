'use strict';
(async()=>{
 const byId=id=>document.getElementById(id),host=DBLabHost,cfg=window.DBLabMicrosoftConfig;
 const note=byId('microsoftStatus'),classNote=byId('classLibraryStatus');
 let pca,msal,context,teamId,working=false,epoch=0,controller;
 function locked(value){document.documentElement.classList.toggle('teams-locked',value)}
 function access(value){window.DBLabLessons?.setAuthor(value)}
 function status(value){note.textContent=value}
 if(!host.embedded){byId('teamsLocalNote').hidden=false;byId('teamsActions').hidden=true;status('Mod local. Pentru lecțiile clasei, deschide DB-Lab din fila clasei în Teams.');return}
 access(false);locked(true);
 await Promise.all([window.dbReady,window.lessonsReady]);
 context=await host.ready;
 try{
  TeamsCore.id(cfg?.clientId);TeamsCore.id(cfg?.tenantId);
 }catch{status('Integrarea Microsoft nu este configurată încă. Administratorul trebuie să completeze microsoft-config.js folosind ghidul V1.3.');byId('connectMicrosoft').disabled=true;return}
 if(!context){status(host.error||'Contextul Teams nu este disponibil. Deschide aplicația într-o filă a clasei.');byId('connectMicrosoft').disabled=true;return}
 try{teamId=TeamsCore.id(context.team?.groupId)}catch{status('Deschide DB-Lab într-un canal al unei clase Teams. Această versiune nu folosește chat-uri sau canale partajate între organizații.');byId('connectMicrosoft').disabled=true;return}
 if(context.channel?.membershipType&&context.channel.membershipType!=='Regular'){status('Canalele private și partajate nu sunt suportate. Folosește un canal standard al clasei.');byId('connectMicrosoft').disabled=true;return}
 byId('teamsClassName').textContent=context.team?.displayName||'Clasa Teams';
 try{
  msal=await import('https://esm.sh/@azure/msal-browser@5.22.0');
  pca=await msal.createNestablePublicClientApplication({auth:{clientId:cfg.clientId,authority:'https://login.microsoftonline.com/'+cfg.tenantId,supportsNestedAppAuth:true},cache:{cacheLocation:'memoryStorage'}});
 }catch{status('Componenta de autentificare nu a putut fi încărcată. Verifică accesul la serviciile Microsoft și reîncarcă fila.');return}
 status('Pregătit pentru conectare. Se vor verifica identitatea și apartenența la clasa curentă.');byId('connectMicrosoft').disabled=false;
 const scopes=['User.Read','EduRoster.ReadBasic','Files.Read.All'];
 async function token(){
  const account=pca.getAllAccounts().find(a=>a.tenantId?.toLowerCase()===cfg.tenantId.toLowerCase()&&a.localAccountId?.toLowerCase()===context.user?.id?.toLowerCase())||null;
  let result;
  try{result=await pca.acquireTokenSilent({scopes,account})}catch(e){if(!(e instanceof msal.InteractionRequiredAuthError)&&account)throw Error('Autentificarea nu a reușit. Reconectează-te și verifică aprobarea administratorului.');result=await pca.acquireTokenPopup({scopes,loginHint:context.user?.loginHint})}
  return result;
 }
 async function connect(){
  if(working)return;working=true;if(!(await DBLabLessons.prepareSwitch())){working=false;return}if(!(await DBLabWorkspace.flush())){status('Salvarea locală a eșuat. Exportă proiectul înainte de schimbarea sesiunii.');working=false;return}const request=++epoch;controller?.abort();controller=new AbortController();
  byId('connectMicrosoft').disabled=true;byId('refreshClassLessons').disabled=true;byId('closeMicrosoft').disabled=true;
  locked(true);access(false);byId('microsoftAccount').textContent='';classNote.textContent='';
  let timer;
  try{
   await DBLabWorkspace.lock();await DBLabLessons.resetWorkspace();
   status('Conectare Microsoft…');let auth;
   try{auth=await token()}catch{throw Error('Conectarea nu a fost finalizată. Verifică contul și aprobarea permisiunilor pentru DB-Lab.')}
   if(request!==epoch)return;
   timer=setTimeout(()=>controller.abort(),25000);
   const get=TeamsCore.client(fetch,auth.accessToken),me=await get('/me?$select=id,displayName',controller.signal);
   const user=TeamsCore.identity(auth,me,cfg.tenantId,context);
   const role=await TeamsCore.membership(get,teamId,controller.signal);
   if(request!==epoch)return;
   clearTimeout(timer);
   await DBLabWorkspace.open(TeamsCore.scope(user.tenantId,user.userId,teamId));
   await DBLabLessons.resetWorkspace();
   access(role.teacher);locked(false);
   byId('microsoftAccount').textContent=user.name+' · '+(role.teacher?'Profesor al clasei':'Elev / membru al clasei');
   byId('teamsClassName').textContent=role.name;
   status('Cont verificat. Proiectele se salvează local, separat pentru acest cont și această clasă.');
   classNote.textContent='Încarc lecțiile din SharePoint…';
   timer=setTimeout(()=>controller.abort(),25000);
   try{
    const data=await TeamsCore.library(get,fetch,teamId,controller.signal);
    if(request!==epoch)return;
    DBLabLessons.replaceClass(user.tenantId,teamId,data);
    classNote.textContent=LessonCore.library(data).lessons.length+' lecții ale clasei încărcate. Le găsești în Lecții SQL → Lecțiile clasei.';
   }catch(e){if(request===epoch){DBLabLessons.clearClass();classNote.textContent=TeamsCore.message(e)}}
   byId('refreshClassLessons').disabled=false;byId('closeMicrosoft').disabled=false;
  }catch(e){
   if(request===epoch){access(false);locked(true);DBLabLessons.clearClass();status(TeamsCore.message(e))}
  }finally{clearTimeout(timer);working=false;if(request===epoch)byId('connectMicrosoft').disabled=false}
 }
 byId('connectMicrosoft').onclick=connect;byId('refreshClassLessons').onclick=connect;
 byId('closeMicrosoft').onclick=async()=>{
  if(working)return;working=true;if(!(await DBLabLessons.prepareSwitch())){working=false;return}if(!(await DBLabWorkspace.flush())){status('Salvarea locală a eșuat. Exportă proiectul înainte de schimbarea sesiunii.');working=false;return}epoch++;controller?.abort();locked(true);access(false);
  try{await DBLabWorkspace.lock();await DBLabLessons.resetWorkspace();pca.setActiveAccount?.(null);byId('microsoftAccount').textContent='';classNote.textContent='';status('Sesiunea DB-Lab este închisă. Contul Teams rămâne conectat. Lucrările locale sunt păstrate pentru acest cont.')}catch{status('Sesiunea a fost închisă. Reîncarcă fila înainte de următoarea conectare.')}
  finally{working=false;byId('refreshClassLessons').disabled=true;byId('closeMicrosoft').disabled=true}
 };
})().catch(()=>{const el=document.getElementById('microsoftStatus');if(el)el.textContent='Integrarea Microsoft nu a putut fi inițializată. Reîncarcă fila.'});
