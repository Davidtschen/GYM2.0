### **Projektdetails**

Für das Projekt werden hauptsächlich Funktionen der Amazon Web Services verwendet:

- AWS Lambda
- API Gateway
- Amazon Eventbridge (CloudWatchEvents)
- Amazon Simple Email
- Amazon DynamoDB
- AWS S3 (Icon-Speicher)
- Cognito
- Amplify
- Cloud Watch

#### **AWS Amplify**

AWS Amplify wird in unserem Projekt zur Bereitstellung und zum Hosting des Frontends verwendet.
Es handelt sich dabei um einen vollständig serverlosen Hosting-Dienst, der speziell für Webanwendungen mit HTML, CSS und JavaScript konzipiert ist.
Durch den Einsatz von AWS Amplify entfällt die Notwendigkeit, eigene Webserver oder Container zu verwalten.

AWS Amplify übernimmt automatisch die Auslieferung der Webanwendung über ein globales Content Delivery Network (CDN),
stellt eine HTTPS-gesicherte Verbindung bereit und sorgt für eine performante und zuverlässige Erreichbarkeit der Anwendung.

Zusätzlich kann AWS Amplify direkt mit einem GitHub-Repository verknüpft werden.
Dadurch werden Änderungen am Frontend-Code bei jedem Commit automatisch erkannt, gebaut und deployed.
Diese kontinuierliche Integration ermöglicht eine schnelle und konsistente Aktualisierung der Webanwendung, ohne manuelle Deployments durchführen zu müssen.

In Bezug auf unser Projekt wird AWS Amplify für die folgenden Frontend-Komponenten eingesetzt:

- Start- und Login-Seiten für Mitglieder

- Registrierungsseiten mit projektspezifischen Eingabefeldern

- Weboberfläche für den Snack- und Getränkeautomaten

Das Frontend wird als statische Anwendung betrieben und kommuniziert ausschließlich über definierte API-Endpunkte mit dem Backend.
Zusätzlich dient AWS Amplify als zentrale Schnittstelle zwischen dem Frontend und AWS Cognito.
Über diese Integration werden Authentifizierungsprozesse wie Registrierung, Anmeldung und Abmeldung aus dem Frontend heraus initiiert und verarbeitet.

Sicherheitsaspekte:
AWS Amplify stellt automatisch eine HTTPS-Verschlüsselung bereit, sodass alle Datenübertragungen zwischen Browser, Cognito und Anwendung geschützt sind.
Da es sich um ein rein statisches Frontend handelt, werden in Amplify selbst keine sensiblen Daten gespeichert.
Die Authentifizierung und Autorisierung erfolgen über AWS Cognito und das Backend über AWS Lambda und API Gateway.

Durch die Nutzung von AWS Amplify realisiert eine skalierbare, kosteneffiziente und wartungsarme Frontend-Infrastruktur.

#### **AWS Cognito**

AWS Cognito wird in unserem Projekt zur Authentifizierung und Verwaltung der Mitgliederkonten eingesetzt.
Der Dienst übernimmt die sichere Registrierung, Anmeldung und Verwaltung von Benutzern, ohne dass sensible Zugangsdaten wie Passwörter im eigenen Backend gespeichert oder verarbeitet werden müssen.
Dadurch wird die Sicherheit erhöht und der Implementierungsaufwand reduziert.

Die Registrierung der Mitglieder erfolgt über ein eigenes Frontend-Formular, da im Projekt zusätzliche, projektspezifische Informationen erfasst werden müssen,
wie beispielsweise Adressdaten. Diese Daten werden an AWS Cognito übermittelt und dort sicher gespeichert.
Der Login hingegen erfolgt komplett über die von AWS Cognito bereitgestellte HostetUI.

Beim Login und bei der Registrierung triggert AWS Cognito automatisch vordefinierte Lambda-Funktionen (Cognito Triggers).
Diese Lambda-Funktionen werden ereignisbasiert ausgeführt, beispielsweise:

nach erfolgreicher Registrierung eines neuen Mitglieds,

während oder nach einem Login-Vorgang,

zur Protokollierung von Anmeldeereignissen,

oder zur Initialisierung von Benutzerdaten im Backend.

In unserem Projekt werden diese Trigger genutzt, um zusätzliche Geschäftslogik auszuführen, wie das Anlegen eines Mitgliedseintrags in der Datenbank und
das Erfassen von Login-Aktivitäten.

Nach erfolgreicher Authentifizierung stellt AWS Cognito JSON Web Tokens (JWTs) aus,
die vom Frontend zur Identifikation des Benutzers verwendet und bei geschützten Backend-Endpunkten an API Gateway und AWS Lambda weitergegeben werden können.

Durch den Einsatz von AWS Cognito wird eine skalierbare, sichere und wartungsarme Benutzerverwaltung realisiert, die nahtlos mit AWS Amplify, AWS Lambda und API Gateway zusammenarbeitet.

#### **AWS Lambda**
AWS Lambda führt den Code automatisch als Reaktion auf Ereignisse aus und skaliert dynamisch. AWS Lambda ist zudem ein serverloser Computing Dienst, wodurch man deutlich weniger Code schreiben muss im Vergleich zu einem serverabhängigen Dienst.  
Darüberhinaus zahlen Kunden nur für die tatsächliche Rechenzeit, was es kosteneffizient macht.

In Bezug zu unserem Projekt verwenden wir AWS Lambda für die folgenden Lambda-Funktionen: BestellService, BillService, CheckUserpool, CheckProducts, DeletionService, LoginTracking, LoggingService, NotifyService, PushUser

Allgemeine Syntax einer Lambda-Funktion: export const handler = async (event) => { ...auszuführender Code...}

Die einzelnen Lambda-Funktionen sind im Code ausführlich dokumentiert.

Sicherheitskonzept und Berechtigungen (IAM): Um die Sicherheit des GYM2.0 Backends zu maximieren, folgen alle Lambda-Funktionen dem Prinzip der geringsten Rechte (Least Privilege). Anstatt die standardmäßige Richtlinie AmazonDynamoDBFullAccess zu verwenden, besitzt jede Funktion eine eigene, extra geschriebene IAM-Policy. Dies stellt sicher, dass eine Funktion nur die Aktionen ausführen darf, die sie für ihre spezifische Aufgabe benötigt. 
Hierzu erstellt man für jede Lambda-Funktion eine neue Richtlinie, die nur für die jeweilige Lambda-Funktion zugeschnitten sind. Dies macht man, indem man bei der Rolle der Lambda-Funktion auf den Reiter Richtlinien geht und dann dort die Richtlinie als JSON-Format erstellt. Abschließend fügt man bei den Berechtigungsrichtlinien der Lambda-Funktion diese neu erstellte Richtlinie hinzu. Nun darf die Lambda-Funktion nur das machen, was man in der Richtlinie angegeben hat.

Aufbau einer IAM-Richtlinie: Eine Richtlinie definiert in AWS präzise Zugriffsrechte. 
- Version: Legt den Sprachstandard fest (immer "2012-10-17").
- Statement: Der Container für die eigentlichen Regeln (kann mehrere enthalten).
- Sid (Statement ID): Ein frei wählbarer Name zur Beschreibung der Regel (z. B. "ErlaubeCheckInUpdate").
- Effect: Bestimmt, ob der Zugriff erlaubt (Allow) oder verboten (Deny) wird.
- Action: Die spezifische Aktion, die erlaubt wird (hier: nur das Aktualisieren eines Eintrags in DynamoDB).
- Resource: Der eindeutige Pfad (ARN) zur Tabelle, auf die sich die Erlaubnis bezieht.

Bsp.-Richtlinie:
Richtlinie "DynamoDB-Update-LastCheckIn" von der Lambda-Funktion "LoginTracking":  
{  
    "Version": "2012-10-17",  
    "Statement": [  
        {  
            "Sid": "AllowUpdateLastCheckIn",  
            "Effect": "Allow",  
            "Action": [  
                "dynamodb:UpdateItem"  
            ],  
            "Resource": "arn:aws:dynamodb:eu-north-1:380652644070:table/Members"  
        }  
    ]  
}  

Erstellte Richtlinien:


| Lambda-Funktion | Dienst       | Erlaubte Aktionen (IAM)                     | Ressource (ARN)                                                                    |
|:----------------|:-------------|:--------------------------------------------|:-----------------------------------------------------------------------------------|
| CheckUserpool   | DynamoDB     | dynamodb:PutItem                            | arn:aws:dynamodb:REGION:ACCOUNT_ID:table/Members                                   |
| LoginTracking   | DynamoDB     | dynamodb:UpdateItem                         | arn:aws:dynamodb:REGION:ACCOUNT_ID:table/Members                                   |
| PushUser        | DynamoDB     | dynamodb:UpdateItem                         | arn:aws:dynamodb:REGION:ACCOUNT_ID:table/Members                                   |
| DeletionService | DynamoDB     | dynamodb:DeleteItem                         | arn:aws:dynamodb:REGION:ACCOUNT_ID:table/Members                                   |
| BestellService  | DynamoDB     | dynamodb:Scan, dynamodb:UpdateItem          | arn:aws:dynamodb:REGION:ACCOUNT_ID:table/Inventory                                 |
| BestellService  | SES          | ses:SendEmail                               | arn:aws:ses:REGION:ACCOUNT_ID:identity/noReplyGym2dot0@gmail.com                   |
| BillService     | DynamoDB, S3 | dynamodb:PutItem, dynamodb:Scan, S3:PutItem | arn:aws:dynamodb:REGION:ACCOUNT_ID:table/Orders; <br/>amzn-my-export-bucket-gym2-0 |
| NotifyService   | DynamoDB     | dynamodb:Scan                               | arn:aws:dynamodb:REGION:ACCOUNT_ID:table/Members                                   |
| NotifyService   | SES          | ses:SendEmail                               | arn:aws:ses:REGION:ACCOUNT_ID:identity/noReplyGym2dot0@gmail.com                   |
| LoggingService  | DynamoDB, S3 | dynamodb:Scan, S3:Scan                      | arn:aws:dynamodb:REGION:ACCOUNT_ID:table/Inventory |
| LoggingService  | SES | ses:SendEmail                      | arn:aws:ses:REGION:ACCOUNT_ID:identity/noReplyGym2dot0@gmail.com |
| CheckProducts  | DynamoDB | dynamodb:Scan, S3:Scan                     | arn:aws:dynamodb:REGION:ACCOUNT_ID:table/Inventory |

#### **API Gateway**
Durch das API Gateway kann man HTTP-Anfragen des Frontends verarbeiten und bestimmten Lambda-Funktionen zuweisen. Diese Lambda-Funktionen werden durch zu ihnen zugewiesenen Routen aufgerufen.  
Zu allererst erstellt man eine API und gibt ihr einen bestimmten Namen (bei uns: GYM2.0). Dann erstellt man in dieser API Routen, die durch das Frontend aufgerufen werden können. Hierzu geht man in den Reiter Routes und klickt auf Erstellen. Schließlich wählt man die Methode aus (z.B. POST, DELETE, etc.) und gibt den Pfad an (z.B. /user/check-userpool).

In Bezug zu unserem Projekt verwenden wir das API Gateway für die folgenden Lambda-Funktionen: BillService, CheckUserpool, DeletionService, LoginTracking, PushUser

| Methode | Pfadname | Beschreibung | CORS aktiv |
|--------|-----|--------------|--------------|
| GET | /products | Ruft die Liste aller verfügbaren Produkte ab | Ja |
| POST | /buy | Tätigt den Kauf eines Produktes | Ja |
| POST | /user/push-user | Ändert bestimmte Daten des Benutzers | Ja |
| DELETE | /user | Löscht den Benutzer aus der Datenbank | Ja | 

CORS-Konfiguration (Cross-Origin Resource Sharing)

Da das Frontend und das Backend auf unterschiedlichen Domains liegen, ist eine CORS-Konfiguration notwendig, damit der Browser die Anfragen nicht blockiert. Wir haben folgende Sicherheits- und Zugriffseinstellungen im API Gateway vorgenommen:
- Zugriffskontrolle-Ursprungsort (Allow-Origin): Wir haben den Zugriff explizit auf unsere Frontend-URL eingeschränkt: https://amplifyv2.dcg4xn3nfttao.amplifyapp.com. Dies stellt sicher, dass nur unsere offizielle App Daten anfragen darf.
- Zugriffskontrolle-Header (Allow-Headers): Hier wurde content-type hinterlegt, um den Austausch von JSON-Daten zu ermöglichen.
- Zugriffskontrolle-Methoden (Allow-Methods): Wir haben die Methoden GET und POST freigegeben.

#### **Amazon Eventbridge (CloudWatchEvents)**
Amazon Eventbridge automatisiert einige Funktionen des Softwareprojekts, in Hinsicht auf einige Lambda-Funktionen. Durch Eventbridge wird ein sogenannter Scheduler eingestellt, der die Lambda-Funktionen in einem bestimmten Zeitintervall (z.B. 12 hours) regelmäßig aufruft.  
Um bestimmte Lambda-Funktionen automatisiert aufrufen zu können, muss man bei der Lambda-Funktion einen Eventbridge-Auslöser hinzufügen. Dort erstellt man dann eine neue Regel, gibt der Regel einen Namen und eine Beschreibung, sowie das Zeitintervall (Syntax: rate(xx hours) an.

In Bezug zu unserem Projekt verwenden wir Eventbridge als Trigger für die folgenden Lambda-Funktionen: BestellService, LoggingService, NotifyService, CheckProducts.

Der Bestell-Service wird im Hintergrund alle 12 Stunden aufgerufen, um zu prüfen ob bestimmte Produkte des Automaten nachbestellt werden müssen und wenn es welche gibt, dann werden automatisiert E-Mails an die Produktverwaltung des Gyms gesendet.  
Der Logging-Service wird im Hintergrund alle 24 Stunden aufgerufen und überprüft das Datum und ab einem bestimmten Richtwert (jeden 1. des Monats)
werden die entsprechenden Einträge der Log-Tabelle als CSV exportiert und in einem Bucket gespeichert.  
Der Notify-Service wird im Hintergrund alle 24 Stunden aufgerufen und überprüft ob Mitglieder innerhalb eines Monats mindestens 1-mal das Studio
besucht haben. Sollte das nicht der Fall sein, wird eine Erinnerungs-Mail geschickt.  
Die CheckProducts Funktion wird im Hintergrund alle 12 Stunden aufgerufen, um zu prüfen wie viele verschiedene Produkte es in der Datenbank gibt. 

#### **Amazon Simple Email**
Durch den Amazon Simple Email Service wird von einer angegeben Quelle eine E-Mail an einen bestimmten Empfänger gesendet.  
Man hinterlegt beim Amazon Simple Email Service seine E-Mail und bestätigt anschließend diese. Daraufhin kann man diese E-Mail in Lambda-Funktionen
verwenden, indem man den SES Client importiert. Dabei kann der Inhalt der E-Mail und der Empfänger im Code festgelegt werden.

In Bezug zu unserem Projekt verwenden wir den Amazon Simple Email Service in folgenden Lambda-Funktionen: BestellService, NotifyService, LoggingService.

#### **Amazon DynamoDB**
AWS DynamoDB ist eine vollständig verwaltete NoSQL-Datenbank (Key-Value / Dokumentenmodell), die sehr niedrige Latenzen bietet und automatisch skaliert. Da DynamoDB serverlos ist, entfällt die Administration von Datenbankservern (Provisionierung, Patches, Betriebssystempflege). Abgerechnet wird typischerweise nach Nutzung (z. B. Read/Write-Requests, Storage, Streams), was es besonders für Event-getriebene Cloud-Native Backends attraktiv macht.

Bezug zu unserem Projekt
In unserem Projekt wird DynamoDB zur Speicherung zentraler Backend-Daten genutzt, z. B.:

- Members: Nutzer-/Mitgliedsdaten (z. B. Stammdaten, Status, letzter Login/Check-in, Icon-Referenz)
- Inventory: Produkt-/Inventardaten für Bestellungen
- Order: getätigte Bestellungen
    (Hinweis zur Icon-Speicherung: Statt Icons als Binärdaten direkt in DynamoDB abzulegen, speichern wir in DynamoDB nur Referenzen (z. B. iconKey oder iconUrl). Die eigentlichen Dateien liegen in S3.)


**Datenmodell (Beispiel)**

DynamoDB arbeitet mit Partition Key (und optional Sort Key):

- Members
    - Partition Key: memberId (String)
    - Attribute: email, lastCheckIn, icon (S3-Key), name, …

- Inventory
    - Partition Key: productId (String)
    - Attribute: stock, price, name, …

#### **AWS S3 (Icon-Speicher)**

Amazon S3 (Simple Storage Service) ist ein objektbasierter Speicherdienst zur hochverfügbaren Ablage von Dateien (Objects) in Buckets. S3 eignet sich ideal für statische Assets wie Bilder/Icons, da es skalierbar, kosteneffizient und sehr einfach mit IAM, Bucket Policies und optional CloudFront absicherbar ist.

Bezug zu unserem Projekt

In unserem Projekt wird S3 genutzt, um Icons (z. B. Profilbilder/Badges/Produkticons) zu speichern, die im Frontend angezeigt werden.
In DynamoDB wird nicht das Bild selbst gespeichert, sondern z. B.:

- iconKey: icons/product/.png
- oder iconUrl: (wenn ihr Public/CloudFront nutzt)

Datenfluss (typisch)
 1. Icon wird hochgeladen (z. B. über eine Lambda-Funktion oder Presigned URL).
 2. S3 speichert das Objekt im Bucket (z. B. gym2-icons).
 3. DynamoDB speichert den Key oder die URL im entsprechenden Member/Produkt-Eintrag.
 4. Frontend lädt das Icon über S3 (oder besser über CloudFront).

Eine weitere Verwendung findet ein S3 Bucket in der Speicherung eines Monatsberichts. Dabei werden alle getätigten Einkäufe aufgelistet als CSV gespeichert.

Datenfluss
1. Datenbank Order wird gescannt
2. Die Orders werden in eine CSV exportiert und im Bucket gespeichert
3. CSV wird per Email versendet an den Verwalter.

#### **Cloud Watch**

Der Amazon Cloud Watch Service wird in jeder Lambda Funktion genutzt, um einfache Logging-Statistiken zu erhalten. 
Dies ist besonders wichtig, wenn es mal zu Fehlern in der Anwendung kommt. Außerdem ist diese Funktionalität besonders wichtig, um Statistiken der Anwendung zu erhalten (z.B. wie oft welche Lambda Funktion aufgerufen wird, etc.)
