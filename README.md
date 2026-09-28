# HTML Lab V3.8.2

Corecție pentru cazul în care Microsoft returnează HTTP 200 și metadatele fișierului, dar adresa temporară lipsește sau este invalidă.

Aplicația cere acum metadatele complete (fără filtrul select). Dacă adresa nu este validă, recitește același fișier după ID în drive-ul indicat de Microsoft sau, dacă driveId lipsește, prin grupul clasei. Verifică identitatea fișierului și limitele înainte de descărcare. Nu construiește linkuri publice și nu trimite tokenul către URL-ul temporar.

Înlocuiește fișierele din repository, fără folderul tests dacă nu ai nevoie de teste. Redeschide fila, verifică V3.8.2 și apasă Conectare Microsoft. Nu este necesară schimbarea fișierului lectii.json ori a permisiunilor.

Cazul a fost reprodus prin răspunsuri simulate. Cauza pentru care tenantul omite adresa nu este confirmată și reușita reală necesită verificare în Teams. Dacă adresa lipsește în continuare, se păstrează mesajul precis de diagnostic.

Autentificarea, permisiunile, atașarea și predarea sunt neschimbate; graph.js schimbă numai parametrul versiunii importate.

Referințe:
- https://learn.microsoft.com/en-us/graph/api/driveitem-get?view=graph-rest-1.0
- https://learn.microsoft.com/en-us/graph/api/driveitem-get-content?view=graph-rest-1.0
