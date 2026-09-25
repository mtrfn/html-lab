const E=document.getElementById("editor"),P=document.getElementById("preview"),S=document.getElementById("status"),N=document.getElementById("filename"),F=document.getElementById("picker"),X=document.getElementById("examples");
const CK="htmlLabV3Code",NK="htmlLabV3Name";
const examples={
basic:`<!DOCTYPE html>\n<html lang="ro"><head><meta charset="UTF-8"><title>Prima mea pagină</title></head>\n<body><h1>Salut!</h1><p>Prima mea pagină HTML.</p></body></html>`,
headings:`<!DOCTYPE html><html lang="ro"><body><h1>Titlul principal</h1><h2>Un subtitlu</h2><p>Acesta este un paragraf.</p></body></html>`,
chars:`<!DOCTYPE html><html lang="ro"><body><h1>Formatarea textului</h1><p><strong>Important</strong>, <em>accentuat</em>, <mark>evidențiat</mark>, H<sub>2</sub>O și x<sup>2</sup>.</p></body></html>`,
lists:`<!DOCTYPE html><html lang="ro"><body><h1>Componentele unui calculator</h1><ul><li>Procesor</li><li>Memorie RAM</li><li>SSD</li></ul></body></html>`,
links:`<!DOCTYPE html><html lang="ro"><body><h1>Legături</h1><p>Vizitează <a href="https://example.com" target="_blank">un site demonstrativ</a>.</p></body></html>`,
images:`<!DOCTYPE html><html lang="ro"><body><h1>Imagini</h1><img src="https://via.placeholder.com/320x180?text=Imagine" alt="Imagine demonstrativă" width="320"><p>Atributul alt descrie imaginea.</p></body></html>`,
table:`<!DOCTYPE html><html lang="ro"><body><h1>Orar</h1><table border="1" cellpadding="8"><tr><th>Ora</th><th>Disciplina</th></tr><tr><td>08:00</td><td>TIC</td></tr></table></body></html>`,
attributes:`<!DOCTYPE html><html lang="ro"><body><h1 id="titlu" title="Titlul paginii">Atribute HTML</h1><p class="explicatie" style="font-weight:bold">Atributele oferă informații suplimentare elementelor.</p></body></html>`,
forms:`<!DOCTYPE html><html lang="ro"><body><h1>Formular</h1><form><label for="nume">Nume:</label> <input id="nume" name="nume" type="text"><br><label for="clasa">Clasa:</label> <select id="clasa"><option>IX</option><option>X</option></select><br><button type="button">Trimite</button></form></body></html>`,
iframe:`<!DOCTYPE html><html lang="ro"><body><h1>Conținut încorporat</h1><iframe srcdoc="<h2>Document încorporat</h2><p>Acesta este un alt document HTML.</p>" width="500" height="180" title="Exemplu iframe"></iframe></body></html>`,
frames:`<!DOCTYPE html><html lang="ro"><body><h1>Frame / Frameset – exemplu istoric</h1><p><strong>Notă:</strong> elementele &lt;frameset&gt; și &lt;frame&gt; sunt depășite în HTML modern. Exemplul este prezentat pentru înțelegerea paginilor vechi.</p><pre>&lt;frameset cols="30%,70%"&gt;\n  &lt;frame src="meniu.html"&gt;\n  &lt;frame src="continut.html"&gt;\n&lt;/frameset&gt;</pre></body></html>`,
grid:`<!DOCTYPE html><html lang="ro"><head><style>.grid{display:grid;grid-template-columns:1fr 2fr;gap:12px}.grid>*{border:1px solid #777;padding:16px}</style></head><body><h1>CSS Grid</h1><div class="grid"><aside>Meniu</aside><main>Conținut principal</main></div></body></html>`,
project:`<!DOCTYPE html><html lang="ro"><head><meta charset="UTF-8"><title>Mini-site</title><style>nav a{margin-right:12px}.cards{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}</style></head><body><header><h1>Mini-site-ul meu</h1><nav><a href="#despre">Despre</a><a href="#contact">Contact</a></nav></header><main><section id="despre"><h2>Despre</h2><p>Completează această secțiune.</p></section><section class="cards"><article><h3>Card 1</h3><p>Conținut.</p></article><article><h3>Card 2</h3><p>Conținut.</p></article></section></main></body></html>`};
function msg(t){S.textContent=t;clearTimeout(msg.t);msg.t=setTimeout(()=>S.textContent="",2500)}
function run(){P.srcdoc=E.value;msg("Previzualizare actualizată.")}
function name(){let n=(N.value||"lucrare.html").trim().replace(/[\\/:*?"<>|]/g,"_");if(!/\.html?$/i.test(n))n+=".html";N.value=n;return n}
function local(){localStorage.setItem(CK,E.value);localStorage.setItem(NK,name());msg("Copie locală salvată.")}
function download(){const u=URL.createObjectURL(new Blob([E.value],{type:"text/html;charset=utf-8"})),a=document.createElement("a");a.href=u;a.download=name();document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);local();msg("Fișierul .html a fost creat.")}
document.getElementById("run").onclick=run;document.getElementById("save").onclick=local;document.getElementById("download").onclick=download;document.getElementById("open").onclick=()=>F.click();
F.onchange=async()=>{const f=F.files[0];if(!f)return;E.value=await f.text();N.value=f.name;run();local();F.value="";msg("Fișier deschis: "+f.name)};
X.onchange=()=>{E.value=examples[X.value];run()};document.getElementById("reset").onclick=()=>{if(confirm("Revii la exemplul selectat?")){E.value=examples[X.value];run()}};
E.addEventListener("keydown",e=>{if(e.ctrlKey&&e.key==="Enter")run();if(e.key==="Tab"){e.preventDefault();let s=E.selectionStart,n=E.selectionEnd;E.value=E.value.slice(0,s)+"  "+E.value.slice(n);E.selectionStart=E.selectionEnd=s+2}});
let t;E.oninput=()=>{clearTimeout(t);t=setTimeout(()=>{localStorage.setItem(CK,E.value);localStorage.setItem(NK,name());S.textContent="Salvat automat local.";},900)};
E.value=localStorage.getItem(CK)||examples.basic;N.value=localStorage.getItem(NK)||"lucrare.html";run();

// V3.5 — Ajutor contextual în trei trepte: indiciu → sintaxă → exemplu.
const helpData={
basic:{title:"Prima pagină",levels:[{label:"Indiciu",html:"Conținutul vizibil se află în <code>&lt;body&gt;</code>. Pentru titlu și paragraf există etichete dedicate."},{label:"Sintaxă",html:"Folosește <code>&lt;h1&gt;...&lt;/h1&gt;</code> și <code>&lt;p&gt;...&lt;/p&gt;</code>. Documentul începe de regulă cu <code>&lt;!DOCTYPE html&gt;</code>."},{label:"Exemplu",html:"<pre>&lt;body&gt;\n  &lt;h1&gt;Pagina mea&lt;/h1&gt;\n  &lt;p&gt;Învăț HTML.&lt;/p&gt;\n&lt;/body&gt;</pre>Adaptează singur conținutul."}]},
headings:{title:"Titluri și paragrafe",levels:[{label:"Indiciu",html:"HTML oferă șase niveluri de titluri, de la <code>h1</code> la <code>h6</code>."},{label:"Sintaxă",html:"<code>&lt;h1&gt;Titlu&lt;/h1&gt;</code>, <code>&lt;h2&gt;Subtitlu&lt;/h2&gt;</code>, <code>&lt;p&gt;Paragraf&lt;/p&gt;</code>."},{label:"Exemplu",html:"<pre>&lt;h1&gt;Aviație&lt;/h1&gt;\n&lt;h2&gt;Aerodromuri&lt;/h2&gt;\n&lt;p&gt;Text explicativ.&lt;/p&gt;</pre>"}]},
chars:{title:"Formatarea caracterelor",levels:[{label:"Indiciu",html:"Unele etichete exprimă importanță sau accent semantic, altele modifică prezentarea textului."},{label:"Sintaxă",html:"Încearcă <code>&lt;strong&gt;</code>, <code>&lt;em&gt;</code>, <code>&lt;mark&gt;</code>, <code>&lt;sub&gt;</code> și <code>&lt;sup&gt;</code>. Compară și cu <code>&lt;b&gt;</code> și <code>&lt;i&gt;</code>."},{label:"Exemplu",html:"<pre>&lt;p&gt;&lt;strong&gt;Atenție!&lt;/strong&gt; Formula apei este H&lt;sub&gt;2&lt;/sub&gt;O.&lt;/p&gt;</pre>"}]},
lists:{title:"Liste",levels:[{label:"Indiciu",html:"O enumerare poate fi neordonată sau numerotată; fiecare element este separat."},{label:"Sintaxă",html:"<code>&lt;ul&gt;</code>/<code>&lt;ol&gt;</code> conțin elemente <code>&lt;li&gt;</code>."},{label:"Exemplu",html:"<pre>&lt;ol&gt;\n &lt;li&gt;Deschide editorul&lt;/li&gt;\n &lt;li&gt;Scrie codul&lt;/li&gt;\n&lt;/ol&gt;</pre>"}]},
links:{title:"Legături",levels:[{label:"Indiciu",html:"O legătură are un text vizibil și o destinație."},{label:"Sintaxă",html:"<code>&lt;a href=&quot;adresa&quot;&gt;Text&lt;/a&gt;</code>. Atributul <code>target</code> poate controla unde se deschide destinația."},{label:"Exemplu",html:"<pre>&lt;a href=&quot;pagina2.html&quot;&gt;Pagina a doua&lt;/a&gt;</pre>Încearcă apoi o adresă absolută."}]},
images:{title:"Imagini",levels:[{label:"Indiciu",html:"Imaginea are nevoie de o sursă și de un text alternativ util."},{label:"Sintaxă",html:"<code>&lt;img src=&quot;imagine.jpg&quot; alt=&quot;Descriere&quot;&gt;</code>. Poți controla dimensiunile cu atribute sau, preferabil în proiecte moderne, prin CSS."},{label:"Exemplu",html:"<pre>&lt;img src=&quot;avion.jpg&quot; alt=&quot;Avion pe aerodrom&quot; width=&quot;400&quot;&gt;</pre>"}]},
table:{title:"Tabele",levels:[{label:"Indiciu",html:"Tabelul este alcătuit din rânduri și celule; antetul folosește celule speciale."},{label:"Sintaxă",html:"<code>&lt;table&gt;</code>, <code>&lt;tr&gt;</code>, <code>&lt;th&gt;</code>, <code>&lt;td&gt;</code>. Pentru unirea celulelor există <code>rowspan</code> și <code>colspan</code>."},{label:"Exemplu",html:"<pre>&lt;table border=&quot;1&quot;&gt;\n &lt;tr&gt;&lt;th&gt;Produs&lt;/th&gt;&lt;th&gt;Preț&lt;/th&gt;&lt;/tr&gt;\n &lt;tr&gt;&lt;td&gt;Caiet&lt;/td&gt;&lt;td&gt;8 lei&lt;/td&gt;&lt;/tr&gt;\n&lt;/table&gt;</pre>"}]},
attributes:{title:"Atributele etichetelor",levels:[{label:"Indiciu",html:"Atributele se scriu în eticheta de deschidere și adaugă informații sau configurări unui element."},{label:"Sintaxă",html:"Forma generală este <code>&lt;eticheta atribut=&quot;valoare&quot;&gt;</code>. Exemple: <code>id</code>, <code>class</code>, <code>title</code>, <code>href</code>, <code>src</code>, <code>alt</code>."},{label:"Exemplu",html:"<pre>&lt;p id=&quot;intro&quot; class=&quot;important&quot; title=&quot;Introducere&quot;&gt;Text&lt;/p&gt;</pre>Observă că același element poate avea mai multe atribute."}]},
forms:{title:"Formulare și controale",levels:[{label:"Indiciu",html:"Un formular grupează controale prin care utilizatorul poate introduce sau selecta date."},{label:"Sintaxă",html:"Explorează <code>&lt;form&gt;</code>, <code>&lt;label&gt;</code>, <code>&lt;input&gt;</code>, <code>&lt;textarea&gt;</code>, <code>&lt;select&gt;</code>, <code>&lt;option&gt;</code> și <code>&lt;button&gt;</code>."},{label:"Exemplu",html:"<pre>&lt;label for=&quot;email&quot;&gt;E-mail:&lt;/label&gt;\n&lt;input id=&quot;email&quot; type=&quot;email&quot; name=&quot;email&quot;&gt;</pre>Încearcă și tipurile radio, checkbox și date."}]},
iframe:{title:"iframe – conținut încorporat",levels:[{label:"Indiciu",html:"Un <code>iframe</code> afișează un alt document în interiorul paginii curente."},{label:"Sintaxă",html:"<code>&lt;iframe src=&quot;pagina.html&quot; title=&quot;Descriere&quot;&gt;&lt;/iframe&gt;</code>. Pentru exerciții locale poți experimenta și cu <code>srcdoc</code>."},{label:"Exemplu",html:"<pre>&lt;iframe srcdoc=&quot;&lt;h2&gt;Salut din iframe&lt;/h2&gt;&quot; title=&quot;Exemplu&quot;&gt;&lt;/iframe&gt;</pre>"}]},
frames:{title:"Frame / Frameset (istoric)",levels:[{label:"Indiciu",html:"<code>frameset</code> și <code>frame</code> apar în pagini HTML vechi. Le studiem pentru recunoaștere și context istoric, nu ca soluție recomandată pentru proiecte noi."},{label:"Sintaxă",html:"În documentele vechi, <code>&lt;frameset&gt;</code> împărțea fereastra, iar fiecare <code>&lt;frame&gt;</code> încărca un document separat."},{label:"Exemplu",html:"<pre>&lt;frameset cols=&quot;25%,75%&quot;&gt;\n &lt;frame src=&quot;meniu.html&quot;&gt;\n &lt;frame src=&quot;continut.html&quot;&gt;\n&lt;/frameset&gt;</pre>Compară această idee cu layoutul modern CSS Grid."}]},
grid:{title:"CSS Grid – layout modern",levels:[{label:"Indiciu",html:"CSS Grid organizează elementele într-o rețea de rânduri și coloane, fără a împărți pagina în documente separate."},{label:"Sintaxă",html:"Pe container: <code>display: grid</code>; apoi, de exemplu, <code>grid-template-columns: 1fr 2fr</code> și <code>gap: 12px</code>."},{label:"Exemplu",html:"<pre>.pagina {\n display: grid;\n grid-template-columns: 200px 1fr;\n gap: 16px;\n}</pre>Aplică această clasă unui element care conține două zone."}]},
project:{title:"Mini-site",levels:[{label:"Indiciu",html:"Combină structura semantică, textul, legăturile, imaginile și un layout simplu. Construiește pe secțiuni, nu totul dintr-o dată."},{label:"Sintaxă",html:"Poți organiza pagina cu <code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;section&gt;</code>, <code>&lt;article&gt;</code> și apoi să folosești CSS pentru layout."},{label:"Exemplu",html:"<pre>&lt;header&gt;&lt;h1&gt;Proiectul meu&lt;/h1&gt;&lt;/header&gt;\n&lt;main&gt;\n &lt;section&gt;&lt;h2&gt;Despre&lt;/h2&gt;...&lt;/section&gt;\n&lt;/main&gt;</pre>Adaugă treptat navigare, imagine și două zone de conținut."}]}
};
const helpBtn=document.getElementById("helpBtn"),helpPanel=document.getElementById("helpPanel"),helpTitle=document.getElementById("helpTitle"),helpContent=document.getElementById("helpContent"),helpLevelLabel=document.getElementById("helpLevelLabel"),helpUsage=document.getElementById("helpUsage"),prevHelp=document.getElementById("prevHelp"),nextHelp=document.getElementById("nextHelp"),closeHelp=document.getElementById("closeHelp");
let helpLevel=0,helpUsed={};
function currentHelp(){return helpData[X.value]||helpData.basic}
function renderHelp(){
 const h=currentHelp(),level=h.levels[helpLevel];
 helpTitle.textContent=`💡 Ajutor – ${h.title}`;
 helpLevelLabel.textContent=`${level.label} ${helpLevel+1} din ${h.levels.length}`;
 helpContent.innerHTML=level.html;
 helpUsed[X.value]=Math.max(helpUsed[X.value]||0,helpLevel+1);
 helpUsage.textContent=`Ajutor utilizat: ${helpUsed[X.value]}/${h.levels.length}`;
 prevHelp.disabled=helpLevel===0;
 nextHelp.disabled=helpLevel>=h.levels.length-1;
 nextHelp.textContent=helpLevel>=h.levels.length-1?"Ai ajuns la ultimul indiciu":"Mai mult ajutor →";
}
function openHelp(){helpLevel=0;helpPanel.classList.remove("hidden");renderHelp();helpPanel.scrollIntoView({behavior:"smooth",block:"nearest"})}
helpBtn.onclick=openHelp;
closeHelp.onclick=()=>helpPanel.classList.add("hidden");
nextHelp.onclick=()=>{if(helpLevel<currentHelp().levels.length-1){helpLevel++;renderHelp()}};
prevHelp.onclick=()=>{if(helpLevel>0){helpLevel--;renderHelp()}};
X.addEventListener("change",()=>{if(!helpPanel.classList.contains("hidden")){helpLevel=0;renderHelp()}});

// V3.7 — Protecție Reset + Editor de lecții/Help pentru profesor.
const CUSTOM_KEY="htmlLabTeacherLessonsV37";
let customLessons={};
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function textHelp(s){return esc(s).replace(/\n/g,"<br>")}
function loadCustomLessons(){try{customLessons=JSON.parse(localStorage.getItem(CUSTOM_KEY)||"{}")||{}}catch{customLessons={}};refreshCustomLessons()}
function refreshCustomLessons(){
 const g=document.getElementById("customLessonsGroup"); g.innerHTML="";
 const items=Object.entries(customLessons); g.hidden=!items.length;
 items.sort((a,b)=>(a[1].title||"").localeCompare(b[1].title||"","ro")).forEach(([id,l])=>{const o=document.createElement("option");o.value=id;o.textContent=l.title||"Lecție fără titlu";g.appendChild(o)});
}
function lessonCodeFor(id=X.value){return customLessons[id]?.code ?? examples[id] ?? examples.basic}
function helpFor(id=X.value){
 const l=customLessons[id]; if(!l)return helpData[id]||helpData.basic;
 return {title:l.title,levels:[{label:"Indiciu",html:textHelp(l.hints?.[0]||"Nu a fost definit încă un indiciu.")},{label:"Sintaxă",html:textHelp(l.hints?.[1]||"Nu a fost definit încă un indiciu.")},{label:"Exemplu",html:textHelp(l.hints?.[2]||"Nu a fost definit încă un exemplu.")}]};
}
currentHelp=()=>helpFor(X.value);
function showTask(){
 let old=document.getElementById("lessonTaskBox"); if(old)old.remove();
 const l=customLessons[X.value]; if(!l?.task)return;
 const box=document.createElement("div");box.id="lessonTaskBox";box.className="lesson-task";box.innerHTML="<b>Cerință:</b> "+esc(l.task);
 document.querySelector("section.bar:not(.file)").insertAdjacentElement("afterend",box);
}
X.onchange=()=>{E.value=lessonCodeFor();run();showTask();if(!helpPanel.classList.contains("hidden")){helpLevel=0;renderHelp()}};
document.getElementById("reset").onclick=()=>{
 const original=lessonCodeFor();
 if(E.value===original){msg("Codul este deja la forma inițială.");return}
 if(confirm("Reinițializezi codul?\n\nModificările nesalvate din editor vor fi pierdute.")){E.value=original;run();msg("Codul a fost reinițializat.")}
};

const teacherModal=document.getElementById("teacherModal"),teacherStatus=document.getElementById("teacherStatus");
const fields={title:document.getElementById("lessonTitle"),category:document.getElementById("lessonCategory"),task:document.getElementById("lessonTask"),code:document.getElementById("lessonCode"),h1:document.getElementById("lessonHint1"),h2:document.getElementById("lessonHint2"),h3:document.getElementById("lessonHint3")};
let editingLessonId=null;
function teacherMsg(t,bad=false){teacherStatus.textContent=t;teacherStatus.style.color=bad?"#b42318":"#137a4a"}
function clearTeacher(){editingLessonId=null;Object.values(fields).forEach(f=>f.value="");fields.category.value="Lecțiile mele";fields.code.value='<!DOCTYPE html>\n<html lang="ro">\n<head><meta charset="UTF-8"><title>Lecția mea</title></head>\n<body>\n\n</body>\n</html>';teacherMsg("Lecție nouă.")}
function fillTeacher(l,id=null){editingLessonId=id;fields.title.value=l.title||"";fields.category.value=l.category||"Lecțiile mele";fields.task.value=l.task||"";fields.code.value=l.code||"";fields.h1.value=l.hints?.[0]||"";fields.h2.value=l.hints?.[1]||"";fields.h3.value=l.hints?.[2]||"";teacherMsg(id?"Editezi o lecție creată de profesor.":"Ai preluat lecția curentă ca punct de plecare. La salvare va fi creată o copie personalizată.")}
document.getElementById("teacherBtn").onclick=()=>{teacherModal.classList.remove("hidden"); if(customLessons[X.value])fillTeacher(customLessons[X.value],X.value);else clearTeacher()};
document.getElementById("closeTeacher").onclick=()=>teacherModal.classList.add("hidden");
teacherModal.addEventListener("click",e=>{if(e.target===teacherModal)teacherModal.classList.add("hidden")});
document.getElementById("newLesson").onclick=clearTeacher;
document.getElementById("loadCurrentLesson").onclick=()=>{
 const id=X.value,l=customLessons[id]; if(l){fillTeacher(l,id);return}
 const h=helpData[id]||helpData.basic; fillTeacher({title:h.title,category:"Adaptată din bibliotecă",task:"",code:lessonCodeFor(id),hints:h.levels.map(x=>x.html.replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim())});
};
document.getElementById("saveLesson").onclick=()=>{
 const title=fields.title.value.trim(); if(!title){teacherMsg("Completează titlul lecției.",true);fields.title.focus();return}
 const code=fields.code.value.trim(); if(!code){teacherMsg("Completează codul HTML inițial.",true);fields.code.focus();return}
 const id=editingLessonId||("teacher_"+Date.now());
 customLessons[id]={title,category:fields.category.value.trim()||"Lecțiile mele",task:fields.task.value.trim(),code:fields.code.value,hints:[fields.h1.value.trim(),fields.h2.value.trim(),fields.h3.value.trim()]};
 localStorage.setItem(CUSTOM_KEY,JSON.stringify(customLessons));editingLessonId=id;refreshCustomLessons();X.value=id;E.value=code;run();showTask();teacherMsg("✓ Lecția a fost salvată local și adăugată în bibliotecă.");
};
document.getElementById("deleteLesson").onclick=()=>{
 if(!editingLessonId||!customLessons[editingLessonId]){teacherMsg("Poți șterge numai o lecție creată în Editorul profesor.",true);return}
 if(!confirm(`Ștergi lecția „${customLessons[editingLessonId].title}”?`))return;
 delete customLessons[editingLessonId];localStorage.setItem(CUSTOM_KEY,JSON.stringify(customLessons));refreshCustomLessons();X.value="basic";E.value=examples.basic;run();showTask();clearTeacher();teacherMsg("Lecția a fost ștearsă.")
};
document.getElementById("exportLessons").onclick=()=>{
 const data={format:"HTML-Lab-lessons",version:"3.7",exportedAt:new Date().toISOString(),lessons:customLessons};
 const u=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"})),a=document.createElement("a");a.href=u;a.download="html-lab-lectii-profesor.json";a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);teacherMsg("Lecțiile au fost exportate în JSON.")
};
const importFile=document.getElementById("importLessonsFile");document.getElementById("importLessons").onclick=()=>importFile.click();
importFile.onchange=async()=>{try{const obj=JSON.parse(await importFile.files[0].text());const incoming=obj.lessons||obj;if(!incoming||typeof incoming!=="object")throw new Error();customLessons={...customLessons,...incoming};localStorage.setItem(CUSTOM_KEY,JSON.stringify(customLessons));refreshCustomLessons();teacherMsg(`✓ Import reușit. Biblioteca profesorului conține ${Object.keys(customLessons).length} lecții.`)}catch{teacherMsg("Fișier JSON invalid pentru HTML Lab.",true)}finally{importFile.value=""}};
loadCustomLessons();showTask();
