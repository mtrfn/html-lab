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