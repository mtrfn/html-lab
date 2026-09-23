import { createNestablePublicClientApplication, InteractionRequiredAuthError } from "https://esm.sh/@azure/msal-browser@5.22.0";

const CLIENT_ID="186ef62f-0e5b-47c2-ab13-2a33600f55cd";
const TENANT_ID="8850faa5-c5a4-4364-bf6e-7ee02b1f4789";
const SCOPES=["User.Read","EduAssignments.ReadWrite","EduRoster.ReadBasic","Files.ReadWrite"];

const accountEl=document.getElementById("account"), statusEl=document.getElementById("graphStatus"),
 assignmentsEl=document.getElementById("assignments"), connectBtn=document.getElementById("connect"),
 refreshBtn=document.getElementById("refreshAssignments"), teamNameEl=document.getElementById("teamName"),
 teamHint=document.getElementById("teamHint"), selection=document.getElementById("selection"),
 selectedAssignment=document.getElementById("selectedAssignment"), submissionInfo=document.getElementById("submissionInfo"),
 turnInActions=document.getElementById("turnInActions"), attachBtn=document.getElementById("attachWork"),
 submitBtn=document.getElementById("submitWork"), turnInStatus=document.getElementById("turnInStatus");

let pca=null, teamsInfo=null, currentToken=null, currentAssignments=[], selected=null, currentSubmission=null, attachedResource=null;
const diagDetails=document.getElementById("diagDetails");
function diag(id,state,text,detail=""){const el=document.getElementById(id);if(!el)return;const mark=state==="ok"?"✓":state==="fail"?"✗":state==="run"?"→":"○";el.textContent=`${mark} ${text}`;el.className=state==="ok"?"diag-ok":state==="fail"?"diag-fail":state==="run"?"diag-run":"";if(detail)diagDetails.textContent+=(diagDetails.textContent?"\n\n":"")+detail;}
function resetDiag(){[["diagAuth","Token Microsoft Graph"],["diagSubmission","Submission elev"],["diagFolder","setUpResourcesFolder"],["diagUpload","Upload fișier SharePoint"],["diagResource","Atașare resource la submission"],["diagReady","Pregătit pentru Predare"]].forEach(([id,t])=>diag(id,"",t));diagDetails.textContent="";}
function jwtScopes(token){try{const s=token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/");const p=JSON.parse(atob(s));return p.scp||"";}catch{return "(nu pot citi scopes)";}}


function status(t,err=false){statusEl.textContent=t;statusEl.style.color=err?"#b42318":"#526078";}
function turnStatus(t,kind=""){turnInStatus.textContent=t;turnInStatus.className=kind==="error"?"danger-note":kind==="success"?"success-note":"muted";}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function fmt(d){if(!d)return "—";try{return new Intl.DateTimeFormat("ro-RO",{dateStyle:"medium",timeStyle:"short"}).format(new Date(d));}catch{return d;}}
function cleanFileName(){
 const input=document.getElementById("filename");
 let n=(input.value||"lucrare.html").trim().replace(/[\\/:*?"<>|]/g,"_");
 if(!/\.html?$/i.test(n))n+=".html";
 input.value=n; return n;
}
async function graph(url,token,options={}){
 const headers={Authorization:`Bearer ${token}`,...(options.headers||{})};
 const r=await fetch(url.startsWith("https://")?url:"https://graph.microsoft.com/v1.0"+url,{...options,headers});
 if(!r.ok)throw new Error(`Graph ${r.status}: ${await r.text()}`);
 if(r.status===204)return null;
 const ct=r.headers.get("content-type")||"";
 return ct.includes("application/json")?r.json():r.text();
}
async function init(){
 teamsInfo=await (window.htmlLabTeamsReady||Promise.resolve(null));
 const c=teamsInfo?.context;
 const display=c?.team?.displayName || c?.channel?.displayName || "";
 teamNameEl.textContent=display || (teamsInfo?.teamId ? "Echipă Teams detectată" : "Nedetectată");
 teamHint.textContent=teamsInfo?.teamId ? `ID echipă detectat: ${teamsInfo.teamId}` : "Deschide HTML Lab ca filă într-un canal al clasei pentru filtrare automată.";
 pca=await createNestablePublicClientApplication({auth:{clientId:CLIENT_ID,authority:`https://login.microsoftonline.com/${TENANT_ID}`,supportsNestedAppAuth:true}});
 status("Autentificarea este pregătită.");
}
function ctxAccount(){
 const h=teamsInfo?.context?.user?.loginHint;
 if(!h)return null;
 return pca.getAllAccounts().find(a=>(a.username||"").toLowerCase()===h.toLowerCase())||null;
}
async function token(){
 let a=pca.getActiveAccount?.()||ctxAccount()||pca.getAllAccounts()[0]||null;
 try{
  const r=await pca.acquireTokenSilent({scopes:SCOPES,account:a});
  if(r.account)pca.setActiveAccount?.(r.account); return r;
 }catch(e){
  if(e instanceof InteractionRequiredAuthError||!a){
   const r=await pca.acquireTokenPopup({scopes:SCOPES,loginHint:teamsInfo?.context?.user?.loginHint});
   if(r.account)pca.setActiveAccount?.(r.account); return r;
  }
  throw e;
 }
}
function render(items){
 currentAssignments=items;
 selection.classList.add("hidden"); turnInActions.classList.add("hidden");
 currentSubmission=null; attachedResource=null; submitBtn.disabled=true; turnStatus("");
 if(!items.length){assignmentsEl.innerHTML='<p class="muted">Nu au fost găsite teme pentru clasa curentă.</p>';return;}
 assignmentsEl.innerHTML=items.map((a,i)=>`<article class="assignment" data-i="${i}">
 <h3>${esc(a.displayName||"Temă fără titlu")}</h3>
 <p><b>Termen:</b> ${esc(fmt(a.dueDateTime))}</p>
 <p><b>Stare:</b> ${esc(a.status||"—")}</p>
 <button type="button">Selectează tema</button></article>`).join("");
 assignmentsEl.querySelectorAll(".assignment").forEach(el=>el.onclick=()=>choose(Number(el.dataset.i),el));
}
async function choose(i,el){
 selected=currentAssignments[i]; currentSubmission=null; attachedResource=null; submitBtn.disabled=true; turnStatus("");
 assignmentsEl.querySelectorAll(".assignment").forEach(x=>x.classList.remove("selected")); el.classList.add("selected");
 selection.classList.remove("hidden"); turnInActions.classList.add("hidden");
 selectedAssignment.innerHTML=`<b>${esc(selected.displayName)}</b><br>Termen: ${esc(fmt(selected.dueDateTime))}`;
 submissionInfo.textContent="Verific tema și submission-ul contului curent…";
 try{
  const fullAssignment=await graph(`/education/classes/${encodeURIComponent(selected.classId)}/assignments/${encodeURIComponent(selected.id)}?$select=id,classId,displayName,status,allowStudentsToAddResourcesToSubmission,allowLateSubmissions,dueDateTime,closeDateTime`,currentToken);
  selected={...selected,...fullAssignment};
  if(!selected.allowStudentsToAddResourcesToSubmission){
   submissionInfo.textContent="Această temă nu permite elevilor să adauge fișiere proprii. Activează această opțiune în temă înainte de test.";
   return;
  }
  const d=await graph(`/education/classes/${encodeURIComponent(selected.classId)}/assignments/${encodeURIComponent(selected.id)}/submissions?$select=id,status,submittedDateTime,reassignedDateTime,resourcesFolderUrl`,currentToken);
  const subs=d.value||[];
  if(subs.length!==1){
   submissionInfo.textContent=subs.length===0
    ?"Nu există submission asociat acestui cont. Pentru predare, deschide aplicația cu un cont de elev."
    :`Au fost returnate ${subs.length} submissions. Acesta este un cont cu acces de profesor; V3.2 nu permite predarea din acest mod.`;
   return;
  }
  currentSubmission=subs[0];
  if(!["working","returned","reassigned"].includes(currentSubmission.status)){
   submissionInfo.textContent=`Submission detectat, dar starea este „${currentSubmission.status}”. Pentru atașare trebuie să fie în lucru.`;
   return;
  }
  submissionInfo.textContent=`Submission elev detectat: ${currentSubmission.status}. Poți atașa lucrarea HTML.`;
  turnInActions.classList.remove("hidden");
 }catch(e){submissionInfo.textContent="Nu am putut verifica submission-ul: "+e.message;}
}
async function attachWork(){
 if(!selected||!currentSubmission)return;
 resetDiag();diag("diagAuth","ok","Token Microsoft Graph",`Scopes token: ${jwtScopes(currentToken)}`);diag("diagSubmission","ok",`Submission elev (${currentSubmission.status})`,`Submission ID: ${currentSubmission.id}`);
 attachBtn.disabled=true;submitBtn.disabled=true;turnStatus("Rulez diagnosticul de atașare…");
 const base=`/education/classes/${encodeURIComponent(selected.classId)}/assignments/${encodeURIComponent(selected.id)}/submissions/${encodeURIComponent(currentSubmission.id)}`;
 try{
  diag("diagFolder","run","setUpResourcesFolder — în curs");
  let setup;
  try{setup=await graph(base+"/setUpResourcesFolder",currentToken,{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"});diag("diagFolder","ok","setUpResourcesFolder — HTTP OK",`Răspuns:\n${JSON.stringify(setup,null,2)}`);}
  catch(e){diag("diagFolder","fail","setUpResourcesFolder — EȘUAT",String(e.message||e));throw new Error("PAS 3 setUpResourcesFolder: "+(e.message||e));}
  const refreshed=await graph(base+"?$select=id,status,resourcesFolderUrl",currentToken);currentSubmission={...currentSubmission,...refreshed};
  const folderUrl=currentSubmission.resourcesFolderUrl||setup?.resourcesFolderUrl;if(!folderUrl)throw new Error("PAS 3: resourcesFolderUrl lipsește.");
  diag("diagFolder","ok","setUpResourcesFolder — folder disponibil",`resourcesFolderUrl: ${folderUrl}`);
  const fileName=cleanFileName();diag("diagUpload","run","Upload fișier SharePoint — în curs");
  let driveItem;
  try{driveItem=await graph(`${folderUrl}:/${encodeURIComponent(fileName)}:/content`,currentToken,{method:"PUT",headers:{"Content-Type":"text/html; charset=utf-8"},body:document.getElementById("editor").value});diag("diagUpload","ok","Upload fișier SharePoint — HTTP OK",`DriveItem ID: ${driveItem?.id||"n/a"}\nWeb URL: ${driveItem?.webUrl||"n/a"}`);}
  catch(e){diag("diagUpload","fail","Upload fișier SharePoint — EȘUAT",String(e.message||e));throw new Error("PAS 4 Upload SharePoint: "+(e.message||e));}
  const m=folderUrl.match(/\/drives\/([^/]+)\/items\/([^/:?]+)/i);if(!m)throw new Error("PAS 4: nu pot extrage driveId din resourcesFolderUrl.");
  const fileUrl=`https://graph.microsoft.com/v1.0/drives/${m[1]}/items/${driveItem.id}`;
  diag("diagResource","run","Atașare resource la submission — în curs");
  try{attachedResource=await graph(base+"/resources",currentToken,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({resource:{"@odata.type":"#microsoft.graph.educationFileResource",displayName:fileName,fileUrl}})});diag("diagResource","ok","Atașare resource — HTTP OK",`Resource:\n${JSON.stringify(attachedResource,null,2)}`);}
  catch(e){diag("diagResource","fail","Atașare resource — EȘUAT",String(e.message||e));throw new Error("PAS 5 Atașare resource: "+(e.message||e));}
  submitBtn.disabled=false;diag("diagReady","ok","Pregătit pentru Predare");turnStatus(`Fișier atașat: ${fileName}. Diagnosticul a trecut toate etapele.`,"success");
 }catch(e){console.error(e);turnStatus("Atașarea a eșuat: "+(e.message||e),"error");}
 finally{attachBtn.disabled=false;}
}
async function submitWork(){
 if(!selected||!currentSubmission||!attachedResource)return;
 const ok=confirm(`Predai acum lucrarea „${cleanFileName()}” la tema „${selected.displayName}”?\n\nDupă confirmare, lucrarea va apărea ca predată în Teams.`);
 if(!ok)return;
 attachBtn.disabled=true; submitBtn.disabled=true; turnStatus("Predau oficial lucrarea în Teams…");
 try{
  const base=`/education/classes/${encodeURIComponent(selected.classId)}/assignments/${encodeURIComponent(selected.id)}/submissions/${encodeURIComponent(currentSubmission.id)}`;
  const result=await graph(base+"/submit",currentToken,{method:"POST"});
  currentSubmission=result||currentSubmission;
  submissionInfo.textContent=`Lucrare predată. Stare submission: ${currentSubmission.status||"submitted"}.`;
  turnStatus("✓ Lucrarea a fost predată în Teams. Profesorul o poate vedea în resursele predate.","success");
  turnInActions.classList.add("hidden");
 }catch(e){
  console.error(e); submitBtn.disabled=false; attachBtn.disabled=false;
  turnStatus("Predarea a eșuat: "+(e.message||e),"error");
 }
}
async function load(){
 connectBtn.disabled=true;refreshBtn.disabled=true;
 try{
  status("Obțin tokenul Microsoft Graph…");const a=await token();currentToken=a.accessToken;
  accountEl.textContent=`Conectat: ${a.account?.name||a.account?.username||"utilizator Microsoft"}`;
  status("Citesc temele utilizatorului…");
  const d=await graph("/education/me/assignments?$select=id,classId,displayName,dueDateTime,status&$orderby=dueDateTime desc&$top=100",currentToken);
  let items=d.value||[]; const teamId=teamsInfo?.teamId;
  if(teamId){
   items=items.filter(x=>(x.classId||"").toLowerCase()===teamId.toLowerCase());
   teamHint.textContent=`Filtrare activă după clasa Teams curentă (${teamId}).`;
  }
  render(items);status(`Teme afișate pentru clasa curentă: ${items.length}.`);refreshBtn.disabled=false;
 }catch(e){console.error(e);status("Eroare: "+(e.message||e),true);}
 finally{connectBtn.disabled=false;}
}
connectBtn.onclick=load;refreshBtn.onclick=load;attachBtn.onclick=attachWork;submitBtn.onclick=submitWork;
init().catch(e=>status("Inițializarea a eșuat: "+(e.message||e),true));