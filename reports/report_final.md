# Info o projekte: 
- Meno a priezvisko: Aleksandr Bukhtoiarov
- Názov projektu: CryptDrive
- Link na repozitár: https://github.com/51nn3r/CryptDrive

# Info o reportovanej verzii:
- Tag: final

# Info k testovaniu:     
- registracia a prihlasovanie su standardne, takze nie je potrebny specialny navod
- nahravanie suborov je mozne az po vygenerovani alebo nacitani privatneho kluca
- zdielanie suborov:
  - pre zdielanie suboru s inym pouzivatelom je potrebne, aby mal vygenerovany privatny kluc
  - postup zdielania suborov:
    1. prejst do nastaveni
    2. vytvorit skupinu
    3. pridat potrebne subory do skupiny
    4. poskytnut pristup k skupine vybranym pouzivatelom
  - pristupy k suborom je mozne dynamicky spravovat (menit clenov skupiny a subory dostupne skupine)
  - sifrovanie suborov prebieha automaticky lokalne, preto pri vacsom pocte suborov moze poskytovanie pristupu chvilu trvat. Sifruju sa iba symetricke kluce, velkost suboru teda neovplyvnuje cas potrebny na poskytnutie pristupu
  - v administracnom rozhrani je mozne prehliadat databazu a upravovat zaznamy. Rozhranie by malo byt intuitivne zrozumitelne.

# Postup, ako rozbehať vývojové prostredie
1. vytvorit adresar media/encrypted_uploads/ v adresari, kde sa nachadza manage.py
2. prejst do adresara frontend a spustit prikaz npm run build
3. potom spustit python manage.py collectstatic
4. nasledne je mozne vsetko jednoducho spustit prikazom docker-compose up --build

# Stav implementácie:
- projekt mozno povazovat za funkcny
- bohuzial, nebola implementovana uprava textovych suborov, stromova struktura suborov a administracny panel je pomerne obmedzeny
- v ostatnych aspektoch projekt funguje velmi dobre ako bezpecne ulozisko suborov

# Retrospektíva:
- ak by som zacal tento projekt od zaciatku, venoval by som viac pozornosti spracovaniu a vypisu chyb (aby rozhranie bolo viac pouzivatelsky privetive) a nastavil by som CI/CD (hlavne ak by sa na projekte podielalo viacero vyvojarov). Pri moznosti by som zlozil tim.
- hoci nie vsetky ciele boli dosiahnute, projekt plni svoju hlavnu ulohu – bezpecne ulozenie suborov s moznostou zdielania
- celkovo som spokojny s mojou pracou – webova aplikacia bude dobre posobit na mojom profile na LinkedIn
