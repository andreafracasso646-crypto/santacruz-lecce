# Santa Cruz — Lecce

Sito vetrina per la vineria e cocktail bar di Via Umberto I 25, Lecce.
Una pagina sola, HTML/CSS/JS puri, nessuna build e nessuna dipendenza da installare.
Le animazioni usano GSAP + ScrollTrigger caricati da CDN.

## Struttura

```
santacruz-lecce/
├── index.html          markup della pagina
├── css/style.css       token, layout, componenti
├── js/main.js          rosone SVG, orari, animazioni GSAP
└── img/                foto e favicon
```

## Come aprirlo

Basta un doppio clic su `index.html`. Per lavorarci in VS Code conviene
l'estensione **Live Server** (tasto destro sul file → *Open with Live Server*):
ricarica da sola a ogni salvataggio.

Aprendo il file con `file://` la mappa di Google e i font potrebbero non
caricarsi: con Live Server o su un dominio vero funziona tutto.

## Cosa cambiare, e dove

**Testi, prezzi, orari** → `index.html`. La carta sono le cinque `<article class="card">`
dentro `#carta`. I prezzi stanno nelle `<ul class="card__list">`.

**Foto** → sostituisci i file in `img/` mantenendo gli stessi nomi, oppure cambia
il `src` dei quattro `<img class="frame__media">`. Formato consigliato: WebP,
lato lungo 1200–1600 px. Il ritaglio è automatico (`object-fit: cover`), quindi
il soggetto va tenuto al centro.

**Colori** → in cima a `css/style.css`, blocco `:root`. Tutto il sito deriva da
quelle sei variabili: `--luce`, `--sole`, `--inchiostro`, `--negroamaro`,
`--albicocca`, `--ulivo`.

**Arrotondamenti** → sempre in `:root`: `--r-xl`, `--r-lg`, `--r-md`, `--r-pill`.

**Orari** → `js/main.js`, funzione `chiusura()` e costante `apertura`. Da lì si
generano sia la tabella sia il badge "Aperto ora", che si aggiorna da solo.

**Rosone** → `js/main.js`, funzione `buildRose()`. Il primo argomento è l'SVG,
il secondo il numero di raggi (16 nell'hero, 12 nel loader). Lo spessore dei
tratti si regola con `stroke-width`.

## Da sistemare prima della pubblicazione

- Menù e prezzi sono verosimili ma **inventati**: vanno confermati dai titolari.
- La mail `ciao@santacruzlecce.it` è un segnaposto.
- Verificare il nome esatto: sull'insegna si legge *Santa Croce*, su Google *Santa Cruz*.
- Aggiungere una vera immagine `og:image` per le anteprime su WhatsApp e social.

Telefono, indirizzo, orari e link alla mappa sono invece quelli reali.

## Pubblicazione

Cartella statica: si trascina così com'è su Netlify Drop, Vercel o Cloudflare Pages.
Nessun comando di build, nessuna cartella di output da indicare.
