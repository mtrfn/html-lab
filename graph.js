import { createNestablePublicClientApplication, InteractionRequiredAuthError } from "https://esm.sh/@azure/msal-browser@5.22.0";

const CLIENT_ID="186ef62f-0e5b-47c2-ab13-2a33600f55cd";
const TENANT_ID="8850faa5-c5a4-4364-bf6e-7ee02b1f4789";
const SCOPES=["User.Read","EduAssignments.ReadWrite","EduRoster.ReadBasic","Files.ReadWrite.All"];

const accountEl=document.getElementById("account"), statusEl=document.getElementById("graphStatus"),
 assignmentsEl=document.getElementById("assignments"), connectBtn=document.getElementById("connect"),
 refreshBtn=document.getElementById("refreshAssignments"), teamNameEl=document.getElementById("teamName"),
 teamHint=document.getElementById("teamHint"), selection=document.getElementById("selection"),
 selectedAssignment=document.getElementById("selectedAssignment"), submissionInfo=document.getElementById("submissionInfo"),
 turnInActions=document.getElementById("turnInActions"), attachBtn=document.getElementById("attachWork"),
 submitBtn=document.getElementById("submitWork"), turnInStatus=document.getElementById("turnInStatus");

let pca=null, teamsInfo=null, currentToken=null, currentAssignments=[], selected=null, currentSubmission=null, attachedResource=null;
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
function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
function isSubmitted(s){return s?.status==="submitted" || !!s?.submittedDateTime;}
function showGraphDiagnostic(s,label="Graph") {
 const stamp=s?.submittedDateTime?` | submittedDateTime: ${s.submittedDateTime}`:"";
 turnStatus(`${label} status: ${s?.status||"necunoscut"}${stamp}`, isSubmitted(s)?"success":"");
}
function showSubmittedState(){
 submissionInfo.textContent=`✓ Lucrare predată în Teams${currentSubmission?.submittedDateTime?` la ${fmt(currentSubmission.submittedDateTime)}`:""}.`;
 submissionInfo.className="success-note";
 turnStatus("✓ Lucrarea a fost predată cu succes. Profesorul o poate vedea și evalua în Teams.","success");
 submitBtn.textContent="✓ Predată";
 submitBtn.disabled=true;
 attachBtn.disabled=true;
 turnInActions.classList.remove("hidden");
}
async function refreshSubmissionAfterSubmit(base){
 let last=null;
 for(let i=0;i<6;i++){
  if(i) await sleep(1000);
  last=await graph(base+"?$select=id,status,submittedDateTime,reassignedDateTime,resourcesFolderUrl",currentToken);
  if(isSubmitted(last)) return last;
 }
 return last;
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
  // Pentru contul elevului preferăm submission-ul expandat din /education/me/assignments.
  // Astfel evităm ambiguitatea listării tuturor submissions ale temei.
  let subs=Array.isArray(selected.submissions)?selected.submissions:[];
  if(!subs.length){
   const d=await graph(`/education/classes/${encodeURIComponent(selected.classId)}/assignments/${encodeURIComponent(selected.id)}/submissions?$select=id,status,submittedDateTime,reassignedDateTime,returnedDateTime,resourcesFolderUrl`,currentToken);
   subs=d.value||[];
  }
  if(subs.length!==1){
   submissionInfo.textContent=subs.length===0
    ?"Nu există submission asociat acestui cont. Pentru predare, deschide aplicația cu un cont de elev."
    :`Au fost returnate ${subs.length} submissions. Acesta este un cont cu acces de profesor; V3.2 nu permite predarea din acest mod.`;
   return;
  }
  currentSubmission=subs[0];
  if(isSubmitted(currentSubmission)){
   showSubmittedState();
   return;
  }
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
 attachBtn.disabled=true;submitBtn.disabled=true;turnStatus("Atașez lucrarea și sursa HTML în Teams…");
 const base=`/education/classes/${encodeURIComponent(selected.classId)}/assignments/${encodeURIComponent(selected.id)}/submissions/${encodeURIComponent(currentSubmission.id)}`;
 try{
  const setup=await graph(base+"/setUpResourcesFolder",currentToken,{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"});
  const refreshed=await graph(base+"?$select=id,status,resourcesFolderUrl",currentToken);
  currentSubmission={...currentSubmission,...refreshed};
  const folderUrl=currentSubmission.resourcesFolderUrl||setup?.resourcesFolderUrl;
  if(!folderUrl)throw new Error("resourcesFolderUrl lipsește.");

  const fileName=cleanFileName();
  const sourceName=fileName.replace(/\.html?$/i,"-sursa.txt");
  const source=document.getElementById("editor").value;
  const m=folderUrl.match(/\/drives\/([^/]+)\/items\/([^/:?]+)/i);
  if(!m)throw new Error("Nu pot extrage driveId din resourcesFolderUrl.");

  async function uploadAndAttach(name,content,type){
   const driveItem=await graph(`${folderUrl}:/${encodeURIComponent(name)}:/content`,currentToken,{method:"PUT",headers:{"Content-Type":type},body:content});
   const fileUrl=`https://graph.microsoft.com/v1.0/drives/${m[1]}/items/${driveItem.id}`;
   try{
    return await graph(base+"/resources",currentToken,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({resource:{"@odata.type":"#microsoft.graph.educationFileResource",displayName:name,fileUrl}})});
   }catch(e){
    // Dacă fișierul era deja atașat la acest submission, PUT-ul de mai sus
    // i-a actualizat conținutul. Graph răspunde 412 când încercăm să creăm
    // încă o resursă pentru același fișier; tratăm cazul ca succes.
    const msg=String(e?.message||e);
    if(msg.includes("Graph 412") && (msg.includes("already exists using this file") || msg.includes('\"code\":\"20248\"'))){
     return {alreadyAttached:true,displayName:name,fileUrl};
    }
    throw e;
   }
  }

  await uploadAndAttach(fileName,source,"text/html; charset=utf-8");
  await uploadAndAttach(sourceName,source,"text/plain; charset=utf-8");
  attachedResource=true;
  submitBtn.disabled=false;
  turnStatus(`✓ Au fost atașate ${fileName} și ${sourceName}. Poți preda lucrarea.`,"success");
 }catch(e){
  console.error(e);turnStatus("Atașarea a eșuat: "+(e.message||e),"error");
 }finally{attachBtn.disabled=false;}
}
async function submitWork(){
 if(!selected||!currentSubmission||!attachedResource)return;
 const ok=confirm(`Predai acum lucrarea „${cleanFileName()}” la tema „${selected.displayName}”?\n\nDupă confirmare, lucrarea va apărea ca predată în Teams.`);
 if(!ok)return;
 const diagBox=document.getElementById("submitDiagnostic"), diagText=document.getElementById("submitDiagnosticText");
 const lines=[]; const log=(x)=>{lines.push(x); if(diagBox)diagBox.style.display="block"; if(diagText)diagText.textContent=lines.join("\n");};
 log("1. ✓ Click detectat");
 attachBtn.disabled=true;submitBtn.disabled=true;turnStatus("Predau oficial lucrarea în Teams…");
 try{
  const base=`/education/classes/${encodeURIComponent(selected.classId)}/assignments/${encodeURIComponent(selected.id)}/submissions/${encodeURIComponent(currentSubmission.id)}`;
  log("2. → POST /submit trimis");
  const r=await fetch("https://graph.microsoft.com/v1.0"+base+"/submit",{method:"POST",headers:{Authorization:`Bearer ${currentToken}`}});
  const raw=await r.text();
  log(`3. ${r.ok?"✓":"✗"} HTTP ${r.status} ${r.statusText||""}`);
  log(`4. Răspuns brut: ${raw||"(corp gol)"}`);
  if(!r.ok) throw new Error(`Graph ${r.status}: ${raw}`);
  let submitted=null;
  if(raw){try{submitted=JSON.parse(raw);}catch{}}
  log(`5. Graph status returnat: ${submitted?.status||"(nu este prezent în răspuns)"}`);
  if(submitted && typeof submitted==="object") currentSubmission={...currentSubmission,...submitted};
  currentSubmission={...currentSubmission,status:"submitted",submittedDateTime:currentSubmission.submittedDateTime||new Date().toISOString()};
  showSubmittedState();
  log(`6. ✓ Actualizare UI executată | buton="${submitBtn.textContent}" | disabled=${submitBtn.disabled}`);
  // Nu suprascriem mesajul de succes cu diagnosticul; panoul separat rămâne vizibil.
  refreshSubmissionAfterSubmit(base).then(verified=>{
   log(`7. Verificare GET: status=${verified?.status||"necunoscut"}, submittedDateTime=${verified?.submittedDateTime||"—"}`);
   if(verified && isSubmitted(verified)){currentSubmission={...currentSubmission,...verified};showSubmittedState();}
  }).catch(e=>log("7. ✗ GET verificare: "+(e.message||e)));
 }catch(e){
  console.error(e);submitBtn.disabled=false;attachBtn.disabled=false;
  turnStatus("Predarea a eșuat: "+(e.message||e),"error");
  log("EROARE: "+(e.message||e));
 }
}
async function load(){
 connectBtn.disabled=true;refreshBtn.disabled=true;
 try{
  status("Obțin tokenul Microsoft Graph…");const a=await token();currentToken=a.accessToken;
  accountEl.textContent=`Conectat: ${a.account?.name||a.account?.username||"utilizator Microsoft"}`;
  status("Citesc temele utilizatorului…");
  const d=await graph("/education/me/assignments?$select=id,classId,displayName,dueDateTime,status&$expand=submissions($select=id,status,submittedDateTime,reassignedDateTime,returnedDateTime,resourcesFolderUrl)&$orderby=dueDateTime desc&$top=100",currentToken);
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