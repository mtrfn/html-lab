window.htmlLabTeamsReady=(async()=>{
 try{
  if(window.microsoftTeams&&microsoftTeams.app){
   await microsoftTeams.app.initialize();
   const c=await microsoftTeams.app.getContext();
   const teamId=c?.team?.groupId || c?.team?.internalId || null;
   const teamName=c?.team?.displayName || c?.team?.displayName || "";
   return {context:c,teamId,teamName};
  }
 }catch(e){console.info("HTML Lab rulează în browser.",e);}
 return null;
})();