let generation=0,controller;
const note=document.getElementById("teacherAccessStatus");
export function resetTeacherAccess(){
 generation++;controller?.abort();window.htmlLabTeacherAccess(false);note.textContent="";
}
export async function checkTeacherAccess(teamId,auth){
 resetTeacherAccess();const request=generation;
 if(!teamId){note.textContent="Editorul profesorului este disponibil după conectare în fila clasei din Teams.";return}
 const aborter=new AbortController();controller=aborter;
 const timer=setTimeout(()=>aborter.abort(),15000);
 try{
  let next="https://graph.microsoft.com/v1.0/education/me/taughtClasses?$select=id";
  const seen=new Set();
  while(next){
   const url=new URL(next);
   if(url.origin!=="https://graph.microsoft.com"||url.pathname!=="/v1.0/education/me/taughtClasses"||seen.has(next))throw new Error();
   seen.add(next);
   const response=await fetch(next,{headers:{Authorization:"Bearer "+auth.accessToken},cache:"no-store",signal:aborter.signal});
   if(!response.ok)throw new Error();
   const data=await response.json();
   if(!Array.isArray(data.value))throw new Error();
   if(request!==generation)return;
   if(data.value.some(c=>typeof c.id==="string"&&c.id.toLowerCase()===teamId.toLowerCase())){
    window.htmlLabTeacherAccess(true);note.textContent="";return;
   }
   next=data["@odata.nextLink"]||null;
  }
 }catch{
  if(request===generation)note.textContent="Rolul de profesor nu a putut fi verificat. Pentru a reîncerca, apasă Conectare Microsoft.";
 }finally{clearTimeout(timer)}
}
