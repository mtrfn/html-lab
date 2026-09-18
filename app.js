const editor = document.getElementById("codeEditor");
const preview = document.getElementById("preview");
const statusEl = document.getElementById("status");
const exampleSelect = document.getElementById("exampleSelect");
const STORAGE_KEY = "htmlLabCodeV1";

const examples = {
  basic: `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <title>Prima mea pagină</title>
</head>
<body>
  <h1>Salut!</h1>
  <p>Prima mea pagină HTML.</p>
</body>
</html>`,
  headings: `<!DOCTYPE html>
<html lang="ro">
<body>
  <h1>Titlul principal</h1>
  <h2>Un subtitlu</h2>
  <p>Acesta este un paragraf.</p>
  <p>HTML organizează conținutul unei pagini web.</p>
</body>
</html>`,
  links: `<!DOCTYPE html>
<html lang="ro">
<body>
  <h1>Linkuri HTML</h1>
  <p>
    Vizitează
    <a href="https://www.example.com">acest exemplu de link</a>.
  </p>
</body>
</html>`,
  lists: `<!DOCTYPE html>
<html lang="ro">
<body>
  <h1>Componentele unui calculator</h1>
  <ul>
    <li>Procesor</li>
    <li>Memorie RAM</li>
    <li>SSD</li>
  </ul>
</body>
</html>`,
  table: `<!DOCTYPE html>
<html lang="ro">
<body>
  <h1>Orar</h1>
  <table border="1" cellpadding="8">
    <tr><th>Ora</th><th>Disciplina</th></tr>
    <tr><td>08:00</td><td>TIC</td></tr>
    <tr><td>09:00</td><td>Informatică</td></tr>
  </table>
</body>
</html>`
};

function setStatus(message) {
  statusEl.textContent = message;
  clearTimeout(setStatus.timer);
  setStatus.timer = setTimeout(() => statusEl.textContent = "", 2200);
}

function runCode() {
  preview.srcdoc = editor.value;
  setStatus("Previzualizare actualizată.");
}

function saveCode() {
  localStorage.setItem(STORAGE_KEY, editor.value);
  setStatus("Cod salvat pe acest dispozitiv.");
}

function resetCode() {
  if (confirm("Revii la exemplul selectat? Codul nesalvat va fi înlocuit.")) {
    editor.value = examples[exampleSelect.value];
    runCode();
    setStatus("Exemplul a fost restaurat.");
  }
}

document.getElementById("runBtn").addEventListener("click", runCode);
document.getElementById("saveBtn").addEventListener("click", saveCode);
document.getElementById("resetBtn").addEventListener("click", resetCode);

exampleSelect.addEventListener("change", () => {
  editor.value = examples[exampleSelect.value];
  runCode();
});

editor.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.key === "Enter") runCode();

  if (event.key === "Tab") {
    event.preventDefault();
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    editor.value = editor.value.substring(0, start) + "  " + editor.value.substring(end);
    editor.selectionStart = editor.selectionEnd = start + 2;
  }
});

let autosaveTimer;
editor.addEventListener("input", () => {
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    localStorage.setItem(STORAGE_KEY, editor.value);
    statusEl.textContent = "Salvat automat.";
  }, 900);
});

const saved = localStorage.getItem(STORAGE_KEY);
editor.value = saved || examples.basic;
runCode();
