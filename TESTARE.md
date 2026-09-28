# Verificare V3.8.2

Testat în Edge headless cu răspunsuri Microsoft simulate.
- HTTP 200 fără downloadUrl la căutarea după cale: recitire după driveId/itemId și încărcare reușită.
- Adresa lipsește și după recitire: diagnostic, fără încărcare.
- Recitirea întoarce 403: diagnostic de acces, fără ocolirea permisiunilor.
- Răspuns inițial cu adresă: încărcare directă.
- Verificările bibliotecii existente au trecut: apartenență, separarea claselor și a lecțiilor locale, conservarea lucrării, Help, export, erori 401/403/404, JSON invalid, structură invalidă, limită de dimensiune și lipsa contextului Teams.
- Tokenul nu este trimis către descărcarea temporară.
- Nu s-au schimbat cererile de autentificare, atașare sau predare.
- Testarea pe conturile reale ale școlii rămâne de făcut.
