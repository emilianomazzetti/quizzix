import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Flame,
  Activity,
  ShieldCheck,
  RefreshCw,
  Server,
  Zap,
  Clock
} from 'lucide-react';
import { firebaseSync, FirebaseDiagnosticResult } from '../services/firebaseSync';

interface FirebaseDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseDiagnosticModal: React.FC<FirebaseDiagnosticModalProps> = ({
  isOpen,
  onClose
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<FirebaseDiagnosticResult | null>(null);

  const runTest = async () => {
    setIsRunning(true);
    try {
      const res = await firebaseSync.runDiagnostic();
      setResult(res);
    } catch (e: any) {
      setResult({
        initialized: true,
        rtdbConnected: false,
        writeSuccess: false,
        authStatus: 'none',
        latencyMs: 0,
        errorMessage: e?.message || 'Errore imprevisto',
        projectId: 'gioco-multi-utente',
        databaseUrl: 'https://gioco-multi-utente-default-rtdb.europe-west1.firebasedatabase.app'
      });
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runTest();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 my-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-2xl text-slate-950 shadow-lg">
              <Flame className="w-6 h-6 fill-slate-950" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">
                Diagnostica Connessione Firebase
              </h2>
              <p className="text-xs text-slate-400">
                Verifica in tempo reale del database per il progetto <strong className="text-amber-300">gioco-multi-utente</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {/* Main Status Banner */}
          <div
            className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
              result?.writeSuccess
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : result && !result.writeSuccess
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              {result?.writeSuccess ? (
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
                  <CheckCircle2 className="w-6 h-6 stroke-[3]" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
                  <Activity className="w-6 h-6" />
                </div>
              )}
              <div>
                <h3 className="font-extrabold text-base text-white">
                  {isRunning
                    ? 'Esecuzione test connessione in corso...'
                    : result?.writeSuccess
                    ? 'Database Firebase Connesso & Funzionante!'
                    : 'Verifica Connessione al Database'}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {result?.writeSuccess
                    ? `Ping e scrittura dati riusciti in ${result.latencyMs} ms.`
                    : result?.errorMessage
                    ? `Dettaglio: ${result.errorMessage}`
                    : 'Inizializzazione SDK completata con le tue chiavi.'}
                </p>
              </div>
            </div>

            <button
              disabled={isRunning}
              onClick={runTest}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              Ripeti Test Ora
            </button>
          </div>

          {/* Detailed Connection Parameters */}
          <div className="space-y-3 bg-slate-950/70 p-5 rounded-2xl border border-slate-800 text-xs">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-400" />
              Parametri di Configurazione Attivi
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Project ID:</span>
                <span className="font-mono font-bold text-white text-xs">gioco-multi-utente</span>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Regione Cloud:</span>
                <span className="font-mono font-bold text-white text-xs">europe-west1 (Belgio)</span>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 sm:col-span-2">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Database URL:</span>
                <span className="font-mono font-bold text-amber-300 text-[11px] break-all">
                  https://gioco-multi-utente-default-rtdb.europe-west1.firebasedatabase.app
                </span>
              </div>
            </div>
          </div>

          {/* How to see it live in Firebase Console */}
          <div className="space-y-3 bg-slate-800/40 p-5 rounded-2xl border border-slate-700/80">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-indigo-400" />
              Come verificare con i tuoi occhi nella Console Firebase
            </h4>

            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
              <li>
                Apri la console di Firebase cliccando su questo link diretto:
                <div className="mt-1">
                  <a
                    href="https://console.firebase.google.com/project/gioco-multi-utente/database/gioco-multi-utente-default-rtdb/data"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-bold underline"
                  >
                    Apri Realtime Database in console.firebase.google.com
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </li>
              <li>
                Nella scheda <strong>Dati</strong>, vedrai comparire il nodo:
                <code className="mx-1 px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 font-mono text-[11px]">
                  rooms / FLIP-101
                </code>
              </li>
              <li>
                <strong>Fai la prova del nove:</strong> crea una domanda in FlipQuiz o avvia una partita.
                Vedrai la schermata della console di Firebase <strong>illuminarsi di giallo in tempo reale</strong> con
                i dati aggiornati di studenti, domande e punteggi!
              </li>
            </ol>
          </div>

          {/* Security Rules Reminder */}
          <div className="space-y-2 bg-indigo-950/20 p-4 rounded-2xl border border-indigo-500/30 text-xs">
            <div className="flex items-center gap-2 text-indigo-300 font-bold">
              <ShieldCheck className="w-4 h-4" />
              Regole di Sicurezza del Database (Security Rules)
            </div>
            <p className="text-slate-400">
              Per consentire a tutti gli studenti da smartphone di leggere e scrivere liberamente senza dover fare
              login con password, nella scheda <strong>Regole</strong> del tuo Realtime Database imposta:
            </p>
            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-amber-300 font-mono text-[11px] overflow-x-auto">
{`{
  "rules": {
    ".read": true,
    ".write": true
  }
}`}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Sincronizzazione Realtime Firebase attiva
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            Chiudi Finestra
          </button>
        </div>
      </div>
    </div>
  );
};
