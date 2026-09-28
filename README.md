# HTML Lab V3.7.2

Aplicație statică HTML/CSS/JavaScript, pregătită pentru GitHub Pages.

## Instalare

Copiază conținutul acestui director peste fișierele repository-ului existent, păstrând aceeași adresă de publicare. Nu este necesară compilarea. După publicare, reîncarcă pagina și verifică V3.7.2 în antet. Parametrul app.js?v=372 evită reutilizarea vechiului app.js din cache.

Lecțiile existente sunt păstrate: cheia localStorage rămâne `htmlLabTeacherLessonsV37`. Folosește același browser, profil și aceeași origine; lecțiile locale nu sunt transferate automat pe alt dispozitiv. Nu șterge datele site-ului.

## Editor profesor în V3.7.2

Secțiuni pliabile independente: Date lecție (deschisă inițial), Cod inițial și Help. Se pot deschide simultan. Plierea păstrează valorile introduse. Dacă lipsește titlul sau codul la salvare, secțiunea necesară se deschide automat și câmpul primește focus. Lecțiile și formatul lor rămân compatibile cu V3.7/V3.7.1.

## Corecție V3.7.1

Selectarea unei alte lecții funcționează în arhiva V3.7 furnizată, inclusiv după reîncărcare. Nu s-a reprodus o eroare generală de citire din localStorage.

Salvarea selectează deja lecția în listă. Confirmarea aceleiași opțiuni nu emite un nou eveniment change în browser, ceea ce explică situația în care reselectarea nu produce nicio acțiune. Butonul «Deschide lecția» permite acum încărcarea explicită a opțiunii curente. Ca la schimbarea lecției în V3.7, deschiderea încarcă codul inițial în editor.

Salvarea folosea separat o variantă incompletă de încărcare: un Ajutor deja deschis rămânea la lecția anterioară, iar spațiile de la marginile codului erau eliminate în editor, dar păstrate în lecția salvată. Salvarea și selectarea folosesc acum aceeași funcție, păstrând exact codul salvat și actualizând cerința, previzualizarea și Ajutorul vizibil.

Numele lucrării rămâne cel introdus de utilizator, conform V3.7: formatul lecțiilor nu conține un nume de fișier. Nivelul maxim de Ajutor utilizat și protecția Reset sunt păstrate.

`graph.js`, `teams-init.js`, `config.html`, celelalte fișiere de integrare sunt nemodificate. Autentificarea și predarea în Teams necesită verificare cu un cont real; testele locale nu fac apeluri Microsoft.

Vezi TESTARE.md pentru rezultate și verificarea manuală.
