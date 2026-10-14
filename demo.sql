CREATE TABLE clase(id INTEGER PRIMARY KEY, denumire TEXT NOT NULL UNIQUE);
CREATE TABLE elevi(id INTEGER PRIMARY KEY, nume TEXT NOT NULL, prenume TEXT NOT NULL, clasa_id INTEGER NOT NULL REFERENCES clase(id));
CREATE TABLE discipline(id INTEGER PRIMARY KEY, denumire TEXT NOT NULL);
CREATE TABLE note(id INTEGER PRIMARY KEY, elev_id INTEGER NOT NULL REFERENCES elevi(id), disciplina_id INTEGER NOT NULL REFERENCES discipline(id), nota INTEGER NOT NULL CHECK(nota BETWEEN 1 AND 10), data_notarii TEXT NOT NULL);
INSERT INTO clase VALUES(1,'XI A'),(2,'XI B');
INSERT INTO elevi VALUES(1,'Popescu','Andrei',1),(2,'Ionescu','Maria',1),(3,'Georgescu','Elena',2),(4,'Dumitru','Vlad',2);
INSERT INTO discipline VALUES(1,'Informatică'),(2,'Matematică');
INSERT INTO note VALUES(1,1,1,9,'2026-10-01'),(2,1,1,8,'2026-10-08'),(3,2,1,10,'2026-10-01'),(4,3,2,7,'2026-10-02'),(5,4,1,8,'2026-10-03');
