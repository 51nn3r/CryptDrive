# Info o projekte: 
- Meno a priezvisko: Aleksandr Bukhtoiarov
- Názov projektu: CryptDrive
- Link na repozitár: https://github.com/51nn3r/CryptDrive

# Info o reportovanej verzii:  
- Tag: week8
- Obdobie: 8. týždeň, 07.4. - 13.4.2025

# Plán:
- Implementovať funkcionalitu na nahrávanie súborov a možnosť ich zdieľania.

# Vykonaná práca:
- Implementovaná kompletná funkcionalita pre šifrovaný upload súborov vrátane ukladania metadát a IV (AES-GCM) => 98f4157657978a2345bf95f655a53fcc6bb7ef77
- Optimalizovaný spôsob nahrávania súborov – namiesto base64 sa prenášajú binárne dáta pomocou FormData => c7325af6cac578f33f15bf182efcb1a12414c0eb
- Pridané API a používateľské rozhranie pre sťahovanie šifrovaných súborov a ich dešifrovanie na strane klienta => f39fd683a0054edf338723dcaeb194ec34ee3102
- Vytvorený komponent SharePanel na výber používateľa a zdieľanie súboru v dashboarde => f91fb4536fbb159857a5738f9d5bc6f80be66450

# Zdôvodnenie rozdielov medzi plánom a vykonanou prácou:
- Pôvodne bolo naplánované pridať aj možnosť zdieľania súboru s viacerými používateľmi (ako so skupinou), avšak na to už nezostal čas.

# Plán na ďalší týždeň:
- Implementovať správu skupín používateľov a možnosť zdieľať súbory s celou skupinou.
- Začať prácu na vlastnom administračnom rozhraní.

# Problémy:
- Žiadne vážnejšie problémy sa nevyskytli.

# Zmeny v špecifikácii:
- Žiadne.
 