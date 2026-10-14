# Verificări DB-Lab V1.2.0

## Teste automate cu motorul SQLite inclus — trecute

- Regresiile V1.0: catalog, SQL/structură/date, FK, revenire după script cu eroare, parametri, export/import și redenumire.
- Regresiile V1.1: FK compuse și implicite, 251 de referințe, insert/update cu schimbare de PK, NULL/text gol/default, coloane generate și citare SQL.
- Cele opt lecții: SQL de inițializare, SQL de pornire și exemplele din treapta 3 executate în motorul real.
- Verificarea lecției într-o bază temporară lasă proiectul curent intact, inclusiv după eroare și referință invalidă.
- Biblioteci: validare de format/versiune, id-uri duplicate sau rezervate, număr/limite de lecții, lungime de câmp, trei indicii și îmbinare după id.
- Texte cu markup păstrate ca date; interfața folosește textContent.
- Proiecte fără metadate de lecție (format V1.0/V1.1) și export/import al contextului V1.2.

Comenzi din folderul aplicației: `node test-worker.cjs`, `node test-v11.cjs`, `node test-v12.cjs`.

## Verificat prin interfața reală în browser — trecut

1. Crearea unui proiect liber cu tabelul carti și o carte de control.
2. Deschiderea lecției Primul SELECT, rularea unei rezolvări și parcurgerea celor trei trepte de ajutor.
3. Revenirea la proiectul liber: cartea inițială și numele proiectului sunt păstrate.
4. Reluarea lecției și reîncărcarea paginii: SQL-ul și nivelul de ajutor consultat sunt restaurate.
5. Copierea unei lecții în atelier; completarea enunțului, bazei, codului și indiciilor.
6. Verificarea bazei inițiale fără modificarea proiectului activ.
7. Salvarea cu SQL invalid este respinsă; datele din atelier rămân pentru corectare.
8. Salvarea lecției proprii, reîncărcarea paginii și deschiderea ei din bibliotecă.
9. Adăugarea unei cărți în lecție prin formularul V1.1 și previzualizarea SQL.
10. Exportul bibliotecii locale, reimportul aceluiași fișier și confirmarea înlocuirii unei definiții. Cele două cărți din lucrarea curentă rămân intacte.
11. Anularea resetării păstrează cele două cărți; confirmarea resetării readuce numai baza inițială a lecției.
12. Verificarea unei interogări recursive fără sfârșit: oprire automată la 15 secunde, interfață deblocată și proiectul liber restaurat. SELECT confirmă păstrarea cărții de control.
13. Bibliotecă și atelier la lățime de 390 px: fără derulare orizontală a paginii. Verificare vizuală și pe desktop.
14. În scenariile inspectate nu au fost raportate erori JavaScript în consola browserului.

## Limite ale verificării

Testele au fost făcute local prin HTTP. Publicarea GitHub Pages și comportamentul în conturile reale Microsoft 365 nu au fost testate în această sesiune. Versiunea V1.2 nu include încă autentificare Microsoft, distribuire automată SharePoint, sincronizare online, predare sau notare. Datele folosite pentru verificare nu sunt incluse în aplicația livrată; lecțiile și exemplul distribuit conțin doar date fictive.
