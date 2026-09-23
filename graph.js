import { createNestablePublicClientApplication, InteractionRequiredAuthError } from "https://esm.sh/@azure/msal-browser@5.22.0";

const CLIENT_ID="186ef62f-0e5b-47c2-ab13-2a33600f55cd";
const TENANT_ID="8850faa5-c5a4-4364-bf6e-7ee02b1f4789";
const SCOPES=["User.Read","EduAssignments.ReadWrite","EduRoster.ReadBasic"];
const accountEl=document.getElementById("account"), statusEl=document.getElementById("graphStatus"),
 assignmentsEl=document.getElementById("assignments"), connectBtn=document.getElementById("connect"),
 refreshBtn=document.getElementById("refreshAssignments"), teamNameEl=document.getElementById("teamName"),
 teamHint=document.getElementById("teamHint"), selection=document.getElementById("selection"),
 selectedAssignment=document.getElementById("selectedAssignment"), submissionInfo=document.getElementById("submissionInfo");
let pca=null, teamsInfo=null, currentToken=null, currentAssignments=[], selected=null;

function status(t,err=false){statusEl.textContent=t;statusEl.style.color=err?"#b42318":"#526078";}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function fmt(d){if(!d)return "—";try{return new Intl.DateTimeFormat("ro-RO",{dateStyle:"medium",timeStyle:"short"}).format(new Date(d));}catch{return d;}}
async function graph(url,token){
 const r=await fetch("https://graph.microsoft.com/v1.0"+url,{headers:{Authorization:`Bearer ${token}`}});
 if(!r.ok)throw new Error(`Graph ${r.status}: ${await r.text()}`);
 return r.status===204?null:r.json();
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
function ctxAccount(){const h=teamsInfo?.context?.user?.loginHint;if(!h)return null;return pca.getAllAccounts().find(a=>(a.username||"").toLowerCase()===h.toLowerCase())||null;}
async function token(){
 let a=pca.getActiveAccount?.()||ctxAccount()||pca.getAllAccounts()[0]||null;
 try{return await pca.acquireTokenSilent({scopes:SCOPES,account:a});}
 catch(e){if(e instanceof InteractionRequiredAuthError||!a)return pca.acquireTokenPopup({scopes:SCOPES,loginHint:teamsInfo?.context?.user?.loginHint});throw e;}
}
function render(items){
 currentAssignments=items;
 if(!items.length){assignmentsEl.innerHTML='<p class="muted">Nu au fost găsite teme pentru clasa curentă.</p>';return;}
 assignmentsEl.innerHTML=items.map((a,i)=>`<article class="assignment" data-i="${i}">
 <h3>${esc(a.displayName||"Temă fără titlu")}</h3><p><b>Termen:</b> ${esc(fmt(a.dueDateTime))}</p>
 <p><b>Stare:</b> ${esc(a.status||"—")}</p><button type="button">Selectează tema</button></article>`).join("");
 assignmentsEl.querySelectorAll(".assignment").forEach(el=>el.onclick=()=>choose(Number(el.dataset.i),el));
}
async function choose(i,el){
 selected=currentAssignments[i];assignmentsEl.querySelectorAll(".assignment").forEach(x=>x.classList.remove("selected"));el.classList.add("selected");
 selection.classList.remove("hidden");selectedAssignment.innerHTML=`<b>${esc(selected.displayName)}</b><br>Termen: ${esc(fmt(selected.dueDateTime))}`;
 submissionInfo.textContent="Verific submission-ul contului curent…";
 try{
  const d=await graph(`/education/classes/${encodeURIComponent(selected.classId)}/assignments/${encodeURIComponent(selected.id)}/submissions?$select=id,status,submittedDateTime,reassignedDateTime`,currentToken);
  const subs=d.value||[];
  if(subs.length===1) submissionInfo.textContent=`Submission detectat: ${subs[0].status||"stare necunoscută"} (ID ${subs[0].id}).`;
  else if(subs.length===0) submissionInfo.textContent="Nu există submission asociat acestui cont. Pentru un profesor acest lucru este normal; testul de predare se face cu un elev.";
  else submissionInfo.textContent=`Au fost returnate ${subs.length} submissions. Contul pare a avea rol de profesor; pentru predare vom folosi un cont de elev.`;
 }catch(e){submissionInfo.textContent="Nu am putut verifica submission-ul: "+e.message;}
}
async function load(){
 connectBtn.disabled=true;refreshBtn.disabled=true;
 try{
  status("Obțin tokenul Microsoft Graph…");const a=await token();currentToken=a.accessToken;
  accountEl.textContent=`Conectat: ${a.account?.name||a.account?.username||"utilizator Microsoft"}`;
  status("Citesc temele utilizatorului…");
  const d=await graph("/education/me/assignments?$select=id,classId,displayName,dueDateTime,status&$orderby=dueDateTime desc&$top=100",currentToken);
  let items=d.value||[];
  const teamId=teamsInfo?.teamId;
  if(teamId){
    const exact=items.filter(x=>(x.classId||"").toLowerCase()===teamId.toLowerCase());
    if(exact.length || items.some(x=>x.classId)){
      items=exact;
      teamHint.textContent=`Filtrare activă după clasa Teams curentă (${teamId}).`;
    }
  }
  render(items);status(`Teme afișate pentru clasa curentă: ${items.length}.`);refreshBtn.disabled=false;
 }catch(e){console.error(e);status("Eroare: "+(e.message||e),true);}
 finally{connectBtn.disabled=false;}
}
connectBtn.onclick=load;refreshBtn.onclick=load;
init().catch(e=>status("Inițializarea a eșuat: "+(e.message||e),true));