# Info o projekte: 
- Meno a priezvisko: Aleksandr Bukhtoiarov
- Názov projektu: CryptDrive
- Link na repozitár: https://github.com/51nn3r/CryptDrive/tree/develop

# Info o reportovanej verzii:  
- Tag: week4                        
- Obdobie: 4. týždeň, 10.3. - 16.3.2025 

# Plán:
- Inicializovať projekt a nastaviť prostredie Docker (Django, PostgreSQL, Nginx).
- Vytvoriť základné moduly aplikácie: registrácia, prihlásenie, používateľský panel.
- Zvoliť knižnicu na klientské šifrovanie a začať implementovať základnú šifrovaciu logiku.
- Vytvoriť prvotnú štruktúru databázových modelov.
- Pripraviť základnú špecifikáciu API.

# Vykonaná práca:
- Inicializácia projektu a konfigurácia Docker + Django + PostgreSQL + Nginx, commit: `7a7bf402503b0aa39c7611b277b314c0b1b8dd09`
- Vytvorenie súboru `.gitignore`, commit: `874d1080330fcd89c8a0327c24a2df4438ae9149`
- Inicializácia aplikácií `core` a `api`, vytvorenie databázových modelov, commit: `a0c758b0f0018ee59b33ec4d197501ad7bafb6da`

# Zdôvodnenie rozdielov medzi plánom a vykonanou prácou:
- Všetky plánované úlohy na tento týždeň boli splnené podľa plánu.
- Neboli žiadne zmeny oproti pôvodnému harmonogramu.

# Plán na ďalší týždeň:
- Implementovať databázovú logiku pre aplikáciu `core` (registrácia, prihlásenie, používateľský panel).
- Začať pracovať na klientskom šifrovaní pomocou Web Crypto API.
- Pokračovať v integrácii Docker prostredia, overiť správne fungovanie a doladiť konfigurácie pre dev/production.

# Problémy:
- Počas týždňa neboli žiadne problémy.

# Zmeny v špecifikácii:
- Pridané rozdelenie používateľov do skupín. Každý používateľ si bude môcť vytvoriť vlastné skupiny a pridávať do nich iných používateľov, aby im mohol jednoduchšie udeľovať prístup k súborom. Skupiny budú viditeľné iba pre ich tvorcu.
