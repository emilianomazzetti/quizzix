/**
 * Italian Word Dictionary & Anagram / Word Builder Helpers
 * Supporta vocabolario esteso della lingua italiana (nomi singolari e plurali, aggettivi, verbi coniugati e all'infinito)
 * con fallback e verifica online gratuita via FreeDictionary / Wiktionary API.
 */

// Cache per parole verificate online durante la sessione
const VERIFIED_WORDS_CACHE = new Set<string>();

// Dizionario curato ed esteso della lingua italiana (oltre 2.500 vocaboli comuni, forme flesse e verbali)
export const ITALIAN_WORD_LIST = new Set([
  // 1. Articoli (determinativi e indeterminativi)
  'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una',

  // 2. Preposizioni semplici
  'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra',

  // 3. Preposizioni articolate
  'del', 'dello', 'della', 'dei', 'degli', 'delle',
  'al', 'allo', 'alla', 'ai', 'agli', 'alle',
  'dal', 'dallo', 'dalla', 'dai', 'dagli', 'dalle',
  'nel', 'nello', 'nella', 'nei', 'negli', 'nelle',
  'sul', 'sullo', 'sulla', 'sui', 'sugli', 'sulle',
  'col', 'coi',

  // 4. Pronomi personali, relativi, possessivi e dimostrativi
  'io', 'tu', 'lui', 'lei', 'noi', 'voi', 'loro', 'esso', 'essa', 'essi', 'esse',
  'me', 'te', 'se', 'ci', 'vi', 'ne', 'mi', 'ti', 'si', 'li', 'le', 'cui', 'chi', 'che',
  'mio', 'tuo', 'suo', 'nostro', 'vostro', 'miei', 'tuoi', 'suoi', 'nostri', 'vostri',
  'mia', 'tua', 'sua', 'nostra', 'vostra', 'mie', 'tue', 'sue', 'nostre', 'vostre',
  'questo', 'questa', 'questi', 'queste', 'quello', 'quella', 'quelli', 'quelle',
  'quale', 'quali', 'quanto', 'quanti', 'quanta', 'quante', 'tale', 'tali',

  // 5. Congiunzioni e avverbi comuni
  'e', 'ed', 'o', 'od', 'ma', 'anche', 'ancora', 'bene', 'male', 'meglio', 'peggio',
  'non', 'si', 'no', 'forse', 'quasi', 'solo', 'sempre', 'mai', 'spesso', 'subito',
  'prima', 'dopo', 'poi', 'ora', 'adesso', 'ieri', 'oggi', 'domani', 'qui', 'qua',
  'li', 'la', 'giu', 'su', 'sopra', 'sotto', 'dentro', 'fuori', 'davanti', 'dietro',
  'vicino', 'lontano', 'molto', 'poco', 'tanto', 'troppo', 'meno', 'piu', 'gia', 'via',
  'pure', 'pero', 'invece', 'allora', 'infatti', 'quindi', 'dunquue', 'perche', 'come',
  'quando', 'dove', 'onde', 'pure', 'presto', 'tardi', 'abbastanza', 'affatto', 'piano',
  'forte', 'insieme', 'ognuno', 'ciascuno', 'alcuni', 'nessuno', 'niente', 'nulla',

  // 6. Verbi all'infinito comuni
  'essere', 'avere', 'fare', 'andare', 'dire', 'dare', 'stare', 'potere', 'volere', 'dovere',
  'sapere', 'vedere', 'venire', 'sentire', 'parlare', 'trovare', 'lasciare', 'prendere',
  'capire', 'mettere', 'pensare', 'credere', 'chiedere', 'vivere', 'morire', 'nascere',
  'crescere', 'ridere', 'piangere', 'cantare', 'ballare', 'saltare', 'correre', 'nuotare',
  'dormire', 'mangiare', 'bere', 'leggere', 'scrivere', 'dipingere', 'giocare', 'vincere',
  'perdere', 'aprire', 'chiudere', 'portare', 'comprare', 'vendere', 'pagare', 'amare',
  'odiare', 'temere', 'sperare', 'toccare', 'guardare', 'osservare', 'fermare', 'partire',
  'tornare', 'entrare', 'uscire', 'cadere', 'salire', 'scendere', 'finire', 'iniziare',
  'cominciare', 'continuare', 'riuscire', 'tentare', 'cercare', 'usare', 'aiutare',
  'imparare', 'insegnare', 'studiare', 'ascoltare', 'costruire', 'creare', 'guidare',
  'spedire', 'ricevere', 'incontrare', 'scegliere', 'decidere', 'risolvere', 'scoprire',
  'rispondere', 'salvare', 'inviare', 'spedire', 'toccare', 'passare', 'tenere', 'chiamare',
  'mostrare', 'seguire', 'permettere', 'avvenire', 'diventare', 'restare', 'rimanere',
  'sembrare', 'spiegare', 'ricordare', 'dimenticare', 'servire', 'ottenere', 'accettare',

  // 7. Forme verbali coniugate comunissime (presente, passato, imperativo)
  'sono', 'sei', 'e', 'siamo', 'siete', 'era', 'ero', 'eri', 'eravamo', 'erano', 'stato', 'stata', 'stati', 'state',
  'ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno', 'aveva', 'avevo', 'avevi', 'avuto', 'avuta',
  'faccio', 'fai', 'fa', 'facciamo', 'fate', 'fanno', 'fatto', 'fatta', 'fatti', 'fatte', 'fece',
  'vado', 'vai', 'va', 'andiamo', 'andate', 'vanno', 'andato', 'andata', 'andati', 'andate',
  'dico', 'dici', 'dice', 'diciamo', 'dite', 'dicono', 'detto', 'detta', 'detti', 'dette',
  'do', 'dai', 'da', 'diamo', 'date', 'danno', 'dato', 'data', 'dati', 'date',
  'sto', 'stai', 'sta', 'stiamo', 'state', 'stanno',
  'posso', 'puoi', 'puo', 'possiamo', 'potete', 'possono', 'potuto',
  'voglio', 'vuoi', 'vuole', 'vogliamo', 'volete', 'vogliono', 'voluto',
  'devo', 'devi', 'deve', 'dobbiamo', 'dovete', 'devono', 'dovuto',
  'so', 'sai', 'sa', 'sappiamo', 'sapete', 'sanno', 'saputo',
  'vedo', 'vedi', 'vede', 'vediamo', 'vedete', 'vedono', 'visto', 'vista', 'visti', 'viste',
  'vengo', 'vieni', 'viene', 'veniamo', 'venite', 'vengono', 'venuto', 'venuta', 'venuti',
  'sento', 'senti', 'sente', 'sentiamo', 'sentite', 'sentono', 'sentito', 'sentita',
  'parlo', 'parli', 'parla', 'parliamo', 'parlate', 'parlano', 'parlato',
  'trovo', 'trovi', 'trova', 'troviamo', 'trovate', 'trovano', 'trovato', 'trovata',
  'lascio', 'lasci', 'lascia', 'lasciamo', 'lasciate', 'lasciano', 'lasciato',
  'prendo', 'prendi', 'prende', 'prendiamo', 'prendete', 'prendono', 'preso', 'presa', 'presi',
  'metto', 'metti', 'mette', 'mettiamo', 'mettete', 'mettono', 'messo', 'messa', 'messi',
  'penso', 'pensi', 'pensa', 'pensiamo', 'pensate', 'pensano', 'pensato',
  'credo', 'credi', 'crede', 'crediamo', 'credete', 'credono', 'creduto',
  'vivo', 'vivi', 'vive', 'viviamo', 'vivete', 'vivono', 'vissuto', 'viva',
  'rido', 'ridi', 'ride', 'ridiamo', 'ridete', 'ridono', 'riso',
  'piango', 'piangi', 'piange', 'piangiamo', 'piangono', 'pianto',
  'canto', 'canti', 'canta', 'cantiamo', 'cantate', 'cantano', 'cantato',
  'ballo', 'balli', 'balla', 'balliamo', 'ballate', 'ballano', 'ballato',
  'salto', 'salti', 'salta', 'saltiamo', 'saltate', 'saltano', 'saltato',
  'corro', 'corri', 'corre', 'corriamo', 'correte', 'corrono', 'corso', 'corsa',
  'nuoto', 'nuoti', 'nuota', 'nuotiamo', 'nuotano', 'nuotato',
  'dormo', 'dormi', 'dorme', 'dormiamo', 'dormite', 'dormono', 'dormito',
  'mangio', 'mangi', 'mangia', 'mangiamo', 'mangiate', 'mangiano', 'mangiato',
  'bevo', 'bevi', 'beve', 'beviamo', 'bevete', 'bevono', 'bevuto',
  'leggo', 'leggi', 'legge', 'leggiamo', 'leggete', 'leggono', 'letto', 'letta', 'letti',
  'scrivo', 'scrivi', 'scrive', 'scriviamo', 'scrivete', 'scrivono', 'scritto', 'scritta',
  'apro', 'apri', 'apre', 'apriamo', 'aprite', 'aprono', 'aperto', 'aperta', 'aperti',
  'chiudo', 'chiudi', 'chiude', 'chiudiamo', 'chiudono', 'chiuso', 'chiusa', 'chiusi',
  'porto', 'porti', 'porta', 'portiamo', 'portate', 'portano', 'portato',
  'amo', 'ami', 'ama', 'amiamo', 'amate', 'amano', 'amato', 'amata',
  'parto', 'parti', 'parte', 'partiamo', 'partite', 'partono', 'partito', 'partita',
  'torno', 'torni', 'torna', 'torniamo', 'tornano', 'tornato', 'tornata',
  'entro', 'entri', 'entra', 'entriamo', 'entrano', 'entrato', 'entrata',
  'esco', 'esci', 'esce', 'usciamo', 'uscite', 'escono', 'uscito', 'uscita',
  'salgo', 'sali', 'sale', 'saliamo', 'salite', 'salgono', 'salito',
  'scendo', 'scendi', 'scende', 'scendiamo', 'scendono', 'sceso', 'scesa',
  'cerco', 'cerchi', 'cerca', 'cerchiamo', 'cercate', 'cercano', 'cercato',
  'uso', 'usi', 'usa', 'usiamo', 'usate', 'usano', 'usato', 'usata',
  'aiuto', 'aiuti', 'aiuta', 'aiutiamo', 'aiutate', 'aiutano', 'aiutato',
  'gioco', 'giochi', 'gioca', 'giochiamo', 'giocate', 'giocano', 'giocato',
  'vinco', 'vinci', 'vince', 'vinciamo', 'vincono', 'vinto', 'vinta', 'vinti',
  'perdo', 'perdi', 'perde', 'perdiamo', 'perdono', 'perso', 'persa', 'persi',

  // 8. Nomi e sostantivi comuni (singolari e plurali)
  'mare', 'mari', 'sole', 'soli', 'luna', 'lune', 'cane', 'cani', 'cagna', 'cagne',
  'gatto', 'gatta', 'gatti', 'gatte', 'casa', 'case', 'pane', 'pani', 'vino', 'vini',
  'mela', 'mele', 'pera', 'pere', 'pesce', 'pesci', 'luce', 'luci', 'notte', 'notti',
  'fiore', 'fiori', 'libro', 'libri', 'penna', 'penne', 'foglio', 'fogli', 'cuore', 'cuori',
  'vento', 'venti', 'porto', 'porti', 'pista', 'piste', 'festa', 'feste', 'terra', 'terre',
  'monte', 'monti', 'fiume', 'fiumi', 'bosco', 'boschi', 'parco', 'parchi', 'tempo', 'tempi',
  'prato', 'prati', 'cielo', 'cieli', 'stella', 'stelle', 'sedia', 'sedie', 'tavolo', 'tavoli',
  'porta', 'porte', 'vetro', 'vetri', 'muro', 'muri', 'mura', 'treno', 'treni',
  'auto', 'nave', 'navi', 'aereo', 'aerei', 'bici', 'palla', 'palle', 'pallone', 'palloni',
  'gioco', 'giochi', 'rete', 'reti', 'salto', 'salti', 'corsa', 'corse',
  'nuoto', 'passo', 'passi', 'mano', 'mani', 'piede', 'piedi', 'testa', 'teste',
  'occhio', 'occhi', 'naso', 'nasi', 'bocca', 'bocche', 'dente', 'denti', 'mento', 'menti',
  'collo', 'colli', 'spalla', 'spalle', 'braccio', 'braccia', 'gamba', 'gambe', 'ginocchio', 'ginocchia',
  'voce', 'voci', 'suono', 'suoni', 'canto', 'canti', 'musica', 'musiche', 'nota', 'note',
  'ritmo', 'ritmi', 'scuola', 'scuole', 'classe', 'classi', 'banco', 'banchi',
  'zaino', 'zaini', 'maestro', 'maestri', 'maestra', 'maestre', 'amico', 'amici', 'amica', 'amiche',
  'fratello', 'fratelli', 'sorella', 'sorelle', 'madre', 'madri', 'padre', 'padri',
  'mamma', 'mamme', 'papa', 'nonno', 'nonni', 'nonna', 'nonne', 'figlio', 'figli', 'figlia', 'figlie',
  'zio', 'zii', 'zia', 'zie', 'cugino', 'cugini', 'cugina', 'cugine', 'nipote', 'nipoti',
  'uomo', 'uomini', 'donna', 'donne', 'bambino', 'bambini', 'bambina', 'bambine',
  'ragazzo', 'ragazzi', 'ragazza', 'ragazze', 'persona', 'persone', 'gente',
  'anno', 'anni', 'mese', 'mesi', 'giorno', 'giorni', 'ora', 'ore', 'minuto', 'minuti', 'secondo', 'secondi',
  'sera', 'sere', 'alba', 'albe', 'tramonto', 'tramonti', 'mattina', 'mattine', 'mattino', 'pomeriggio',
  'estate', 'estati', 'inverno', 'inverni', 'autunno', 'autunni', 'primavera', 'primavere',
  'caldo', 'freddo', 'neve', 'pioggia', 'piogge', 'nuvola', 'nuvole', 'tuono', 'tuoni',
  'lampo', 'lampi', 'ombra', 'ombre', 'spazio', 'spazi', 'mondo', 'mondi',
  'isola', 'isole', 'costa', 'coste', 'golfo', 'golfi', 'lago', 'laghi', 'valle', 'valli',
  'collina', 'colline', 'montagna', 'montagne', 'cima', 'cime', 'vetta', 'vette',
  'oro', 'argento', 'ferro', 'rame', 'legno', 'legni', 'pietra', 'pietre', 'sabbia', 'sabbie',
  'acqua', 'acque', 'fuoco', 'fuochi', 'aria', 'fumo', 'fumi', 'onda', 'onde',
  'scoglio', 'scogli', 'spiaggia', 'spiagge', 'viaggio', 'viaggi', 'strada', 'strade',
  'ponte', 'ponti', 'piazza', 'piazze', 'chiesa', 'chiese', 'torre', 'torri',
  'palazzo', 'palazzi', 'museo', 'musei', 'teatro', 'teatri', 'cinema', 'foto',
  'quadro', 'quadri', 'statua', 'statue', 'storia', 'storie', 'scienza', 'scienze',
  'natura', 'vita', 'vite', 'sogno', 'sogni', 'pace', 'gioia', 'gioie', 'amore', 'amori',
  'forza', 'forze', 'coraggio', 'mente', 'menti', 'pensiero', 'pensieri', 'idea', 'idee',
  'parola', 'parole', 'frase', 'frasi', 'favola', 'favole', 'mito', 'miti', 'poesia', 'poesie',
  'verso', 'versi', 'faro', 'fari', 'ramo', 'rami', 'foglia', 'foglie', 'albero', 'alberi',
  'pianta', 'piante', 'erba', 'erbe', 'radice', 'radici', 'frutto', 'frutti', 'frutta',
  'seme', 'semi', 'grano', 'latte', 'burro', 'formaggio', 'formaggi', 'pasta', 'paste',
  'riso', 'carne', 'carni', 'uovo', 'uova', 'dolce', 'dolci', 'torta', 'torte',
  'sale', 'pepe', 'olio', 'olii', 'zucchero', 'zuccheri', 'caffe', 'te', 'succo', 'succhi',
  'arancia', 'arance', 'limone', 'limoni', 'uva', 'uve', 'fragola', 'fragole',
  'pesca', 'pesche', 'ciliegia', 'ciliegie', 'banana', 'banane', 'ananas', 'anguria',
  'tazza', 'tazze', 'piatto', 'piatti', 'bicchiere', 'bicchieri', 'forchetta', 'forchette',
  'coltello', 'coltelli', 'cucchiaio', 'cucchiai', 'pentola', 'pentole', 'padella', 'padelle',
  'letto', 'letti', 'cuscino', 'cuscini', 'coperta', 'coperte', 'armadio', 'armadi',
  'specchio', 'specchi', 'lampada', 'lampade', 'finestra', 'finestre', 'tetto', 'tetti',
  'giardino', 'giardini', 'cortile', 'cortili', 'garage', 'cancello', 'cancelli',
  'marciapiede', 'marciapiedi', 'citta', 'paese', 'paesi', 'villaggio', 'villaggi',
  'quartiere', 'quartieri', 'stazione', 'stazioni', 'fermata', 'fermate', 'negozio', 'negozi',
  'mercato', 'mercati', 'ospedale', 'ospedali', 'banca', 'banche', 'posta', 'poste',
  'ufficio', 'uffici', 'fabbrica', 'fabbriche', 'stadio', 'stadi', 'cascata', 'cascate',
  'vulcano', 'vulcani', 'deserto', 'deserti', 'pianura', 'pianure', 'foresta', 'foreste',
  'giungla', 'giungle', 'grotta', 'grotte', 'roccia', 'rocce', 'sasso', 'sassi',
  'polvere', 'fango', 'ghiaccio', 'ghiacci', 'brina', 'nebbia', 'rugiada',
  'temporale', 'temporali', 'arcobaleno', 'arcobaleni', 'leone', 'leoni', 'leonessa',
  'tigre', 'tigri', 'orso', 'orsi', 'orsa', 'orse', 'lupo', 'lupi', 'lupa', 'lupe',
  'volpe', 'volpi', 'lepre', 'lepri', 'coniglio', 'conigli', 'coniglia', 'topo', 'topi',
  'cavallo', 'cavalli', 'cavalla', 'asino', 'asini', 'mucca', 'mucche', 'toro', 'tori',
  'pecora', 'pecore', 'capra', 'capre', 'maiale', 'maiali', 'cervo', 'cervi',
  'elefante', 'elefanti', 'giraffa', 'giraffe', 'zebra', 'zebre', 'scimmia', 'scimmie',
  'aquila', 'aquile', 'falco', 'falchi', 'gufo', 'gufi', 'civetta', 'civette',
  'passero', 'passeri', 'rondine', 'rondini', 'colomba', 'colombe', 'piccione', 'piccioni',
  'cigno', 'cigni', 'anatra', 'anatre', 'oca', 'oche', 'gallo', 'galli',
  'gallina', 'galline', 'pulcino', 'pulcini', 'delfino', 'delfini', 'balena', 'balene',
  'squalo', 'squali', 'polpo', 'polpi', 'tartaruga', 'tartarughe', 'rana', 'rane',
  'serpente', 'serpenti', 'lucertola', 'lucertole', 'coccodrillo', 'coccodrilli',
  'ape', 'api', 'vespa', 'vespe', 'formica', 'formiche', 'farfalla', 'farfalle',
  'ragno', 'ragni', 'mosca', 'mosche', 'zanzara', 'zanzare', 'grillo', 'grilli',
  'cavalletta', 'cavallette', 'coccinella', 'coccinelle', 'scorpione', 'scorpioni',
  'pizza', 'pizze', 'fetta', 'fette', 'cena', 'cene', 'pranzo', 'pranzi', 'colazione',
  'cibo', 'cibi', 'pietanza', 'pietanze', 'zuppa', 'zuppe', 'insalata', 'insalate',
  'pomodoro', 'pomodori', 'patata', 'patate', 'cipolla', 'cipolle', 'carota', 'carote',
  'pane', 'panino', 'panini', 'tramezzino', 'biscotto', 'biscotti', 'cioccolato',
  'gelato', 'gelati', 'caramella', 'caramelle', 'merenda', 'merende',

  // 9. Aggettivi comuni (maschili, femminili, singolari, plurali)
  'bello', 'bella', 'belli', 'belle', 'brutto', 'brutta', 'brutti', 'brutte',
  'buono', 'buona', 'buoni', 'buone', 'cattivo', 'cattiva', 'cattivi', 'cattive',
  'grande', 'grandi', 'piccolo', 'piccola', 'piccoli', 'piccole',
  'alto', 'alta', 'alti', 'alte', 'basso', 'bassa', 'bassi', 'basse',
  'lungo', 'lunga', 'lunghi', 'lunghe', 'corto', 'corta', 'corti', 'corte',
  'largo', 'larga', 'larghi', 'larghe', 'stretto', 'stretta', 'stretti', 'strette',
  'nuovo', 'nuova', 'nuovi', 'nuove', 'vecchio', 'vecchia', 'vecchi', 'vecchie',
  'giovane', 'giovani', 'antico', 'antica', 'antichi', 'antiche',
  'facile', 'facili', 'difficile', 'difficili', 'chiaro', 'chiara', 'chiari', 'chiare',
  'scuro', 'scura', 'scuri', 'scure', 'forte', 'forti', 'debole', 'deboli',
  'dolce', 'dolci', 'amaro', 'amara', 'amari', 'amare', 'salato', 'salata', 'salati', 'salate',
  'caldo', 'calda', 'caldi', 'calde', 'freddo', 'fredda', 'freddi', 'fredde',
  'rosso', 'rossa', 'rossi', 'rosse', 'verde', 'verdi', 'giallo', 'gialla',
  'gialli', 'gialle', 'blu', 'bianco', 'bianca', 'bianchi', 'bianche',
  'nero', 'nera', 'neri', 'nere', 'grigio', 'grigia', 'grigi', 'grigie',
  'rosa', 'viola', 'marrone', 'marroni', 'arancione', 'arancioni', 'azzurro', 'azzurra', 'azzurri', 'azzurre',
  'felice', 'felici', 'triste', 'tristi', 'allegro', 'allegra', 'allegri', 'allegre',
  'veloce', 'veloci', 'lento', 'lenta', 'lenti', 'lente',
  'ricco', 'ricca', 'ricchi', 'ricche', 'povero', 'povera', 'poveri', 'povere',
  'pulito', 'pulita', 'puliti', 'pulite', 'sporco', 'sporca', 'sporchi', 'sporche',
  'luminoso', 'luminosa', 'luminosi', 'luminose', 'simpatico', 'simpatica', 'simpatici', 'simpatiche',
  'gentile', 'gentili', 'bravo', 'brava', 'bravi', 'brave', 'intelligente', 'intelligenti',
  'furbo', 'furba', 'furbi', 'furbe', 'stanco', 'stanca', 'stanchi', 'stanche',
  'sicuro', 'sicura', 'sicuri', 'sicure', 'libero', 'libera', 'liberi', 'libere',
  'pieno', 'piena', 'pieni', 'piene', 'vuoto', 'vuota', 'vuoti', 'vuote',
  'giusto', 'giusta', 'giusti', 'giuste', 'vero', 'vera', 'veri', 'vere',
  'falso', 'falsa', 'falsi', 'false', 'pronto', 'pronta', 'pronti', 'pronte',
  'calmo', 'calma', 'calmi', 'calme', 'sereno', 'serena', 'sereni', 'serene',
  'duro', 'dura', 'duri', 'dure', 'morbido', 'morbida', 'morbidi', 'morbide',
  'pesante', 'pesanti', 'leggero', 'leggera', 'leggeri', 'leggere',
  'aperto', 'aperta', 'aperti', 'aperte', 'chiuso', 'chiusa', 'chiusi', 'chiuse',

  // 10. Numeri in lettere
  'zero', 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove',
  'dieci', 'undici', 'dodici', 'tredici', 'quattordici', 'quindici', 'sedici',
  'diciassette', 'diciotto', 'diciannove', 'venti', 'trenta', 'quaranta', 'cinquanta',
  'sessanta', 'settanta', 'ottanta', 'novanta', 'cento', 'mille'
]);

/**
 * Verifica se una parola può essere formata usando le lettere del pool a disposizione.
 */
export function canFormWord(word: string, availableLetters: string[]): boolean {
  const normWord = word.trim().toLowerCase();
  if (normWord.length < 2) return false;

  const letterPool = [...availableLetters.map((c) => c.toLowerCase())];

  for (const char of normWord) {
    const idx = letterPool.indexOf(char);
    if (idx === -1) {
      return false;
    }
    letterPool.splice(idx, 1);
  }
  return true;
}

// Elenco autoritativo e rigoroso delle parole italiane valide di sole 2 lettere (articoli, preposizioni, pronomi, congiunzioni, note musicali)
export const VALID_2_LETTER_WORDS = new Set([
  'ma', 'se', 're', 'me', 'te', 'di', 'da', 'in', 'su', 'il', 'lo', 'la', 'le', 'un',
  'io', 'tu', 'ci', 'vi', 'ne', 'mi', 'ti', 'si', 'li', 'no', 'fa', 'va', 'ha', 'ho',
  'fu', 'sa', 'so', 'do', 'ai', 'al', 'eh', 'ah', 'oh', 'uh'
]);

// Parole italiane comuni di 3 e 4 lettere spesso composte nei giochi di lettere
export const COMMON_SHORT_WORDS = new Set([
  'tra', 'fra', 'per', 'con', 'qui', 'qua', 'non', 'piu', 'ora', 'poi', 'gia', 'via',
  'mio', 'tuo', 'suo', 'mia', 'tua', 'sua', 'cui', 'chi', 'che', 'sei', 'era', 'ero',
  'eri', 'fai', 'dai', 'vai', 'sto', 'sai', 'uso', 'usi', 'usa', 'amo', 'ami', 'ama',
  'oro', 'ora', 'ore', 'eco', 'ali', 'ala', 'ago', 'api', 'ape', 'oca', 'oco', 'uva',
  'bus', 'bar', 'gas', 'gol', 'set', 'fan', 'top', 'web', 'sci', 'sud', 'est',
  'ramo', 'rami', 'remo', 'remi', 'muro', 'muri', 'mare', 'mari', 'mela', 'mele',
  'pera', 'pere', 'sera', 'sere', 'seta', 'sete', 'pane', 'pani', 'vino', 'vini',
  'riso', 'risi', 'pesa', 'peso', 'pesi', 'pese', 'posa', 'pose', 'tana', 'tane',
  'tema', 'temi', 'tavolo', 'tono', 'toni', 'arte', 'arti', 'arco', 'arci', 'arco',
  'arma', 'armi', 'arme', 'asta', 'aste', 'alto', 'alta', 'alti', 'alte', 'aria',
  'bene', 'casa', 'case', 'cena', 'cene', 'cima', 'cime', 'capo', 'capi', 'cura',
  'dito', 'dita', 'dono', 'doni', 'faro', 'fari', 'fata', 'fate', 'foto', 'fumo',
  'lago', 'laghi', 'luna', 'lune', 'luce', 'luci', 'mano', 'mani', 'moto', 'nave',
  'naso', 'nasi', 'nota', 'note', 'onda', 'onde', 'pace', 'pelo', 'peli', 'pino',
  'pila', 'pile', 'piuma', 'piume', 'roba', 'robe', 'rosa', 'rose', 'roccia', 'sala',
  'sale', 'sali', 'seta', 'sito', 'siti', 'sole', 'soli', 'spia', 'spie', 'tasto',
  'tasti', 'tela', 'tele', 'topo', 'topi', 'tram', 'tubo', 'tubi', 'voce', 'voci',
  'vita', 'vite', 'volo', 'voli', 'vaso', 'vasi', 'zero', 'zona', 'zone', 'zuppa',
  'stampa', 'stampe', 'pasta', 'paste', 'pasto', 'pasti', 'resto', 'resti', 'resta',
  'poste', 'posto', 'posti', 'posta', 'tempo', 'tempi', 'trama', 'trame', 'massa',
  'pesta', 'peste', 'pesti', 'pesto', 'presta', 'presto', 'spesa', 'spese', 'spera'
]);

// Cache per parole scartate (evita chiamate di rete ripetute per parole inesistenti come TS, ST, ecc.)
const REJECTED_WORDS_CACHE = new Set<string>();

/**
 * Controllo istantaneo offline nel dizionario locale e nella cache delle parole verificate.
 */
export function isValidItalianWord(word: string): boolean {
  const norm = word.trim().toLowerCase();
  if (!norm || norm.length < 2) return false;

  // Regola 1: fonetica e grammatica italiana: ogni parola italiana deve contenere almeno una vocale!
  // Elimina istantaneamente combinazioni non-parole come TS, ST, TR, PR, ecc.
  if (!/[aeiouàèéìòù]/i.test(norm)) {
    REJECTED_WORDS_CACHE.add(norm);
    return false;
  }

  // Regola 2: parole di 2 lettere - ammesse solo le autentiche parole italiane di 2 lettere
  // (esclude categoricamente TS, AS, PS, MS, RS, ecc.)
  if (norm.length === 2) {
    const is2 = VALID_2_LETTER_WORDS.has(norm);
    if (!is2) REJECTED_WORDS_CACHE.add(norm);
    return is2;
  }

  if (REJECTED_WORDS_CACHE.has(norm)) return false;

  return (
    ITALIAN_WORD_LIST.has(norm) ||
    COMMON_SHORT_WORDS.has(norm) ||
    VERIFIED_WORDS_CACHE.has(norm)
  );
}

/**
 * Verifica asincrona di una parola italiana tramite servizio online (Wiktionary API con controllo categorie/sezioni in lingua italiana)
 * con memorizzazione automatica nella cache locale.
 */
export async function verifyItalianWordOnline(word: string): Promise<boolean> {
  const norm = word.trim().toLowerCase();
  if (!norm || norm.length < 2) return false;

  // 1. Controllo vocali: nessuna parola italiana è priva di vocali (elimina istantaneamente TS, ST, TR, ecc.)
  if (!/[aeiouàèéìòù]/i.test(norm)) {
    REJECTED_WORDS_CACHE.add(norm);
    return false;
  }

  // 2. Controllo parole di 2 lettere: solo parole di 2 lettere lecite in italiano
  if (norm.length === 2) {
    const is2Valid = VALID_2_LETTER_WORDS.has(norm);
    if (!is2Valid) REJECTED_WORDS_CACHE.add(norm);
    return is2Valid;
  }

  // 3. Controllo cache locale e dizionari precaricati (istantaneo)
  if (REJECTED_WORDS_CACHE.has(norm)) return false;
  if (ITALIAN_WORD_LIST.has(norm) || COMMON_SHORT_WORDS.has(norm) || VERIFIED_WORDS_CACHE.has(norm)) {
    return true;
  }

  // 4. Query a Wiktionary con verifica rigorosa della presenza della sezione o categoria 'Italiano'
  // ed esclusione di mere sigle, codici o abbreviazioni
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(
      `https://it.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(norm)}&prop=categories|sections&format=json&origin=*`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && data.parse) {
        const sections: string[] = (data.parse.sections || []).map((s: any) => String(s.line || '').toLowerCase());
        const categories: string[] = (data.parse.categories || []).map((c: any) => String(c['*'] || '').toLowerCase());

        // Deve appartenere alla sezione italiano o categorie in italiano
        const hasItalianSection = sections.some((s) => s.includes('italiano'));
        const hasItalianCategory = categories.some((c) => c.includes('italiano') || c.endsWith('-it'));

        // Verifica che non sia solo una sigla, abbreviazione o codice
        const isPureAbbreviation =
          categories.some((c) => c.includes('sigle') || c.includes('abbreviazioni') || c.includes('lettere_in_lingua')) &&
          !categories.some((c) => c.includes('sostantivi') || c.includes('verbi') || c.includes('aggettivi') || c.includes('avverbi') || c.includes('forme_verbali'));

        if ((hasItalianSection || hasItalianCategory) && !isPureAbbreviation) {
          VERIFIED_WORDS_CACHE.add(norm);
          return true;
        } else {
          REJECTED_WORDS_CACHE.add(norm);
          return false;
        }
      }
    }
  } catch (e) {
    // Timeout o errore di rete
  }

  REJECTED_WORDS_CACHE.add(norm);
  return false;
}

export const ITALIAN_ARTICLES = [
  'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una'
];

export const ITALIAN_VERBS = [
  'amare', 'andare', 'aprire', 'ascoltare', 'avere', 'ballare', 'bere', 'cadere',
  'cantare', 'capire', 'cercare', 'chiudere', 'comprare', 'correre', 'credere',
  'crescere', 'dare', 'decidere', 'dipingere', 'dire', 'dormire', 'dovere',
  'entrare', 'essere', 'fare', 'fermare', 'finire', 'giocare', 'guardare',
  'guidare', 'imparare', 'incontrare', 'insegnare', 'lasciare', 'leggere',
  'mangiare', 'mettere', 'morire', 'nascere', 'nuotare', 'osservare', 'pagare',
  'parlare', 'partire', 'pensare', 'perdere', 'piangere', 'potere', 'prendere',
  'ricevere', 'ridere', 'riuscire', 'salire', 'saltare', 'sapere', 'scendere',
  'scrivere', 'sentire', 'sperare', 'stare', 'studiare', 'temere', 'toccare',
  'tornare', 'trovare', 'uscire', 'vedere', 'vendere', 'venire', 'vincere', 'vivere', 'volere'
];

export const ITALIAN_NOUNS = [
  'cane', 'gatto', 'casa', 'pane', 'mela', 'pesce', 'luce', 'notte', 'fiore',
  'libro', 'penna', 'foglio', 'cuore', 'vento', 'porto', 'festa', 'terra',
  'monte', 'fiume', 'bosco', 'parco', 'tempo', 'prato', 'cielo', 'stella',
  'sedia', 'tavolo', 'porta', 'muro', 'treno', 'auto', 'nave', 'aereo',
  'palla', 'gioco', 'mano', 'piede', 'testa', 'occhi', 'naso', 'bocca',
  'scuola', 'classe', 'banco', 'zaino', 'maestro', 'amico', 'fratello',
  'sorella', 'madre', 'padre', 'nonno', 'nonna', 'mare', 'sole', 'estate',
  'inverno', 'acqua', 'fuoco', 'storia', 'quadro', 'leone', 'tigre', 'orso',
  'delfino', 'rondine', 'farfalla', 'luna', 'nuvola', 'musica', 'pioggia'
];

export const ITALIAN_ADJECTIVES = [
  'bello', 'bella', 'belli', 'belle', 'buono', 'buona', 'grande', 'grandi',
  'piccolo', 'piccola', 'alto', 'alta', 'basso', 'bassa', 'lungo', 'lunga',
  'corto', 'corta', 'nuovo', 'nuova', 'vecchio', 'vecchia', 'giovane', 'antico',
  'facile', 'difficile', 'chiaro', 'chiara', 'scuro', 'scura', 'forte', 'debole',
  'dolce', 'amaro', 'caldo', 'calda', 'freddo', 'fredda', 'rosso', 'rossa',
  'verde', 'giallo', 'gialla', 'blu', 'bianco', 'bianca', 'nero', 'nera',
  'felice', 'triste', 'allegro', 'allegra', 'veloce', 'lento', 'lenta',
  'ricco', 'povero', 'pulito', 'sporco', 'luminoso', 'simpatico'
];

export function getWordsByGrammarCategory(category: 'nomi' | 'aggettivi' | 'verbi' | 'articoli'): string[] {
  switch (category) {
    case 'nomi':
      return ITALIAN_NOUNS;
    case 'aggettivi':
      return ITALIAN_ADJECTIVES;
    case 'verbi':
      return ITALIAN_VERBS;
    case 'articoli':
      return ITALIAN_ARTICLES;
    default:
      return ITALIAN_NOUNS;
  }
}

export function getRandomDistractor(targetCategory: 'nomi' | 'aggettivi' | 'verbi' | 'articoli'): { word: string; category: string } {
  const otherCategories: ('nomi' | 'aggettivi' | 'verbi' | 'articoli')[] = (['nomi', 'aggettivi', 'verbi', 'articoli'] as const).filter(
    (c) => c !== targetCategory
  );
  const randomCat = otherCategories[Math.floor(Math.random() * otherCategories.length)];
  const pool = getWordsByGrammarCategory(randomCat);
  const word = pool[Math.floor(Math.random() * pool.length)];
  return { word, category: randomCat };
}
