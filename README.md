# Documentazione generica webapp per sito vetrina

## Struttura del Progetto

### 1. Configurazione delle Rotte (`src/App.tsx`)

Le rotte dell'applicazione sono definite nel file `src/App.tsx` utilizzando React Router. La struttura delle rotte segue il pattern:

```typescript
// Rotte principali per le pagine
<Route path="/pagina-da-raggiungere" element={<Pagina />} />
```

### 3. Organizzazione delle Pagine

Ogni Pagina è organizzata in una cartella dedicata sotto `src/Pages/` con la seguente struttura:

```
src/Pages/Entità/
├── Entità.tsx              # Pagina statica
```

### 5. Componenti Condivisi

Il progetto utilizza componenti condivisi in `src/Components/`:

- **`Navbar`**: Barra di navigazione
- **`Footer`**: Footer del sito
- **`SEO`**: Gestione SEO (meta tag, Open Graph, Twitter Card, canonical, robots, JSON‑LD)

### SEO e Meta Tag

La gestione SEO è centralizzata tramite `react-helmet-async` e il componente `SEO`.

- Provider globale in `App.tsx` (già configurato):

```tsx
import { HelmetProvider } from "react-helmet-async";

<HelmetProvider>
  {/* Router e pagine */}
  ...
</HelmetProvider>;
```

- Componente `SEO` (`src/Components/SEO.tsx`): espone le seguenti props
  - `title: string` — Titolo della pagina; viene trasformato in `"${title} | Showcase Webapp"`
  - `description: string` — Meta description della pagina
  - `keywords?: string[]` — Parole chiave aggiuntive; vengono unite ad un set base predefinito
  - `canonical?: string` — Path canonico della pagina (es. `/cosa-e`); viene prefissato con il `siteUrl`
  - `noindex?: boolean` — Se `true`, inserisce `robots: noindex, nofollow` (es. per la 404)
  - `ogImage?: string` — Percorso dell’immagine Open Graph/Twitter; di default il logo del sito
  - `ogType?: string` — Tipo Open Graph (default `website`)

Il componente imposta automaticamente:

- Meta base: `title`, `description`, `keywords`, `canonical`
- Open Graph: `og:title`, `og:description`, `og:type`, `og:url`, `og:image`, `og:site_name`, `og:locale`
- Twitter Card: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- Robots (se `noindex`)
- Structured Data (JSON‑LD) di tipo `Organization`

Nota: l’URL del sito è definito come costante in `src/Components/SEO.tsx` (`siteUrl = 'https://showcase-webapp.it'`). Se il dominio cambia, aggiorna questa costante e, se serve, i percorsi di `ogImage`/`logo`.

Esempi d'uso per pagina:

```tsx
// Esempio: Home
<SEO
  title="Showcase - Webapp dimostrativa"
  description="Starter Kit generico per realizzare showcase webapp moderne."
  keywords={["software", "generico"]}
  canonical="/"
/>
```

```tsx
// Esempio: Pagina 404 (non indicizzata)
<SEO
  title="Pagina Non Trovata - 404"
  description="La pagina che stai cercando non esiste."
  noindex={true}
/>
```

Linee guida:

- Imposta `title` e `description` unici e coerenti con il contenuto
- Usa `canonical` con il path della pagina (es. `/cosa-e`, `/contatti`)
- Usa `noindex` solo per pagine da escludere dai motori di ricerca (es. 404)
- Aggiungi `keywords` solo se utili; il componente include già un set base

### Stili e Tema (Colori e Font)

I colori primari/secondari e il font di base sono configurati in `src/App.css` usando le design tokens di Tailwind 4 con `@theme`.

Definizione colori e font:

```css
/* src/App.css */
@import "tailwindcss";
@theme {
  /* Primary */
  --color-primary: #89c64b;
  --color-primary-light: #a6d56f;
  --color-primary-dark: #6fa53c;

  /* Secondary */
  --color-secondary: #febc11;
  --color-secondary-light: #ffd45c;
  --color-secondary-dark: #e5a800;

  /* Font family */
  --font-family-sans: "Sora", ui-sans-serif, system-ui, sans-serif;
  --default-font-family: "Sora", ui-sans-serif, system-ui, sans-serif;
}

body {
  font-family: "Sora", ui-sans-serif, system-ui, sans-serif;
}
*,
*::before,
*::after {
  font-family: "Sora", ui-sans-serif, system-ui, sans-serif;
}
```

Uso nelle classi Tailwind:

- `bg-primary`, `text-primary`, `border-primary`
- `bg-secondary`, `text-secondary`
- Varianti: `hover:bg-primary-dark`, `bg-primary-light`, ecc.

Per cambiare i colori del brand, modifica i valori HEX dentro `@theme`. Le utility Tailwind che usano `primary`/`secondary` rifletteranno automaticamente i nuovi colori.

Aggiornare/Importare un nuovo font:

1. Importa il font in `index.html` (es. Google Fonts):

```html
<!-- index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
  rel="stylesheet"
/>
```

2. Imposta il font in `src/App.css` aggiornando le variabili e il body:

```css
@theme {
  --font-family-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --default-font-family: "Inter", ui-sans-serif, system-ui, sans-serif;
}
body,
*,
*::before,
*::after {
  font-family: "Inter", ui-sans-serif, system-ui, sans-serif;
}
```

3. Opzionale: allinea il meta `theme-color` in `index.html` al nuovo `--color-primary`:

```html
<meta name="theme-color" content="#89c64b" />
```

## 🚀 Tecnologie Principali

- **React**: Libreria UI moderna e performante
- **Vite**: Build tool veloce e moderno
- **Tailwind CSS**: Framework CSS utility-first
- **React Router**: Gestione delle rotte
- **TypeScript**: Tipizzazione statica

## 🚀 Come Iniziare

1. Clona il repository
2. Installa le dipendenze:
   ```bash
   npm install
   ```
3. Avvia il server di sviluppo:
   ```bash
   npm run start
   ```

## 📦 Requisiti di Sistema

### Node.js

Questo progetto richiede Node.js versione 22 o superiore.

## 📦 Script Disponibili

- `npm run start`: Avvia il server di sviluppo
- `npm run build`: Crea la build di produzione
- `npm run lint`: Esegue il linting del codice

### Deploy con commit e tag

- `npm run patch`: aggiorna la versione del package.json 0.0.X,
- `npm run minor`: aggiorna la versione del package.json 0.X.0,
- `npm run major`: aggiorna la versione del package.json X.0.0,

## 🔧 Configurazione

### Variabili d'Ambiente

Crea un file `.env` nella root del progetto con:

```env
VITE_LOGIN_PASSWORD=la_tua_password_qui
```

**Nota**: In Vite, le variabili d'ambiente devono essere prefissate con `VITE_` per essere esposte al client.

### Deploy su GitHub Pages

Il progetto è configurato per il deploy automatico su GitHub Pages tramite GitHub Actions.

#### Prerequisiti

- Repository GitHub (pubblico o privato con account a pagamento)
- Branch `main` o `master` come branch principale

#### Configurazione

1. **Abilita GitHub Pages nel repository**:
   - Vai su: `Settings` > `Pages`
   - Sotto "Source", seleziona `GitHub Actions`

2. **Configura le variabili d'ambiente (se necessario)**:
   - Vai su: `Settings` > `Secrets and variables` > `Actions`
   - Clicca su `New repository secret`
   - Aggiungi `VITE_LOGIN_PASSWORD` con il valore della password

3. **Push del codice**:
   ```bash
   git add .
   git commit -m "Setup GitHub Pages"
   git push origin main
   ```

4. **Il workflow si attiverà automaticamente**:
   - Vai su: `Actions` nel tuo repository
   - Il workflow `Deploy to GitHub Pages` verrà eseguito automaticamente
   - Al termine, il sito sarà disponibile su: `https://username.github.io/repository-name/`

#### Base Path

Il base path viene configurato automaticamente in base al nome del repository:
- Se il repository è `username.github.io`: il base path è `/`
- Se il repository è un progetto: il base path è `/repository-name/`

Per testare in locale con un base path diverso, crea un file `.env.local`:
```env
VITE_BASE_PATH=/repository-name/
```

#### Repository Pubblico vs Privato

- **Repository Pubblico**: GitHub Pages è gratuito
- **Repository Privato**: Richiede GitHub Pro, Team o Enterprise (a pagamento)

## 📚 Documentazione

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT.
