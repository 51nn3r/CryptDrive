# Info o projekte:

- Meno a priezvisko: Aleksandr Bukhtoiarov
- Názov projektu: CryptDrive
- Link na repozitár:                  https://github.com/51nn3r/CryptDrive
- Link na verejnú inštanciu projektu: https://v2202504266162330836.goodsrv.de/login

# Info o reportovanej verzii:

- Tag: beta1

# Info k testovaniu:

- na testovanie môžete pokojne vytvoriť nového(-ých) používateľa(-ľov).
- po prvom prihlásení je potrebné vygenerovať pár RSA kľúčov – bez toho nebude možné nahrávať súbory ani ich zdieľať.
- po kliknutí na "Generate new RSA key pair" sa vygeneruje pár RSA kľúčov a zobrazí sa privátny. Tento privátny kľúč je
  potrebné zadávať pri každom prihlásení do systému.
- používatelia, ktorí majú RSA kľúč, môžu nahrávať súbory na server a zdieľať ich s inými používateľmi.
- nahraté súbory môže odstrániť iba ich vlastník – ten, kto ich nahral.
- zdieľať súbor môže každý, kto k nemu má prístup (nielen vlastník).

# Postup, ako rozbehať vývojové prostredie

- používa sa docker-compose.
- pred spustením dockeru je však potrebné zostaviť frontend – treba prejsť do adresára frontend a spustiť npm run build.
- prípadne môže byť jednoduchšie spustiť aplikáciu lokálne pomocou manage.py – je potrebný Python 3.12 a všetky knižnice
  zo requirements.txt.

# Stav implementácie:

- momentálne chýba vlastná administračná časť webu – bude doplnená v najbližšom čase.
- nie je implementované rozdelenie používateľov do skupín.
- chýba funkcionalita na úpravu súborov – zatiaľ je možné ich len nahrávať a mazať.

# Časový plán:

- 9 týždeň (do 27.04): dokončím prácu na rozdelení používateľov do skupín, pokúsim sa dokončiť administráciu.
- 10 týždeň (do 04.05): implementácia administrácie a opravy podľa pripomienok z review, ak sa nájdu chyby.

# Problémy:

- spustenie v dockeri – nepodarilo sa nastaviť automatické zostavenie frontendu, preto ho treba pred spustením dockeru
  zostaviť manuálne.
- obmedzenie veľkosti nahrávaného súboru na 10 MB.
