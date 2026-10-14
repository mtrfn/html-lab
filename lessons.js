'use strict';
(() => {
  const EMPTY=()=>({format:'DB-Lab-lessons',version:1,lessons:[]});
  let libraryWritable=true;
  let bundled=EMPTY(),local=EMPTY(),ready=false,locked=false,draftId=null,draftDirty=false,draftRevision=0,hintIndex=0,pendingLibrary=null;
  const fields=['authorTitle','authorCategory','authorTask','authorSetup','authorStarter','authorHint1','authorHint2','authorHint3'];
  const libraryKey='lesson-library-v1';
  let classLibrary=EMPTY(),classPrefix='';
  const canAuthor=()=>DBLabHost.authorAllowed;
  function requireAuthor(){if(!canAuthor())throw Error('Atelierul este disponibil numai profesorului confirmat în această clasă.')}

  function askConfirm(text){
    return new Promise(resolve=>{
      const dialog=$('lessonConfirm');$('lessonConfirmText').textContent=text;
      const finish=answer=>{dialog.close();resolve(answer)};
      $('lessonConfirmYes').onclick=()=>finish(true);$('lessonConfirmNo').onclick=()=>finish(false);
      dialog.oncancel=e=>{e.preventDefault();finish(false)};
      dialog.showModal();$('lessonConfirmNo').focus();
    });
  }
  function status(text){$('libraryStatus').textContent=text}
  function showTab(id){document.querySelector('[data-tab="'+id+'"]').click()}
  async function read(key){
    if(!storage)throw Error('Stocarea locală este indisponibilă. Exportă proiectul înainte de a continua.');
    return new Promise((resolve,reject)=>{const request=storage.transaction('projects').objectStore('projects').get(storageKey(key));request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});
  }
  async function write(key,value){
    requireAuthor();
    if(!libraryWritable)throw Error('Biblioteca locală nu a putut fi citită. Nu o suprascriem; exportă proiectul și verifică stocarea browserului.');
    if(!storage)throw Error('Lecția nu a fost salvată: stocarea locală este indisponibilă.');
    return new Promise((resolve,reject)=>{const tx=storage.transaction('projects','readwrite');tx.objectStore('projects').put(value,storageKey(key));tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Salvare anulată.'))});
  }
  async function action(fn,target='libraryStatus'){
    if(target==='authorStatus'&&!canAuthor())return;
    if(!ready||locked||pending)return;
    locked=true;busy(true);
    try{await fn()}catch(e){$(target).textContent=e.message;msg(e.message)}finally{locked=false;busy(false)}
  }
  function entries(){return [...classLibrary.lessons.map(definition=>({key:classPrefix+definition.id,definition})),...bundled.lessons.map(definition=>({key:'builtin:'+definition.id,definition})),...local.lessons.map(definition=>({key:'local:'+definition.id,definition}))]}
  function selectedEntry(){return entries().find(x=>x.key===$('lessonPicker').value)}
  function renderLibrary(wanted=$('lessonPicker').value){
    const picker=$('lessonPicker');picker.replaceChildren();
    for(const [label,source,prefix] of [['Lecțiile clasei',classLibrary,classPrefix],['Lecții incluse',bundled,'builtin:'],['Lecțiile mele',local,'local:']]){
      const categories=[...new Set(source.lessons.map(l=>l.category))].sort((a,b)=>a.localeCompare(b,'ro'));
      for(const category of categories){const group=document.createElement('optgroup');group.label=label+' · '+category;source.lessons.filter(l=>l.category===category).forEach(l=>group.append(new Option(l.title,prefix+l.id)));picker.append(group)}
    }
    if(entries().some(x=>x.key===wanted))picker.value=wanted;
    const author=$('authorPicker'),previous=author.value;author.replaceChildren(new Option('— Alege o lecție proprie —',''));local.lessons.forEach(l=>author.add(new Option(l.title,l.id)));author.value=local.lessons.some(l=>l.id===previous)?previous:'';
    previewSelection();
  }
  function previewSelection(){
    const item=selectedEntry();$('lessonCard').hidden=!item;
    if(!item)return;
    $('lessonPreviewTitle').textContent=item.definition.title;$('lessonPreviewTask').textContent=item.definition.task;
    $('lessonSetupPreview').textContent=item.definition.setupSQL||'Bază inițială goală.';$('lessonStarterPreview').textContent=item.definition.starterSQL||'Editor gol.';
  }
  function renderActive(){
    $('lessonContext').hidden=!activeLesson;
    if(!activeLesson)return;
    $('activeLessonTitle').textContent=activeLesson.definition.title;$('activeLessonTask').textContent=activeLesson.definition.task;
    $('hintUsage').textContent='Ajutor consultat: '+activeLesson.hintsUsed+'/3 · progres pe acest dispozitiv';
  }
  window.renderActiveLesson=renderActive;
  async function checkpoint(){clearTimeout(debounce);if(!(await save()))throw Error('Schimbarea a fost oprită: proiectul curent nu a putut fi salvat. Exportă-l ca rezervă.')}
  async function activate(project){
    const p=LessonCore.project(project);
    await load(new Uint8Array(p.bytes));
    activeLesson=p.lesson;$('name').value=p.name;$('editor').value=p.sql;$('results').replaceChildren();
    renderActive();
    if(!(await save()))throw Error('Lucrarea este deschisă, dar nu a putut fi salvată local. Folosește Export proiect.');
  }
  async function start(entry,reset=false){
    if(!entry)return;
    if(reset&&!(await askConfirm('Pornești de la început „'+entry.definition.title+'”? Baza și SQL-ul salvat pentru această lecție vor fi înlocuite. Poți anula și exporta mai întâi lucrarea.')))return;
    await action(async()=>{
      await checkpoint();
      const cached=reset?null:await read('lesson-progress:'+entry.key);
      if(cached){await activate(cached);status('Ai reluat lucrarea salvată, împreună cu versiunea lecției de la momentul începerii. Pentru noua versiune din bibliotecă, folosește Pornește de la început.')}
      else{
        const result=await call({kind:'lessonPreview',sql:entry.definition.setupSQL});
        await activate({version:1,name:entry.definition.title,sql:entry.definition.starterSQL,bytes:Array.from(result.bytes),lesson:{key:entry.key,definition:entry.definition,hintsUsed:0}});
        status('Lecția a fost pregătită. SQL-ul din editor nu a fost executat automat.');
      }
      msg(cached?'Lucrarea lecției a fost restaurată.':'Baza lecției este pregătită. Completează SQL-ul și apasă Execută.');
    });
    if(activeLesson?.key===entry.key)showTab('sql');
  }
  $('lessonPicker').onchange=previewSelection;
  $('openLesson').onclick=()=>start(selectedEntry());
  $('restartSelected').onclick=()=>start(selectedEntry(),true);
  $('resetLesson').onclick=()=>activeLesson&&start({key:activeLesson.key,definition:activeLesson.definition},true);
  $('returnProject').onclick=async()=>{
    let returned=false;
    await action(async()=>{await checkpoint();const p=await read('workspace-free');if(!p)throw Error('Nu există un proiect liber salvat. Exportă lucrarea și creează un Proiect nou.');await activate(p);returned=true;msg('Proiectul liber a fost restaurat. Progresul lecției rămâne salvat separat.')});
    if(returned)showTab('sql');
  };
  function renderHint(){
    if(!activeLesson)return;
    $('hintTitle').textContent='Ajutor · '+activeLesson.definition.title;
    $('hintLevel').textContent=(hintIndex+1)+'/3 · '+['Indiciu','Sintaxă','Exemplu'][hintIndex];
    $('hintText').textContent=activeLesson.definition.hints[hintIndex];
    $('previousHint').disabled=hintIndex===0;$('nextHint').disabled=hintIndex===2;
    activeLesson.hintsUsed=Math.max(activeLesson.hintsUsed,hintIndex+1);renderActive();void save();
  }
  $('lessonHelp').onclick=()=>{if(!activeLesson)return;hintIndex=0;renderHint();$('hintDialog').showModal()};
  $('previousHint').onclick=()=>{if(hintIndex>0){hintIndex--;renderHint()}};
  $('nextHint').onclick=()=>{if(hintIndex<2){hintIndex++;renderHint()}};
  $('closeHint').onclick=()=>$('hintDialog').close();
  async function discardDraft(){requireAuthor();return !draftDirty||await askConfirm('Renunți la modificările nesalvate din atelier?')}
  function setDraft(definition,id=null){
    draftId=id;draftDirty=false;draftRevision++;
    const l=definition||{title:'',category:'Lecțiile mele',task:'',setupSQL:'',starterSQL:'-- Începe rezolvarea aici\n',hints:['','','']};
    [l.title,l.category,l.task,l.setupSQL,l.starterSQL,...l.hints].forEach((value,i)=>$(fields[i]).value=value);
    $('authorStatus').textContent=id?'Editezi o lecție salvată.':'Lecție nouă · nesalvată';$('authorCheck').hidden=true;
  }
  function getDraft(){return LessonCore.lesson({id:draftId||'lesson-'+crypto.randomUUID(),title:$('authorTitle').value.trim(),category:$('authorCategory').value.trim(),task:$('authorTask').value,setupSQL:$('authorSetup').value,starterSQL:$('authorStarter').value,hints:[$('authorHint1').value,$('authorHint2').value,$('authorHint3').value]})}
  fields.forEach(id=>$(id).addEventListener('input',()=>{draftDirty=true;draftRevision++;$('authorStatus').textContent='Modificări nesalvate în atelier.';$('authorCheck').hidden=true}));
  window.addEventListener('beforeunload',e=>{if(draftDirty){e.preventDefault();e.returnValue=''}});
  $('newLessonDraft').onclick=async()=>{if(await discardDraft())setDraft()};
  $('editSavedLesson').onclick=async()=>{const l=local.lessons.find(l=>l.id===$('authorPicker').value);if(!l){$('authorStatus').textContent='Alege mai întâi o lecție proprie.';return}if(await discardDraft())setDraft(l,l.id)};
  $('copyLesson').onclick=async()=>{const entry=selectedEntry();if(!entry||!(await discardDraft()))return;setDraft({...entry.definition,title:entry.definition.title+' · copie'});draftDirty=true;showTab('author')};
  $('checkLesson').onclick=()=>action(async()=>{
    const sql=$('authorSetup').value,revision=draftRevision;
    const result=await call({kind:'lessonPreview',sql});
    if(revision!==draftRevision){$('authorStatus').textContent='Baza verificată este validă, dar ai modificat între timp formularul. Verifică din nou.';return}
    $('authorCheck').hidden=false;$('authorCheck').textContent=result.state.length?result.state.map(t=>t.name+' · '+t.columns.map(c=>c.name).join(', ')+' · '+t.data.values.length+' rânduri afișabile (max. 200)').join('\n'):'Bază goală validă.';
    $('authorStatus').textContent='Baza inițială este validă. Proiectul curent nu a fost modificat. Aceasta nu verifică rezolvarea exercițiului.';
  },'authorStatus');
  $('lessonAuthorForm').onsubmit=e=>{e.preventDefault();void action(async()=>{
    const lesson=getDraft(),revision=draftRevision;
    const next=LessonCore.merge(local,{...EMPTY(),lessons:[lesson]});
    await call({kind:'lessonPreview',sql:lesson.setupSQL});
    await write(libraryKey,next);local=next;draftId=lesson.id;
    if(revision===draftRevision)draftDirty=false;
    renderLibrary('local:'+lesson.id);$('authorPicker').value=lesson.id;
    $('authorStatus').textContent=draftDirty?'Lecția a fost salvată, dar ai modificări noi nesalvate.':'Lecție salvată local. O poți deschide din Lecții SQL sau exporta pentru distribuire.';
  },'authorStatus')};
  $('deleteLesson').onclick=async()=>{
    if(!canAuthor())return;
    const l=local.lessons.find(l=>l.id===$('authorPicker').value);
    if(!l){$('authorStatus').textContent='Selectează o lecție proprie.';return}
    if(!(await askConfirm('Ștergi „'+l.title+'” din biblioteca locală? Lucrările deja începute rămân salvate. Exportă biblioteca dacă vrei o copie.')))return;
    if(draftId===l.id&&!(await discardDraft()))return;
    void action(async()=>{const next={...EMPTY(),lessons:local.lessons.filter(x=>x.id!==l.id)};await write(libraryKey,next);local=next;if(draftId===l.id)setDraft();renderLibrary();$('authorStatus').textContent='Lecția a fost eliminată din bibliotecă.'},'authorStatus');
  };
  $('exportLessons').onclick=()=>{
    if(!canAuthor())return;
    if(!local.lessons.length){status('Nu ai lecții proprii. Creează una în atelier sau copiază o lecție inclusă.');return}
    download('DB-Lab-lectii.json',JSON.stringify(local,null,2),'application/json');status('Biblioteca locală a fost exportată.');
  };
  $('exportSelected').onclick=()=>{const entry=selectedEntry();if(entry)download('DB-Lab-'+entry.definition.id+'.lessons.json',JSON.stringify({...EMPTY(),lessons:[entry.definition]},null,2),'application/json')};
  $('importLessons').onclick=()=>{if(canAuthor())$('lessonFile').click()};
  $('lessonFile').onchange=async()=>{
    const f=$('lessonFile').files[0];if(!f||!canAuthor())return;
    try{
      if(f.size>LessonCore.MAX_BYTES)throw Error('Biblioteca depășește limita de 2 MB.');
      const incoming=LessonCore.library(JSON.parse(await f.text()));
      if(!incoming.lessons.length)throw Error('Biblioteca este goală.');
      LessonCore.merge(local,incoming);pendingLibrary=incoming;
      const overwrite=incoming.lessons.filter(l=>local.lessons.some(x=>x.id===l.id));
      $('libraryReviewText').textContent=incoming.lessons.length+' lecții de importat; '+overwrite.length+' înlocuiri după identificator. Lucrările începute și baza curentă rămân neschimbate.';
      $('libraryReviewList').replaceChildren();incoming.lessons.forEach(l=>{const li=document.createElement('li');li.textContent=l.title+(overwrite.some(x=>x.id===l.id)?' · înlocuiește lecția locală':' · lecție nouă');$('libraryReviewList').append(li)});
      $('libraryReviewError').textContent='';$('libraryReview').showModal();
    }catch(e){status('Import respins: '+e.message)}finally{$('lessonFile').value=''}
  };
  $('confirmLibraryImport').onclick=()=>action(async()=>{
    if(!pendingLibrary)return;
    const next=LessonCore.merge(local,pendingLibrary);await write(libraryKey,next);local=next;
    const first=pendingLibrary.lessons[0].id;pendingLibrary=null;renderLibrary('local:'+first);$('libraryReview').close();status('Biblioteca a fost importată. Deschide lecția pentru a pregăti baza de lucru.');
  },'libraryReviewError');
  $('cancelLibraryImport').onclick=()=>{pendingLibrary=null;$('libraryReview').close()};
  $('libraryReview').oncancel=()=>{pendingLibrary=null};

  function applyAccess(){
    const allowed=canAuthor();
    document.querySelector('[data-tab="author"]').hidden=!allowed;
    ['copyLesson','importLessons','exportLessons','editSavedLesson','newLessonDraft','deleteLesson','checkLesson','saveLesson'].forEach(id=>{$(id).hidden=!allowed});
    $('author').querySelectorAll('input,select,textarea,button').forEach(el=>el.disabled=!allowed);
    if(!allowed){$('author').hidden=true;const selectedTab=document.querySelector('[data-tab="author"].active');if(selectedTab)showTab('lessons')}
  }
  window.DBLabLessons={
    async prepareSwitch(){return !draftDirty||await askConfirm("Schimbi sesiunea Microsoft? Modificările nesalvate din atelier vor fi abandonate. Alege Anulează pentru a le salva mai întâi.")},
    setAuthor(allowed){DBLabHost.authorAllowed=allowed===true;applyAccess()},
    clearClass(){classLibrary=EMPTY();classPrefix='';renderLibrary()},
    replaceClass(tenant,team,data){classLibrary=LessonCore.library(data);classPrefix='class:'+TeamsCore.id(tenant)+':'+TeamsCore.id(team)+':';renderLibrary();status(classLibrary.lessons.length+' lecții ale clasei disponibile.')},
    async resetWorkspace(){
      await window.lessonsReady;local=EMPTY();libraryWritable=true;classLibrary=EMPTY();classPrefix='';setDraft();pendingLibrary=null;
      for(const id of ['hintDialog','libraryReview','lessonConfirm'])if($(id).open)$(id).close();
      if(workspaceScope){const saved=await read(libraryKey);if(saved)local=LessonCore.library(saved)}
      renderLibrary(activeLesson?.key);renderActive();applyAccess();
    }
  };

  const controls=['openLesson','restartSelected','returnProject','resetLesson','lessonHelp','copyLesson','checkLesson','saveLesson','importLessons','exportLessons','exportSelected','newLessonDraft','editSavedLesson','deleteLesson'];
  controls.forEach(id=>$(id).disabled=true);
  window.lessonsReady=(async()=>{
    if(!(await window.dbReady)){status('Inițializarea bazei a eșuat. Reîncarcă pagina.');return}
    let warning='';
    try{const response=await fetch('./lessons.json?v=1.3.0');if(!response.ok)throw Error('HTTP '+response.status);bundled=LessonCore.library(await response.json())}catch(e){warning='Lecțiile incluse nu au putut fi încărcate: '+e.message+'. '}
    try{const saved=workspaceScope?await read(libraryKey):null;if(saved)local=LessonCore.library(saved)}catch(e){libraryWritable=false;warning+='Biblioteca locală nu a putut fi citită: '+e.message+'. '}
    renderLibrary(activeLesson?.key);renderActive();setDraft();ready=true;controls.forEach(id=>$(id).disabled=false);
    status(warning||bundled.lessons.length+' lecții incluse · '+local.lessons.length+' lecții proprii.');
    applyAccess();
  })();
})();
