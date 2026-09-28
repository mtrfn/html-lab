# V3.8.3 — verificare

Edge headless / Playwright, cu răspunsuri Microsoft simulate:
- Buton ascuns înainte de conectare.
- Profesor confirmat în clasa curentă: editor vizibil și export funcțional.
- Elev: buton ascuns, acțiuni dezactivate, apelarea handlerului nu deschide editorul.
- Profesor găsit pe pagina a doua: editor vizibil.
- Reconectare: editor închis și acces reevaluat.
- Verificare rol cu HTTP 403: editor ascuns și mesaj de reîncercare.
- Biblioteca privată continuă să funcționeze pentru elevi.
- Testele de încărcare, fallback după ID, izolare clase/lecții locale, Help, export, erori, validare și păstrarea lucrării au trecut.
- Nicio eroare JavaScript în scenariile testate.

class-library.js este identic cu V3.8.2. În graph.js sunt adăugate doar importul, resetarea rolului la conectare și pornirea verificării după autentificare, plus versiunea importului bibliotecii. Funcțiile de autentificare, atașare și predare nu au fost modificate.

Rămâne verificarea în mediul real al școlii.
