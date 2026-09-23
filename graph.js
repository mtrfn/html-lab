import { createNestablePublicClientApplication, InteractionRequiredAuthError } from "https://esm.sh/@azure/msal-browser@5.22.0";

const CLIENT_ID="186ef62f-0e5b-47c2-ab13-2a33600f55cd";
const TENANT_ID="8850faa5-c5a4-4364-bf6e-7ee02b1f4789";
const SCOPES=["User.Read","EduAssignments.ReadWrite","EduRoster.ReadBasic"];
const accountEl=document.getElementById("account"), statusEl=document.getElementById("graphStatus"),
      assignmentsEl=document.getElementById("assignments"), connectBtn=document.getElementById("connect"),
      refreshBtn=document.getElementById("refreshAssignments");
let pca=null, teamsContext=null;

function status(t,isError=false){statusEl.textContent=t;statusEl.style.color=isError?"#b42318":"#526078";}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}
function fmt(d){if(!d)return "—";try{return new Intl.DateTimeFormat("ro-RO",{dateStyle:"medium",timeStyle:"short"}).format(new Date(d));}catch{return d;}}
function render(items){
 if(!items.length){assignmentsEl.innerHTML='<p class="muted">Nu au fost găsite teme pentru acest cont.</p>';return;}
 assignmentsEl.innerHTML=items.map(a=>`<article class="assignment"><h3>${esc(a.displayName||"Temă fără titlu")}</h3><p><b>Termen:</b> ${esc(fmt(a.dueDateTime))}</p><p><b>Stare:</b> ${esc(a.status||"—")}</p></article>`).join("");
}
async function init(){
 status("Inițializez autentificarea Microsoft…");
 teamsContext=await (window.htmlLabTeamsReady||Promise.resolve(null));
 const config={auth:{clientId:CLIENT_ID,authority:`https://login.microsoftonline.com/${TENANT_ID}`,supportsNestedAppAuth:true}};
 pca=await createNestablePublicClientApplication(config);
 status(teamsContext?"Teams detectat. Poți conecta contul Microsoft.":"Mod browser detectat. Autentificarea poate folosi fereastră popup.");
}
function accountFromContext(){
 const loginHint=teamsContext?.user?.loginHint;
 if(!loginHint)return null;
 return pca.getAllAccounts().find(a=>(a.username||"").toLowerCase()===loginHint.toLowerCase())||null;
}
async function token(interactive=true){
 let account=pca.getActiveAccount?.()||accountFromContext()||pca.getAllAccounts()[0]||null;
 const req={scopes:SCOPES,account};
 try{
   const r=await pca.acquireTokenSilent(req); if(r.account)pca.setActiveAccount?.(r.account); return r;
 }catch(e){
   if(!interactive)throw e;
   if(e instanceof InteractionRequiredAuthError || !account){
     const popupReq={scopes:SCOPES,loginHint:teamsContext?.user?.loginHint};
     const r=await pca.acquireTokenPopup(popupReq); if(r.account)pca.setActiveAccount?.(r.account); return r;
   }
   throw e;
 }
}
async function graph(url,accessToken){
 const r=await fetch("https://graph.microsoft.com/v1.0"+url,{headers:{Authorization:`Bearer ${accessToken}`}});
 if(!r.ok){let detail=await r.text();throw new Error(`Graph ${r.status}: ${detail}`);}
 return r.json();
}
async function load(){
 connectBtn.disabled=true;refreshBtn.disabled=true;
 try{
   status("Obțin tokenul Microsoft Graph…");
   const auth=await token(true);
   accountEl.textContent=`Conectat: ${auth.account?.name||auth.account?.username||"utilizator Microsoft"}`;
   status("Citesc temele…");
   const data=await graph("/education/me/assignments?$select=id,displayName,dueDateTime,status&$orderby=dueDateTime desc&$top=50",auth.accessToken);
   render(data.value||[]); status(`Teme încărcate: ${(data.value||[]).length}.`);refreshBtn.disabled=false;
 }catch(e){
   console.error(e); status("Autentificarea sau citirea temelor a eșuat: "+(e.message||e),true);
 }finally{connectBtn.disabled=false;}
}
connectBtn.onclick=load;refreshBtn.onclick=load;
init().catch(e=>status("Inițializarea autentificării a eșuat: "+(e.message||e),true));