# FlipQuiz

Quiz collaborativo per la classe: gli studenti creano le domande, il docente le proietta sulla LIM e avvia la sfida live
con punteggi, classifica e podio. 15 tipi di attività (scelta multipla, vero/falso, anagramma, puzzle, memory,
"becca la talpa", disegno con voto, ecc.).

**Stack:** React 19 · Vite · Tailwind · Firebase Realtime Database (sincronizzazione live).
Pubblicazione automatica su GitHub Pages tramite GitHub Actions.

## Sviluppo
```bash
npm install
npm run dev      # avvia Vite
npm run lint     # controllo TypeScript
npm run build    # build di produzione in dist/
```

## Struttura
- `src/App.tsx` – stato della stanza e logica di gioco
- `src/services/firebaseSync.ts` – unico canale di sincronizzazione (Firebase)
- `src/components/TeacherMonitor.tsx` – schermo docente (LIM)
- `src/components/StudentDevice.tsx` – dispositivo studente
- `src/components/QuestionCreator.tsx` – creazione domande
- `src/components/game/` – un componente per ogni tipo di attività (caricati solo quando servono)

## Da fare
- PIN/password per il ruolo docente
- Regole di sicurezza Firebase (ora il database è aperto in lettura e scrittura)
