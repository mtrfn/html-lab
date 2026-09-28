# Verificare HTML Lab V3.7.1

Test automat în Microsoft Edge headless (Playwright), pe aceeași origine HTTPS simulată local, fără apeluri Microsoft. Au fost executate atât fișierele originale V3.7, cât și versiunea corectată.

## Rezultate

- V3.7: crearea, selectarea din altă lecție și selectarea după reload funcționează. Defectul general raportat nu a fost reprodus.
- V3.7: confirmarea cu tastatura a aceleiași opțiuni deja selectate nu emite change; editorul rămâne nemodificat. Comportamentul a fost reprodus.
- V3.7: Ajutorul deschis rămâne la lecția anterioară după salvarea unei lecții noi; codul din editor pierde spațiile marginale. Ambele probleme reproduse și corectate în V3.7.1.
- V3.7.1: «Deschide lecția» încarcă exact codul salvat al opțiunii curente, inclusiv spațiile marginale.
- Ambele versiuni: selectare, previzualizare, cerință cu etichete afișate ca text, păstrarea numelui lucrării, cele trei indicii și nivelul maxim utilizat — PASS.
- Ambele versiuni: Reset fără modificări nu cere confirmare; anularea păstrează modificările; confirmarea restabilește codul inițial — PASS.
- Ambele versiuni: lecția din localStorage este disponibilă după reîncărcare; toate cele 13 lecții standard se încarcă — PASS.
- V3.7.1: export JSON, ștergere, reimport și deschidere — PASS.
- Nicio eroare JavaScript de pagină în aceste scenarii.

## Verificare manuală pe site-ul actualizat

1. Verifică V3.7.1 în antet, în același browser și la aceeași adresă a site-ului.
2. Alege lecția existentă din «Lecțiile profesorului». Dacă era deja selectată, apasă «Deschide lecția». Atenție: acesta încarcă forma inițială peste codul curent, la fel ca schimbarea lecției.
3. Verifică codul, rezultatul, cerința și toate cele trei trepte de Ajutor.
4. Modifică editorul și verifică Reset: întâi Anulează, apoi confirmă.
5. Reîncarcă pagina și selectează din nou lecția. Datele locale existente folosesc aceeași cheie ca în V3.7.

## Integritate Teams/Graph

Doar app.js, index.html și README.md diferă față de fișierele originale. TESTARE.md este nou. Toate celelalte fișiere sunt identice octet cu octet.

SHA-256 verificat față de original:
- `graph.js`: `bb2d7a2f8c62b778100da1b9bc0559424d72e9a3f5c0af5573bfaa571043533b`
- `teams-init.js`: `2f2f09d2855470a0d82f07389d7de988abfab30dd77a86f7607db8e616adfaa4`
- `config.html`: `c1c79fa2b01cd792ed6c5897e7243d1736206f4f340f54f9e6f446327001b835`

Autentificarea, atașarea și predarea reală în Teams nu au fost testate cu un cont Microsoft. Codul lor și referințele la SDK/Graph nu au fost modificate.
