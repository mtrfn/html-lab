# HTML Lab V3.8 — Biblioteca privată a clasei

Aplicație statică, pregătită pentru același repository GitHub Pages. Copiază toate fișierele din arhivă peste versiunea existentă, la aceeași adresă. Nu există pas de compilare.

## Distribuire
Deschide DISTRIBUIRE.html pentru configurarea folderului privat SharePoint, export și verificarea cu un elev. Biblioteca este citită din rădăcina bibliotecii Documente a grupului clasei, calea HTML-Lab/lectii.json. Fișierul cu lecții NU se publică în repository și NU este inclus în această arhivă.

După Conectare Microsoft, aplicația citește biblioteca clasei detectate în Teams; există și butonul Actualizează lecțiile. În această versiune, publicarea se face prin export și înlocuirea unui singur fișier în SharePoint, nu prin upload automat din editor. Nu este necesară configurarea calculatoarelor elevilor.

## Compatibilitate
Cheia lecțiilor locale rămâne htmlLabTeacherLessonsV37. Importul/exportul vechi, lecțiile standard, Help, Reset, editorul pliabil și fluxul existent de predare rămân disponibile. Lecțiile clasei au identificatori separați și nu suprascriu lecțiile locale cu același ID. Actualizarea bibliotecii păstrează lucrarea din editor.

## Integrare și acces
class-library.js este nou. graph.js are doar importul componentei, resetarea bibliotecii la reconectare, pornirea încărcării după autentificare și legarea butonului de actualizare. Codul de autentificare, lista SCOPES, atașarea și predarea nu au fost schimbate. Sunt reutilizate permisiunile delegate deja cerute de V3.7: EduRoster.ReadBasic și Files.ReadWrite.All, plus autentificarea existentă.

Apartenența la clasă este verificată prin endpointul education/classes/{id}/teachers, care impune apartenența pentru acces delegat. Drepturile fișierului sunt aplicate de SharePoint; folderul trebuie configurat pentru citire de către elevi și editare de către profesori. Nu se creează linkuri publice și nu se modifică permisiuni prin aplicație.

Datele centrale sunt validate înainte de afișare (max. 200 lecții / 2 MB). Tokenul este trimis numai la graph.microsoft.com. Descărcarea folosește URL-ul temporar oferit de Graph, fără Authorization, cookie-uri sau referer. Nu se salvează biblioteca centrală în localStorage. Un acces refuzat sau o încărcare invalidă elimină opțiunile centrale din sesiunea curentă fără a șterge lucrarea ori lecțiile locale.

## Surse Microsoft
- [Verificarea apartenenței prin lista profesorilor](https://learn.microsoft.com/en-us/graph/api/educationclass-list-teachers?view=graph-rest-1.0)
- [Citirea fișierelor din JavaScript cu URL temporar](https://learn.microsoft.com/en-us/graph/api/driveitem-get-content?view=graph-rest-1.0)
- [Foldere accesibile elevilor doar pentru citire](https://support.microsoft.com/en-us/teams/education/use-folders-to-create-read-only-files-for-students-or-other-team-members)

Vezi TESTARE.md. Testele Graph sunt simulate; este necesară verificarea reală cu profesor și elev după instalare.
