// Biblioteca privata este citita numai dupa autentificarea Microsoft.
const MAX_BYTES = 2 * 1024 * 1024;
const statusEl = document.getElementById("classLibraryStatus");
const refreshBtn = document.getElementById("refreshClassLibrary");
let generation = 0, controller;

function status(text) { statusEl.textContent = text; }

export function resetClassLibrary(message = "Conectează-te la Microsoft pentru lecțiile clasei.") {
  generation++;
  controller?.abort();
  window.htmlLabClassLessons.clear();
  refreshBtn.disabled = true;
  status(message);
}

export function validateLibrary(data) {
  if (!data || data.format !== "HTML-Lab-lessons" || !data.lessons ||
      typeof data.lessons !== "object" || Array.isArray(data.lessons)) throw new Error("format");
  const entries = Object.entries(data.lessons);
  if (entries.length > 200) throw new Error("format");
  const result = Object.create(null);
  for (const [id, lesson] of entries) {
    if (!/^[a-zA-Z0-9_-]{1,100}$/.test(id) || ["__proto__", "constructor", "prototype"].includes(id) ||
        !lesson || typeof lesson !== "object" || Array.isArray(lesson) ||
        typeof lesson.title !== "string" || !lesson.title.trim() || lesson.title.length > 300 ||
        typeof lesson.code !== "string" || !lesson.code.trim() || lesson.code.length > 200000 ||
        !Array.isArray(lesson.hints) || lesson.hints.length !== 3 ||
        lesson.hints.some(h => typeof h !== "string" || h.length > 20000) ||
        (lesson.task !== undefined && (typeof lesson.task !== "string" || lesson.task.length > 20000)) ||
        (lesson.category !== undefined && (typeof lesson.category !== "string" || lesson.category.length > 300))) {
      throw new Error("format");
    }
    result[id] = {title: lesson.title, code: lesson.code, hints: [...lesson.hints],
      task: lesson.task || "", category: lesson.category || ""};
  }
  return result;
}

async function readLimitedJSON(response) {
  if (Number(response.headers.get("content-length")) > MAX_BYTES) throw new Error("size");
  const reader = response.body.getReader(), decoder = new TextDecoder();
  let size = 0, text = "";
  try {
    for (;;) {
      const {done, value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) { await reader.cancel(); throw new Error("size"); }
      text += decoder.decode(value, {stream: true});
    }
    return JSON.parse(text + decoder.decode());
  } finally { reader.releaseLock(); }
}

export async function loadClassLibrary(teamId, getToken) {
  resetClassLibrary();
  const request = generation;
  if (!teamId) {
    status("Deschide HTML Lab în fila Teams a clasei pentru a vedea lecțiile ei.");
    return;
  }
  const aborter = new AbortController(); controller = aborter;
  const timeout = setTimeout(() => aborter.abort(), 20000);
  status("Încarc lecțiile private ale clasei…");
  try {
    const auth = await getToken();
    if (request !== generation) return;
    if (aborter.signal.aborted) throw new Error("timeout");
    const headers = {Authorization: "Bearer " + auth.accessToken};
    const group = encodeURIComponent(teamId);
    // Microsoft verifica apartenenta la clasa pentru acest endpoint delegat.
    const membership = await fetch("https://graph.microsoft.com/v1.0/education/classes/" + group + "/teachers?$select=id",
      {headers, cache: "no-store", signal: aborter.signal});
    if (!membership.ok) throw new Error(membership.status === 401 ? "auth" : "membership");
    const metadata = await fetch("https://graph.microsoft.com/v1.0/groups/" + group + "/drive/root:/HTML-Lab/lectii.json?$select=id,size,file,@microsoft.graph.downloadUrl",
      {headers, cache: "no-store", signal: aborter.signal});
    if (!metadata.ok) throw new Error(metadata.status === 404 ? "missing" : metadata.status === 401 ? "auth" : "access");
    const item = await metadata.json();
    if (!item.file || typeof item.size !== "number") throw new Error("format");
    if (item.size > MAX_BYTES) throw new Error("size");
    const downloadUrl = new URL(item["@microsoft.graph.downloadUrl"]);
    if (downloadUrl.protocol !== "https:") throw new Error("format");
    // URL temporar Microsoft, fara token, cookie-uri sau referer.
    const response = await fetch(downloadUrl.href, {cache: "no-store", credentials: "omit",
      referrerPolicy: "no-referrer", signal: aborter.signal});
    if (!response.ok) throw new Error("download");
    const lessons = validateLibrary(await readLimitedJSON(response));
    if (request !== generation) return;
    window.htmlLabClassLessons.replace(lessons);
    const count = Object.keys(lessons).length;
    status(count === 1 ? "O lecție disponibilă în „Lecțiile clasei”." : count ? count + " lecții disponibile în „Lecțiile clasei”." : "Biblioteca clasei nu conține încă lecții.");
  } catch (error) {
    if (request !== generation) return;
    const messages = {
      missing: "Biblioteca nu este publicată încă. Profesorul trebuie să adauge HTML-Lab/lectii.json în biblioteca de documente a clasei.",
      membership: "Nu pot verifica apartenența la clasă. Verifică contul Microsoft și accesul la clasa Teams.",
      access: "Nu ai acces la fișierul bibliotecii. Profesorul trebuie să verifice permisiunile din SharePoint.",
      auth: "Sesiunea Microsoft a expirat. Reconectează-te și încearcă din nou.",
      size: "Biblioteca depășește limita de 2 MB.",
      format: "Fișierul bibliotecii nu are formatul așteptat. Profesorul trebuie să îl exporte din nou."
    };
    status(messages[error.message] || "Biblioteca nu a putut fi încărcată. Verifică conexiunea și apasă Actualizează lecțiile.");
  } finally {
    clearTimeout(timeout);
    if (request === generation) refreshBtn.disabled = false;
  }
}

