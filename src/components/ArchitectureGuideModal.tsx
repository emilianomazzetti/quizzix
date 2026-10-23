import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  Users,
  Monitor,
  Smartphone,
  HelpCircle,
  Trophy,
  Music,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Flame,
  Zap,
  Star,
  Shuffle
} from 'lucide-react';

interface ArchitectureGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureGuideModal: React.FC<ArchitectureGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'teacher' | 'activities' | 'student'>('teacher');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 my-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">Guida Completa FlipQuiz</h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider border border-indigo-500/30">
                  Manuale d'Uso
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Come funziona lo Schermo Docente (LIM) e tutte le attività didattiche
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            title="Chiudi guida"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-3 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('teacher')}
            className={`px-4 py-2.5 text-xs font-black rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'teacher'
                ? 'border-indigo-500 text-indigo-300 bg-slate-900 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Lato Docente (LIM)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('activities')}
            className={`px-4 py-2.5 text-xs font-black rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'activities'
                ? 'border-amber-500 text-amber-300 bg-slate-900 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Tutte le Attività di Gioco</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('student')}
            className={`px-4 py-2.5 text-xs font-black rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'student'
                ? 'border-emerald-500 text-emerald-300 bg-slate-900 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Dispositivo Studente</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm leading-relaxed">
          {/* TAB 1: LATO DOCENTE (LIM) */}
          {activeTab === 'teacher' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl flex items-start gap-3">
                <Monitor className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-black text-white text-base">
                    Il Monitor Docente: Regia della Classe sulla LIM
                  </h3>
                  <p className="text-xs text-slate-300">
                    Lo schermo docente è progettato per essere proiettato sulla Lavagna Interattiva Multimediale (LIM) o videoproiettore. Consente di orchestrare l'intera esperienza didattica senza spoiler e in tempo reale.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Accesso & QR Code */}
                <div className="p-4 bg-slate-850 rounded-2xl border border-slate-700/80 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-300 font-extrabold text-sm">
                    <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs">1</span>
                    Accesso Immediato con QR Code & PIN
                  </div>
                  <p className="text-xs text-slate-300">
                    Proietta il QR code e il PIN stanza sulla LIM. Gli studenti inquadrano con lo smartphone e vengono connessi all'aula in 2 secondi senza richiedere password o account.
                  </p>
                </div>

                {/* 2. Disconnessione Automatica */}
                <div className="p-4 bg-slate-850 rounded-2xl border border-slate-700/80 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-300 font-extrabold text-sm">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs">2</span>
                    Disconnessione Automatica Studenti
                  </div>
                  <p className="text-xs text-slate-300">
                    Quando un utente chiude il browser o la scheda, la piattaforma lo scollega automaticamente dall'aula grazie al trigger <em>onDisconnect</em> e agli eventi <em>pagehide</em>, mantenendo l'elenco presenze pulito.
                  </p>
                </div>

                {/* 3. Repository Domande */}
                <div className="p-4 bg-slate-850 rounded-2xl border border-slate-700/80 space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-extrabold text-sm">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs">3</span>
                    Repository Domande Flipped
                  </div>
                  <p className="text-xs text-slate-300">
                    Ogni studente compone 1 domanda. Il docente può revisionarla, modificarne i punti e il tempo limite (icona Ingranaggio) o eliminarla dal quiz. Se una domanda viene eliminata, lo studente viene sbloccato per formularne un'altra.
                  </p>
                </div>

                {/* 4. Gestione Studenti & Espulsione */}
                <div className="p-4 bg-slate-850 rounded-2xl border border-slate-700/80 space-y-2">
                  <div className="flex items-center gap-2 text-rose-300 font-extrabold text-sm">
                    <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center text-xs">4</span>
                    Controllo Presenze & Espulsione
                  </div>
                  <p className="text-xs text-slate-300">
                    Il docente vede in tempo reale tutti gli studenti connessi. Se necessario, può espellere un partecipante indesiderato (icona espelli) oppure simulare compagni di classe con il tasto <strong>+1 Bot</strong>.
                  </p>
                </div>

                {/* 5. Colonna Sonora & Musica Audio */}
                <div className="p-4 bg-slate-850 rounded-2xl border border-slate-700/80 space-y-2">
                  <div className="flex items-center gap-2 text-purple-300 font-extrabold text-sm">
                    <Music className="w-4 h-4 text-purple-400" />
                    Colonna Sonora & Musica di Sottofondo
                  </div>
                  <p className="text-xs text-slate-300">
                    In <em>Configurazione Docente</em> è possibile selezionare 4 temi audio polifonici sintetizzati proceduralmente (Arcade 8-Bit Retro, Quiz Show Suspense, Lo-Fi Relax, Epico Avventura). Partono in automatico durante le domande.
                  </p>
                </div>

                {/* 6. Classifica Generale & Soluzione Puzzle */}
                <div className="p-4 bg-slate-850 rounded-2xl border border-slate-700/80 space-y-2">
                  <div className="flex items-center gap-2 text-yellow-300 font-extrabold text-sm">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    Classifica Generale & Schermo Risolto
                  </div>
                  <p className="text-xs text-slate-300">
                    Il pulsante in alto <strong>CLASSIFICA GENERALE</strong> apre la graduatoria globale della classe con medaglie e strisce. Alla fine della manche Puzzle, la LIM proietta l'immagine corretta ricomposta a tutto schermo.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TUTTE LE ATTIVITÀ DI GIOCO */}
          {activeTab === 'activities' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="font-black text-amber-200 text-sm">
                    Catalogo delle 15 Attività Didattiche
                  </h3>
                  <p className="text-xs text-slate-300">
                    Ogni attività adotta meccaniche pedagogiche uniche per stimolare l'attenzione e il pensiero critico.
                  </p>
                </div>
                <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black rounded-xl text-xs">
                  15 Tipologie
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Scelta Multipla */}
                <div className="p-4 bg-slate-850 rounded-2xl border border-slate-700/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-blue-300 text-sm flex items-center gap-1.5">
                      📝 Risposta Multipla
                    </span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-bold">
                      Velocità +20 pt
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Da 2 a 6 opzioni con una sola esatta. Chi risponde per primo ottiene il bonus per i 3 diti più veloci (+20, +15, +10 pt). Le opzioni appaiono solo sui dispositivi degli studenti.
                  </p>
                </div>

                {/* 2. Vero o Falso */}
                <div className="p-4 bg-slate-850 rounded-2xl border border-slate-700/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-amber-300 text-sm flex items-center gap-1.5">
                      ⚖️ Vero o Falso
                    </span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                      Istantaneo
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Valutazione di un'affermazione netta. Richiede prontezza di riflessi per premere VERO o FALSO prima che il timer scada.
                  </p>
                </div>

                {/* 3. Risposta Aperta Breve */}
                <div className="p-4 bg-slate-850 rounded-2xl border border-slate-700/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-emerald-300 text-sm flex items-center gap-1.5">
                      ✍️ Risposta Aperta Breve
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                      Digitazione
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Lo studente digita la risposta su tastiera. Il motore accetta sinonimi e varianti inserite dal creatore, ignorando maiuscole e spazi superflui.
                  </p>
                </div>

                {/* 4. Testo Bucato */}
                <div className="p-4 bg-slate-850 rounded-2xl border border-slate-700/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-teal-300 text-sm flex items-center gap-1.5">
                      📖 Testo Bucato (Cloze)
                    </span>
                    <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-bold">
                      Menù a Tendina
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Completamento di una o più parole mancanti all'interno di un testo. Gli studenti selezionano i termini esatti da un menù a tendina verticale.
                  </p>
                </div>

                {/* 5. Memory Match / Associazione */}
                <div className="p-4 bg-slate-850 rounded-2xl border border-slate-700/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-purple-300 text-sm flex items-center gap-1.5">
                      🃏 Associazione / Memory
                    </span>
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">
                      Coppie Carte
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Trova e abbina le coppie corrispondenti toccando le carte coperte (testo-testo o testo-immagine) prima dello scadere del tempo.
                  </p>
                </div>

                {/* 6. Becca la Talpa (Whack-a-Mole) */}
                <div className="p-4 bg-slate-850 rounded-2xl border-2 border-amber-500/60 space-y-1.5 shadow-lg shadow-amber-500/10">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-amber-300 text-sm flex items-center gap-1.5">
                      🐹 Becca la Talpa (3x3 Fisso)
                    </span>
                    <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black">
                      +10 pt / -10 pt
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Griglia fissa <strong>3x3 (9 buche)</strong>. Spuntano talpe con cartellini: colpisci <strong>SOLO</strong> la categoria bersaglio (nomi, aggettivi, verbi o articoli). Punteggio in tempo reale: +10 pt a talpa corretta presa, -10 pt per errore (minimo 0). I punti confluiscono immediatamente nel punteggio finale!
                  </p>
                </div>

                {/* 7. Sfida di Disegno */}
                <div className="p-4 bg-slate-850 rounded-2xl border border-slate-700/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-pink-300 text-sm flex items-center gap-1.5">
                      🎨 Sfida di Disegno & Voto
                    </span>
                    <span className="text-[10px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full font-bold">
                      +25 pt a Stella ⭐
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Disegna il prompt assegnato con il dito sulla tela digitale. I disegni vengono inviati e proiettati nella Galleria d'Arte della LIM per la votazione con le stelline da parte dei compagni.
                  </p>
                </div>

                {/* 8. Identifica Celle */}
                <div className="p-4 bg-slate-850 rounded-2xl border border-slate-700/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-cyan-300 text-sm flex items-center gap-1.5">
                      🎯 Identifica Celle
                    </span>
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-bold">
                      Filtro
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Dato uno stimolo concettuale (es. &quot;NAPOLEONE&quot;), tocca tutte le celle informative collegate evitando i tranelli.
                  </p>
                </div>

                {/* 9. Riordina Celle */}
                <div className="p-4 bg-slate-850 rounded-2xl border border-slate-700/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-orange-300 text-sm flex items-center gap-1.5">
                      🔢 Riordina Sequenza
                    </span>
                    <span className="text-[10px] bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full font-bold">
                      Cronologia / Logica
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Tocca o trascina i cartellini per disporli nella corretta sequenza logica, temporale o progressiva richiesta dalla prova.
                  </p>
                </div>

                {/* 10. Anagramma */}
                <div className="p-4 bg-slate-850 rounded-2xl border border-slate-700/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sky-300 text-sm flex items-center gap-1.5">
                      🔀 Anagramma Segreto
                    </span>
                    <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-bold">
                      Lettere Tattili
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Ricomponi la parola segreta toccando le tessere con le lettere disordinate nell'ordine esatto prima dello scadere del tempo.
                  </p>
                </div>

                {/* 11. Puzzle */}
                <div className="p-4 bg-slate-850 rounded-2xl border-2 border-purple-500/60 space-y-1.5 shadow-lg shadow-purple-500/10">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-purple-300 text-sm flex items-center gap-1.5">
                      🧩 Puzzle Tessere
                    </span>
                    <span className="text-[10px] bg-purple-500 text-white px-2 py-0.5 rounded-full font-black">
                      Soluzione su LIM
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Ricomponi l'immagine spostando le tessere sul tuo schermo. Allo scadere del turno, <strong>lo schermo docente sulla LIM mostra l'immagine corretta ricomposta</strong> a colori con le statistiche della classe!
                  </p>
                </div>

                {/* 12. Caccia alle Parole */}
                <div className="p-4 bg-slate-850 rounded-2xl border border-slate-700/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-lime-300 text-sm flex items-center gap-1.5">
                      🔍 Caccia alle Parole
                    </span>
                    <span className="text-[10px] bg-lime-500/20 text-lime-300 px-2 py-0.5 rounded-full font-bold">
                      Word Search
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Trova tutte le parole celate nella griglia di lettere scorrendo con il dito in orizzontale o verticale.
                  </p>
                </div>

                {/* 13. Sfida di Matematica */}
                <div className="p-4 bg-slate-850 rounded-2xl border border-slate-700/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-indigo-300 text-sm flex items-center gap-1.5">
                      🧮 Sfida di Matematica
                    </span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                      Calcolo Rapido
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Risolvi una serie di operazioni aritmetiche a risposta rapida per testare la velocità di calcolo a mente.
                  </p>
                </div>

                {/* 14. Più Parole */}
                <div className="p-4 bg-slate-850 rounded-2xl border-2 border-indigo-500/60 space-y-1.5 shadow-lg shadow-indigo-500/10">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-indigo-300 text-sm flex items-center gap-1.5">
                      🔤 Più Parole (Word Builder)
                    </span>
                    <span className="text-[10px] bg-indigo-400 text-slate-950 px-2 py-0.5 rounded-full font-black">
                      1 Lettera = 1 Pt
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    5 consonanti e 2 vocali (con tasto <em>Randomizza Lettere</em> in creazione). Componi quante più parole italiane valide riesci prima dello scadere del tempo: ogni lettera usata aggiunge 1 punto al tuo punteggio totale!
                  </p>
                </div>

                {/* 15. La Parola Più Lunga */}
                <div className="p-4 bg-slate-850 rounded-2xl border border-slate-700/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-fuchsia-300 text-sm flex items-center gap-1.5">
                      🏆 La Parola Più Lunga
                    </span>
                    <span className="text-[10px] bg-fuchsia-500 text-white px-2 py-0.5 rounded-full font-black">
                      Super Bonus +25 pt
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    14 lettere (10 consonanti + 4 vocali). Trova la parola italiana valida più lunga possibile. Chi registra il record della manche vince un super bonus di +25 punti proclamato sulla LIM.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DISPOSITIVO STUDENTE */}
          {activeTab === 'student' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
                <Smartphone className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-black text-white text-base">
                    Esperienza Studente: Protagonisti Attivi del Quiz
                  </h3>
                  <p className="text-xs text-slate-300">
                    Ogni studente partecipa dal proprio smartphone, tablet o PC. L'interfaccia è ottimizzata per il touch screen, con feedback visivo e vibrazione tattile.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-850 rounded-2xl border border-slate-700/80 space-y-2">
                  <div className="text-amber-400 font-extrabold text-sm flex items-center gap-1.5">
                    <span>1.</span> Accesso & Avatar
                  </div>
                  <p className="text-xs text-slate-300">
                    Inquadra il QR code proiettato sulla LIM. Digita il tuo nome e scegli l'avatar tra le icone disponibili. Sei subito collegato!
                  </p>
                </div>

                <div className="p-4 bg-slate-850 rounded-2xl border border-slate-700/80 space-y-2">
                  <div className="text-indigo-400 font-extrabold text-sm flex items-center gap-1.5">
                    <span>2.</span> Formula 1 Domanda
                  </div>
                  <p className="text-xs text-slate-300">
                    Scegli una tra le 15 tipologie e crea la tua domanda per sfidare i compagni. Una volta inviata, entri in attesa del via del docente.
                  </p>
                </div>

                <div className="p-4 bg-slate-850 rounded-2xl border border-slate-700/80 space-y-2">
                  <div className="text-emerald-400 font-extrabold text-sm flex items-center gap-1.5">
                    <span>3.</span> Sfida Live & Punti
                  </div>
                  <p className="text-xs text-slate-300">
                    Rispondi alle domande dei tuoi compagni in tempo reale. I punti vinti in ogni prova (comprese talpe e parole) confluiscono all'istante sul tuo tabellone!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>FlipQuiz • Metodologia Flipped Classroom per Scuole e Didattica Attiva</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Chiudi Guida
          </button>
        </div>
      </div>
    </div>
  );
};
