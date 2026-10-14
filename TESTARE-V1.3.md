# Verificări DB-Lab V1.3.0 — 13 octombrie 2026

## Verificat automat

Cele patru suite `test-worker.cjs`, `test-v11.cjs`, `test-v12.cjs`, `test-v13.cjs` au trecut. Se rulează cu Node.js din folderul aplicației.

- SQLite, tranzacții, rollback, export/import, compatibilitate format V1.
- Formulare, NULL, valori implicite, chei externe simple/compuse, liste de peste 200 de referințe, previzualizare SQL.
- Cele opt lecții, verificare izolată a bazei, validare biblioteci și metadate, text neinterpretat ca HTML.
- Organizație, cont și context Teams concordante; separarea cheilor de stocare; confirmare profesor/membru; paginare și respingere răspunsuri nevalide.
- Token Graph limitat la domeniul Graph, descărcare SharePoint fără token/cookie-uri, fallback prin ID de fișier, limită 2 MB.
- Identificatori și adresă HTTPS în generator, configurația manifestului, structură ZIP.

## Verificat în browser local

Scenariile Microsoft au folosit conturi și răspunsuri simulate, într-un cadru de test separat care NU este inclus în pachetul aplicației.

- Înainte de conectare, proiectele și atelierul nu sunt vizibile în modul Teams.
- Profesor: cont afișat, opt lecții de clasă încărcate, atelier vizibil și câmpuri active.
- Elev: atelier și comenzile de autor ascunse; lecția de clasă poate fi deschisă și rezolvată.
- Actualizarea bibliotecii păstrează textul SQL și contextul lecției începute.
- Sesiune închisă: conținutul proiectului este ascuns și golit din interfață.
- Revenirea la contul profesorului restaurează SQL-ul propriu, distinct de proiectul elevului.
- Același cont fără rol de profesor nu mai vede atelierul.
- HTTP 403 la verificarea Microsoft: acces blocat. HTTP 404 la bibliotecă: mesaj explicit și proiectul salvat păstrat.
- Configurație Microsoft goală: conectare dezactivată și mesaj pentru administrator.
- Mod local: funcționează fără configurare Microsoft, cu biblioteca inclusă și atelier local.
- Generator: date fictive validate, arhiva descărcată și verificată pentru integritate CRC, exact trei fișiere la rădăcină și adresa corectă a filei.
- Interfața profesorului inspectată vizual; fără erori de script în scenariul de clasă verificat.

## De verificat în organizația școlii

Nu s-a creat sau modificat nicio înregistrare Entra și nu s-a acordat consimțământ. Pachetul livrat are Client ID și Tenant ID necompletate.

După configurare: autentificare NAA în clientul Teams folosit de școală, validarea pachetului la instalare, politici de acces, apartenență reală la o clasă educațională, bibliotecă SharePoint și drepturi profesor/elev. Urmează scenariile din CONFIGURARE-TEAMS.html. Nu este confirmată încă funcționarea în tenantul real.

Predarea temelor, notarea și salvarea proiectelor în cloud nu sunt implementate în V1.3.
