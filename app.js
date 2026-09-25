const E=document.getElementById("editor"),P=document.getElementById("preview"),S=document.getElementById("status"),N=document.getElementById("filename"),F=document.getElementById("picker"),X=document.getElementById("examples");
const CK="htmlLabV3Code",NK="htmlLabV3Name";
const examples={basic:`<!DOCTYPE html>
<html lang="ro"><head><meta charset="UTF-8"><title>Prima mea pagină</title></head>
<body><h1>Salut!</h1><p>Prima mea pagină HTML.</p></body></html>`,
headings:`<!DOCTYPE html><html lang="ro"><body><h1>Titlul principal</h1><h2>Un subtitlu</h2><p>Acesta este un paragraf.</p></body></html>`,
lists:`<!DOCTYPE html><html lang="ro"><body><h1>Componentele unui calculator</h1><ul><li>Procesor</li><li>Memorie RAM</li><li>SSD</li></ul></body></html>`,
table:`<!DOCTYPE html><html lang="ro"><body><h1>Orar</h1><table border="1" cellpadding="8"><tr><th>Ora</th><th>Disciplina</th></tr><tr><td>08:00</td><td>TIC</td></tr></table></body></html>`};
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
 basic:{title:"Prima pagină",levels:[
  {label:"Indiciu",html:"O pagină HTML are o structură de bază. Conținutul pe care îl vede utilizatorul se scrie în interiorul elementului <code>&lt;body&gt;</code>. Pentru un titlu principal și un paragraf există etichete HTML dedicate."},
  {label:"Sintaxă",html:"Pentru titlul principal folosește <code>&lt;h1&gt;...&lt;/h1&gt;</code>, iar pentru un paragraf <code>&lt;p&gt;...&lt;/p&gt;</code>. Documentul începe de regulă cu <code>&lt;!DOCTYPE html&gt;</code>."},
  {label:"Exemplu",html:"Exemplu asemănător:<pre>&lt;body&gt;\n  &lt;h1&gt;Pagina mea&lt;/h1&gt;\n  &lt;p&gt;Învăț să construiesc pagini web.&lt;/p&gt;\n&lt;/body&gt;</pre>Adaptează singur textele și structura pentru cerința ta."}
 ]},
 headings:{title:"Titluri și paragrafe",levels:[
  {label:"Indiciu",html:"HTML oferă șase niveluri de titluri. <code>&lt;h1&gt;</code> este nivelul principal, iar nivelurile următoare merg până la <code>&lt;h6&gt;</code>. Textul obișnuit poate fi organizat în paragrafe."},
  {label:"Sintaxă",html:"Forme generale: <code>&lt;h1&gt;Titlu principal&lt;/h1&gt;</code>, <code>&lt;h2&gt;Subtitlu&lt;/h2&gt;</code> și <code>&lt;p&gt;Paragraf&lt;/p&gt;</code>."},
  {label:"Exemplu",html:"Exemplu:<pre>&lt;h1&gt;Aviație&lt;/h1&gt;\n&lt;h2&gt;Aerodromuri&lt;/h2&gt;\n&lt;p&gt;Un aerodrom este o suprafață destinată operării aeronavelor.&lt;/p&gt;</pre>Folosește alt conținut în lucrarea ta."}
 ]},
 lists:{title:"Liste",levels:[
  {label:"Indiciu",html:"Pentru o enumerare neordonată folosește o listă cu marcatori. Fiecare element al listei trebuie introdus separat."},
  {label:"Sintaxă",html:"Lista neordonată se delimitează cu <code>&lt;ul&gt;...&lt;/ul&gt;</code>, iar fiecare element cu <code>&lt;li&gt;...&lt;/li&gt;</code>. Pentru o listă numerotată se folosește <code>&lt;ol&gt;</code>."},
  {label:"Exemplu",html:"Exemplu:<pre>&lt;ul&gt;\n  &lt;li&gt;Monitor&lt;/li&gt;\n  &lt;li&gt;Tastatură&lt;/li&gt;\n  &lt;li&gt;Mouse&lt;/li&gt;\n&lt;/ul&gt;</pre>Construiește lista cerută folosind propriile elemente."}
 ]},
 table:{title:"Tabele",levels:[
  {label:"Indiciu",html:"Un tabel HTML este alcătuit din rânduri și celule. Antetul poate folosi celule diferite de cele cu date."},
  {label:"Sintaxă",html:"Folosește <code>&lt;table&gt;</code> pentru tabel, <code>&lt;tr&gt;</code> pentru rând, <code>&lt;th&gt;</code> pentru celulă de antet și <code>&lt;td&gt;</code> pentru celulă de date."},
  {label:"Exemplu",html:"Exemplu:<pre>&lt;table border=\"1\"&gt;\n  &lt;tr&gt;&lt;th&gt;Produs&lt;/th&gt;&lt;th&gt;Preț&lt;/th&gt;&lt;/tr&gt;\n  &lt;tr&gt;&lt;td&gt;Caiet&lt;/td&gt;&lt;td&gt;8 lei&lt;/td&gt;&lt;/tr&gt;\n&lt;/table&gt;</pre>Adaptează numărul de rânduri și conținutul la cerință."}
 ]}
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
