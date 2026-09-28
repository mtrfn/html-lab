# Verificare V3.7.2

Testat în Microsoft Edge headless cu Playwright, fără apeluri Microsoft.

- Secțiunile Date lecție, Cod inițial și Help se deschid independent.
- Plierea și redeschiderea păstrează textul introdus.
- Comenzile Space și Enter funcționează pe anteturile secțiunilor.
- Salvarea fără titlu sau cod deschide secțiunea necesară și focalizează câmpul.
- Verificare vizuală desktop 1280×900 și mobil 390×844; fără depășire orizontală a formularului.
- Salvare, selectare, deschidere explicită, previzualizare, cerință, păstrarea numelui lucrării — PASS.
- Trei niveluri Help și păstrarea nivelului maxim utilizat — PASS.
- Reset: fără modificări, anulare și confirmare — PASS.
- Lecții locale după reîncărcare și toate cele 13 lecții standard — PASS.
- Export, ștergere și reimport JSON — PASS.
- Nicio eroare JavaScript de pagină în scenariile testate.

Față de V3.7.1 sunt modificate app.js, index.html, style.css și documentația. Toate celelalte fișiere, inclusiv graph.js, teams-init.js și config.html, sunt identice octet cu octet. Autentificarea și predarea reală în Teams nu au fost retestate cu un cont Microsoft.

## Verificare după instalare

Înlocuiește fișierele din repository și verifică V3.7.2 în antet. Deschide Editor profesor, extinde Cod inițial și Help, apoi pliază și redeschide secțiunile. Verifică păstrarea textului și salvează lecția. Datele locale folosesc cheia V3.7 existentă; păstrează aceeași adresă și același browser.
