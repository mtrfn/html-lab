# HTML Lab V3.8.3 — Editor doar pentru profesorul clasei

Instalare: înlocuiește fișierele din repository, inclusiv noul teacher-access.js. Folderul tests este opțional. Verifică V3.8.3 după publicare.

Butonul Editor profesor este ascuns implicit, înainte de conectare, pentru elevi și în afara contextului unei clase Teams. După autentificare, Microsoft Graph education/me/taughtClasses confirmă dacă utilizatorul predă la clasa curentă. Sunt parcurse și paginile următoare. Nu se deduce rolul din numele contului sau din rolul global.

Dacă verificarea eșuează, editorul rămâne ascuns și apare mesaj de reîncercare prin Conectare Microsoft. Reconectarea închide editorul și revocă accesul până la noua verificare. Acțiunile editorului sunt dezactivate pentru utilizatorii neconfirmați.

Lecțiile locale nu se șterg. Profesorul le regăsește după autentificarea în fila clasei. Biblioteca centrală și corecția de descărcare V3.8.2 sunt păstrate. Nu trebuie modificat lectii.json sau drepturile din SharePoint.

Aceasta este o regulă de interfață pentru aplicația statică; drepturile reale de citire/scriere a bibliotecii centrale rămân aplicate de SharePoint. Nu sunt adăugate permisiuni Graph. Fluxurile de autentificare, teme, atașare și predare sunt păstrate.

Sursă API: https://learn.microsoft.com/en-us/graph/api/educationuser-list-taughtclasses?view=graph-rest-1.0

Verifică după instalare cu profesor și elev. Testele locale folosesc răspunsuri simulate.
