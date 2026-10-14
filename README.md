# DB-Lab V1.4.0

Nou: fila Diagramă ERD. Pentru actualizare și limite citește ACTUALIZARE-V1.4.md.

# DB-Lab V1.3.0 — Lecții SQL și atelier local

## Ce include

- Opt lecții: SELECT, WHERE, ORDER BY / LIMIT, JOIN, AVG / GROUP BY, NULL, INSERT cu cheie externă și UPDATE cu WHERE.
- Fiecare lecție are enunț, SQL de inițializare a bazei, SQL de pornire pentru elev și trei trepte de ajutor: indiciu, sintaxă, exemplu.
- Biblioteca afișează lecțiile pe categorii. Selectarea unei lecții doar previzualizează conținutul. „Deschide / continuă” pregătește baza sau reia lucrarea salvată.
- Progres local separat pentru fiecare lecție: bază de date, text SQL, numele lucrării, versiunea enunțului și nivelul maxim de ajutor consultat. Numărul de indicii este informativ; nu reprezintă o notă sau o dovadă de evaluare.
- Proiectul liber rămâne salvat separat; „Revino la proiectul liber” îl restaurează. Proiect nou, Catalog / Resetare și importul unui proiect liber păstrează sensul de înlocuire explicită a proiectului liber.
- Atelier cu secțiuni pliabile: datele lecției, baza inițială / codul elevului, ajutor progresiv. Poți crea, copia, modifica, verifica, salva și șterge lecții proprii.
- Verificarea și salvarea unei lecții execută doar SQL-ul de inițializare într-o bază temporară. Nu modifică proiectul deschis. SQL-ul de pornire poate fi incomplet; nu este executat sau validat automat ca rezolvare.
- Import/export de biblioteci JSON. Importul prezintă lecțiile și înlocuirile înainte de confirmare, nu execută SQL și nu schimbă proiectul curent.
- Formularele, listele de chei externe, NULL și previzualizarea SQL din V1.1 sunt păstrate.

## Instalare pe GitHub Pages

1. Exportă proiectul actual ca rezervă.
2. Dezarhivează pachetul. Încarcă **tot conținutul** folderului `db-lab` în rădăcina publicată a repository-ului. Nu adăuga un nivel suplimentar `db-lab` peste cel existent.
3. Include fișierele noi `lesson-core.js`, `lessons.js` și `lessons.json`, împreună cu toate fișierele existente și folderul `vendor`.
4. Confirmă modificările în GitHub și așteaptă publicarea Pages.
5. Reîncarcă pagina cu Ctrl + F5. Antetul trebuie să arate **V1.3.0**.

Căile sunt relative și fișierele interfeței / Worker au versiune în adresă pentru evitarea copiilor vechi din cache. Nu este necesară compilarea sau instalarea de pachete. Motorul SQLite este inclus local. Pentru această versiune nu este necesară găzduire în Azure.

Local: din acest folder rulează `python -m http.server 8000`, apoi deschide http://localhost:8000. `file://` nu este suportat.

## Prima probă — aproximativ 5 minute

1. În **Lecții SQL**, selectează **Primul SELECT** și apasă **Deschide / continuă lecția**.
2. Rezolvă enunțul în Editor SQL și execută interogarea.
3. Deschide **Ajutor în 3 trepte** și parcurge indiciul, sintaxa și exemplul. Ajutorul nu înlocuiește textul din editor.
4. Apasă **Revino la proiectul liber**: baza și SQL-ul de dinaintea lecției trebuie să reapară.
5. Deschide din nou lecția și reîncarcă pagina: progresul trebuie să rămână.
6. În bibliotecă apasă **Copiază în atelier**, modifică titlul/enunțul și salvează. Lecția va apărea la **Lecțiile mele**.
7. Exportă lecțiile proprii și importă biblioteca pe alt calculator. Elevul apasă Deschide pentru a porni o copie a bazei.

## Ce salvează fiecare export

| Acțiune | Conținut |
|---|---|
| Export proiect | Lucrarea curentă: baza, SQL-ul, numele și, dacă este o lecție, enunțul și ajutorul asociat |
| Export SQLite | Doar baza curentă |
| Exportă lecțiile mele | Toate definițiile proprii salvate în atelier; nu include lucrările elevului și nici toate lecțiile incluse |
| Exportă lecția selectată | O singură definiție, inclusă sau proprie |

Salvarea în atelier este manuală. Modificările nesalvate sunt semnalate, iar schimbarea draftului și închiderea paginii cer confirmare când browserul permite. Schimbarea filelor din aplicație păstrează draftul în memorie.

## Compatibilitate și stocare

Baza IndexedDB rămâne `db-lab-v1`, versiunea 1, cu store-ul `projects`. Proiectele V1.0 / V1.1 și înregistrarea `active` se păstrează. V1.2 adaugă cheile `workspace-free`, `lesson-progress:<sursă>:<id>` și `lesson-library-v1`; nu șterge datele vechi.

Proiectul `.dblab.json` păstrează `format: "DB-Lab"`, `version: 1`, `name`, `sql`, `bytes`. Câmpul opțional `lesson` adaugă contextul exercițiului. Versiunile vechi pot citi baza și SQL-ul, dar la o nouă salvare în versiunea veche contextul de lecție nu se păstrează.

Biblioteca este un format separat: `format: "DB-Lab-lessons"`, `version: 1`, `lessons: [...]`. Fiecare definiție conține `id`, `title`, `category`, `task`, `setupSQL`, `starterSQL`, `hints` (exact trei texte). Formatul diferă de biblioteca HTML-Lab. Vezi `exemplu-lectii.json` pentru o bibliotecă pregătită de import.

Importul combină bibliotecile după id: lecțiile noi sunt adăugate, cele cu același id sunt înlocuite după confirmare. Lecțiile incluse și cele proprii au spații separate de identificatori. Lucrările deja începute păstrează versiunea inițială a enunțului și bazei. Pentru a folosi o definiție actualizată, selecteaz-o în bibliotecă și apasă **Pornește de la început**; exportă mai întâi progresul de păstrat. **Resetează lecția** din panoul lucrării reia definiția asociată lucrării curente.

Ștergerea unei definiții locale nu șterge lucrarea deja începută; dacă este deschisă, aceasta poate fi continuată/exportată. Reimportarea aceleiași definiții cu același id permite reluarea progresului păstrat.

Dacă salvarea proiectului eșuează, schimbarea lecției este oprită. Dacă biblioteca locală nu poate fi citită/validată, aplicația nu o suprascrie automat. Exportă periodic: stocarea browserului este locală și poate fi eliminată prin ștergerea datelor site-ului.

## Microsoft Teams și SharePoint — V1.3

Deschide **CONFIGURARE-TEAMS.html** de pe site pentru ghid și generatorul pachetului Teams. Sunt necesare o înregistrare Entra separată, Client ID, Tenant ID, aprobarea permisiunilor delegate și instalarea aplicației conform politicilor școlii. Configurația livrată este goală intenționat. Nicio parolă sau secret nu se introduce în site.

În canalul standard al unei clase educaționale, aplicația verifică profilul, organizația și apartenența prin Microsoft Graph. Atelierul apare profesorilor confirmați pentru acea clasă. Biblioteca centrală se citește din `DB-Lab/lectii.json` din rădăcina bibliotecii implicite SharePoint. Publicarea este manuală, prin export și încărcare în SharePoint. Permisiunile SharePoint trebuie configurate pentru citire la elevi și editare la profesori; interfața nu este o barieră de securitate.

Progresul rămâne local, separat după organizație, cont și clasă; tokenurile aplicației sunt în memorie. Datele nu sunt criptate față de alte persoane cu acces la același profil de browser. Modul local păstrează cheile V1.2 și nu mută automat proiectele în spațiul Teams. Folosește Export/Import pentru transfer.

Exportul proiectelor rămâne format V1. Datele și SQL-ul se pot deschide în V1.0. Contextul nou de lecție SharePoint necesită V1.3; V1.2 nu înțelege identificatorul clasei din metadatele unui astfel de export. Proiectele V1.0–V1.2 se importă în V1.3.

Nu sunt incluse sincronizarea proiectelor, predarea Teams și evaluarea. Testele Microsoft folosesc răspunsuri simulate; conectarea reală, acordul administratorului și accesul SharePoint trebuie verificate în organizația școlii. Fișierele privacy.html și terms.html descriu comportamentul aplicației și se completează cu informațiile instituției înainte de distribuire.

## Limite tehnice și verificări

- Maximum 100 de lecții într-o bibliotecă de 2 MB; limite de lungime pentru câmpuri și validare înainte de import/salvare.
- Grila: 200 de rânduri; rezultate SQL: 500 afișate. Operații limitate la 15 secunde; import proiect: 20 MB.
- Editarea vizuală necesită cheie primară nenulă și rând fără BLOB binar. Câmpurile generate sunt doar pentru citire.
- Textul lecțiilor este afișat ca text, nu ca HTML executabil. SQL-ul lecției rulează în SQLite local, numai la acțiunea utilizatorului.
- Verificarea bazei inițiale nu este o verificare a corectitudinii rezolvării și nu acordă note.

Teste cu Node.js, din acest folder:

```
node test-worker.cjs
node test-v11.cjs
node test-v12.cjs
node test-v13.cjs
```

Verificările V1.3 sunt în `TESTARE-V1.3.md`; cele anterioare în `TESTARE-V1.2.md`. Licența și versiunea motorului distribuit rămân în `vendor` și `VENDOR-VERSION.txt`.
