# Verificare diagnostic V3.8.1

Testele simulate ale bibliotecii au trecut, inclusiv erori 401/403/404, JSON invalid și mesaje cu etapa operației. Mesajele nu conțin tokenul de test sau adresa descărcării. Cauza erorii reale din Teams rămâne neconfirmată până la primirea diagnosticului.

În graph.js s-a schimbat față de V3.8 numai parametrul de versiune al importului. Mai jos este raportul verificărilor de bază V3.8; funcțiile editorului nu au fost modificate în V3.8.1.

# Verificare V3.8.1

Microsoft Edge headless / Playwright. Răspunsurile Teams, MSAL, Microsoft Graph și descărcarea fișierului au fost simulate, fără acces la conturi reale și fără cereri de scriere în Microsoft 365.

## Biblioteca clasei — trecut
- Înainte de conectare: nicio cerere pentru bibliotecă.
- După conectare: verificare de apartenență, fișierul clasei corecte, cod/cerință/cele trei indicii.
- Tokenul apare numai în cererile Graph; descărcarea temporară nu primește Authorization, cookie-uri sau referer.
- Aceleași ID-uri în biblioteca locală și cea centrală rămân independente.
- Actualizarea păstrează lucrarea și cere reselectarea lecției; Help și Reset nu folosesc o lecție implicită greșită.
- Exportă pentru clasă produce lectii.json cu biblioteca locală, nu o copie a bibliotecii centrale.
- Fișier lipsă, acces refuzat, utilizator nemembru, sesiune expirată, JSON/structură invalide, depășirea limitei de dimensiune și eroare de descărcare: mesaje și păstrarea lucrării locale.
- Respingere pentru structură de tip array, identificatori de tip __proto__, format greșit și indicii incorecte.
- Biblioteca se încarcă și dacă citirea temelor eșuează; reconectarea eșuată elimină opțiunile centrale vechi.
- În afara Teams: nu se ghicește o clasă și nu se citește niciun fișier central.
- Două clase folosesc propriile biblioteci, fără amestecarea identificatorilor de grup.
- Verificare vizuală desktop 1280×900 și mobil 390×844, fără depășire orizontală.
- Nicio eroare JavaScript de pagină în scenariile testate.

## Funcțiile existente — trecut
Salvare locală, deschidere explicită, selectare, reîncărcare, cerință, previzualizare, numele lucrării, Help/maxim atins, Reset cu anulare/confirmare, 13 lecții standard, export/ștergere/import, secțiuni pliabile, validare și tastatură.

## Integritate
După eliminarea celor patru puncte de integrare ale noii biblioteci, graph.js este identic textual cu V3.7.2. Nu au fost schimbate SCOPES, autentificarea, atașarea ori predarea. teams-init.js, config.html, privacy.html și terms.html sunt identice octet cu octet.

## Reexecutare pentru dezvoltatori
Testul tests/class-library.cjs folosește pachetul Playwright și Microsoft Edge instalat. Cu Node și Playwright disponibile: node tests/class-library.cjs. Nu contactează Microsoft; cererile sunt interceptate.

## Verificare necesară în școală
Instalarea V3.8, configurarea folderului SharePoint și încărcarea unui lectii.json real; apoi conectare ca profesor, ca elev membru și verificarea refuzului pentru un cont nemembru. Elevul trebuie să poată citi, dar nu modifica fișierul. Verifică o atașare/predare în Teams. Aceste verificări reale nu au fost efectuate aici.
