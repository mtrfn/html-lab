'use strict';
window.DBLabHost=(()=>{
 const embedded=window.parent!==window||new URLSearchParams(location.search).get('teams')==='1';
 const host={embedded,authorAllowed:!embedded,context:null,error:null};
 function timeout(p,ms){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Teams nu a răspuns la timp.')),ms);p.then(v=>{clearTimeout(timer);resolve(v)},e=>{clearTimeout(timer);reject(e)})})}
 host.ready=(async()=>{
  if(!embedded)return null;
  document.documentElement.classList.add('teams-locked');
  try{
   if(!window.microsoftTeams)await timeout(new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://res.cdn.office.net/teams-js/2.56.0/js/MicrosoftTeams.min.js';s.onload=resolve;s.onerror=()=>reject(Error('Biblioteca Teams nu a putut fi încărcată.'));document.head.append(s)}),15000);
   await timeout(microsoftTeams.app.initialize(),15000);
   host.context=await timeout(microsoftTeams.app.getContext(),10000);
   return host.context;
  }catch(e){host.error=e.message;return null}
 })();
 return host;
})();
