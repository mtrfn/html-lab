# DB-Lab V1.4.0 — Diagramă ERD

## Actualizare
1. Exportă proiectul curent ca măsură de rezervă.
2. În repository-ul mtrfn/db-lab încarcă fișierele din folderul db-lab al arhivei, cu index.html în rădăcină, nu într-un subfolder.
3. Așteaptă publicarea GitHub Pages. În browser reîncarcă folosind Ctrl+F5; în Teams reîncarcă fila sau închide și redeschide fila.
4. Verifică V1.4.0 în antet și fila Diagramă ERD.

Configurația microsoft-config.js din această arhivă păstrează identificatorii furnizați în versiunea ta V1.3. Manifestul și pachetul Teams rămân V1.3.0 intenționat: această actualizare este numai a site-ului; nu necesită reinstalarea aplicației Teams, alte permisiuni sau modificarea fișierului lectii.json din SharePoint. Ghidul CONFIGURARE-TEAMS.html descrie în continuare înregistrarea Microsoft V1.3, valabilă și pentru V1.4.

## Utilizare
- Diagramă ERD afișează toate tabelele proiectului curent, câmpurile și tipurile, PK și FK.
- Selectează o linie sau un buton de relație pentru evidențierea câmpurilor și regulile ON DELETE/ON UPDATE.
- Trage antetele tabelelor; navigarea cu Tab și săgețile permite și deplasarea prin tastatură.
- +/− reglează zoomul, Încadrează potrivește diagrama, Aranjare automată reface pozițiile. Folosește derularea pentru diagrame mari.
- Schema se actualizează după operații SQL și vizuale, import, resetare și schimbarea lecției.
- Pozițiile sunt temporare (nu se exportă și nu se păstrează la redeschidere).
- Sunt desenate FK declarate, inclusiv autoreferințe și chei compuse. Nu se deduc relații din denumiri și nu se afișează cardinalități neconfirmate.
- Referințele nerezolvate apar în lista de relații cu avertizare.
- Nu se modifică schema prin tragerea tabelelor. Nu este inclusă încă predarea în Teams.

## Probă în clasă
Pe Catalogul școlar: 4 tabele și 3 relații FK. Selectează elevi.clasa_id → clase.id. Mută elevi și verifică urmărirea liniei, apoi zoom și Încadrează. Creează/redenumește un tabel în SQL, apoi revino la ERD. Lecția Biblioteca mea de cărți are un singur tabel și zero relații — este normal. Verifică ERD și cu contul de elev; atelierul rămâne restricționat.

## Verificare
Au trecut testele motorului SQLite, V1.1, V1.2, V1.3 (Microsoft simulat) și V1.4 ERD (catalog, chei compuse implicite, autoreferințe, referințe lipsă, redenumire, schemă goală). Sintaxa JS verificată. Nu s-a efectuat o probă automată vizuală în browser sau o reconectare reală la tenant în această sesiune.
