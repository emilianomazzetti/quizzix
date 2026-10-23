import { ref, onValue, set, get, update, onDisconnect, remove } from 'firebase/database';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { rtdb, db, auth } from './firebase';
import {
  RoomState,
  Player,
  Question,
  AnswerSubmission,
  DrawingSubmission,
  GamePhase
} from '../types/quiz';
import { INITIAL_QUESTIONS } from '../data/initialQuestions';

export interface FirebaseDiagnosticResult {
  initialized: boolean;
  rtdbConnected: boolean;
  writeSuccess: boolean;
  authStatus: 'authenticated' | 'anonymous' | 'none';
  latencyMs: number;
  errorMessage?: string;
  projectId: string;
  databaseUrl: string;
}

let isFirebaseConnected = false;
let isAuthReady = false;
let authUid: string | null = null;
const connectionListeners: ((connected: boolean) => void)[] = [];

function notifyConnectionChange(connected: boolean) {
  isFirebaseConnected = connected;
  connectionListeners.forEach((fn) => {
    try {
      fn(connected);
    } catch (e) {
      console.warn('Connection listener error:', e);
    }
  });
}

// Listen to native Firebase RTDB connection state
if (typeof window !== 'undefined') {
  try {
    const connectedRef = ref(rtdb, '.info/connected');
    onValue(connectedRef, (snap) => {
      const val = !!snap.val();
      notifyConnectionChange(val);
    });
  } catch (e) {
    console.warn('Could not attach .info/connected listener:', e);
  }

  try {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        isAuthReady = true;
        authUid = user.uid;
      }
    });

    signInAnonymously(auth).catch((err) => {
      console.warn('Firebase anonymous auth note:', err.message);
    });
  } catch (e) {
    console.warn('Firebase auth initialization note:', e);
  }
}

function cleanPayload(obj: any): any {
  return JSON.parse(JSON.stringify(obj));
}

export function sanitizeRoomState(data: any, fallback?: RoomState): RoomState {
  if (!data || typeof data !== 'object') {
    return fallback || ({
      roomCode: 'FLIP-101',
      roomName: 'Classe 3B • Scienze e Storia',
      phase: 'lobby',
      currentQuestionIndex: 0,
      questions: INITIAL_QUESTIONS,
      players: {},
      answersThisTurn: {},
      drawingsThisTurn: {},
      turnStartTime: 0,
      turnDuration: 25,
      settings: {
        basePoints: 50,
        fastFingerBonus1: 20,
        fastFingerBonus2: 15,
        fastFingerBonus3: 10,
        defaultTimeLimit: 25,
        soundEnabled: true
      }
    } as RoomState);
  }

  const rawQuestions = Array.isArray(data.questions)
    ? data.questions
    : (data.questions && typeof data.questions === 'object' ? Object.values(data.questions) : null);

  const initialQuestions: Question[] = rawQuestions !== null
    ? (rawQuestions as Question[])
    : (fallback?.questions || []);

  const questions: Question[] = initialQuestions.map((q) => {
    if (!q || typeof q !== 'object') return q;
    if (q.type === 'fill_blanks' && q.content) {
      const c = q.content as any;
      let blanks = Array.isArray(c.blanks)
        ? c.blanks
        : (c.blanks && typeof c.blanks === 'object' ? Object.values(c.blanks) : []);
      if ((!blanks || blanks.length === 0) && c.blankWord) {
        blanks = [{
          id: 'b-0',
          correctWord: c.blankWord,
          distractors: Array.isArray(c.distractors) ? c.distractors : (c.distractors && typeof c.distractors === 'object' ? Object.values(c.distractors) : [])
        }];
      }
      return {
        ...q,
        content: {
          ...c,
          blanks
        }
      };
    }
    return q;
  });

  const curIndex = typeof data.currentQuestionIndex === 'number' && data.currentQuestionIndex >= 0
    ? Math.min(data.currentQuestionIndex, Math.max(0, (questions.length || 1) - 1))
    : 0;

  // Normalize drawings to guarantee votes array
  const rawDrawings = (data.drawingsThisTurn && typeof data.drawingsThisTurn === 'object') ? data.drawingsThisTurn : {};
  const normalizedDrawings: Record<string, DrawingSubmission> = {};
  for (const [k, d] of Object.entries(rawDrawings)) {
    if (d && typeof d === 'object') {
      const item = d as any;
      normalizedDrawings[k] = {
        playerId: item.playerId || k,
        playerName: item.playerName || 'Studente',
        dataUrl: item.dataUrl || '',
        votes: Array.isArray(item.votes) ? item.votes : []
      };
    }
  }

  return {
    roomCode: typeof data.roomCode === 'string' ? data.roomCode : (fallback?.roomCode || 'FLIP-101'),
    roomName: typeof data.roomName === 'string' ? data.roomName : (fallback?.roomName || 'Classe 3B • Scienze e Storia'),
    phase: typeof data.phase === 'string' ? data.phase : (fallback?.phase || 'lobby'),
    currentQuestionIndex: curIndex,
    questions,
    players: (data.players && typeof data.players === 'object') ? data.players : (fallback?.players || {}),
    answersThisTurn: (data.answersThisTurn && typeof data.answersThisTurn === 'object') ? data.answersThisTurn : {},
    drawingsThisTurn: normalizedDrawings,
    turnStartTime: typeof data.turnStartTime === 'number' ? data.turnStartTime : 0,
    turnDuration: typeof data.turnDuration === 'number' ? data.turnDuration : 25,
    resetEpoch: typeof data.resetEpoch === 'number' ? data.resetEpoch : fallback?.resetEpoch,
    kickedPlayerIds: Array.isArray(data.kickedPlayerIds) ? data.kickedPlayerIds : (fallback?.kickedPlayerIds || []),
    settings: {
      basePoints: data.settings?.basePoints ?? fallback?.settings?.basePoints ?? 50,
      fastFingerBonus1: data.settings?.fastFingerBonus1 ?? fallback?.settings?.fastFingerBonus1 ?? 20,
      fastFingerBonus2: data.settings?.fastFingerBonus2 ?? fallback?.settings?.fastFingerBonus2 ?? 15,
      fastFingerBonus3: data.settings?.fastFingerBonus3 ?? fallback?.settings?.fastFingerBonus3 ?? 10,
      defaultTimeLimit: data.settings?.defaultTimeLimit ?? fallback?.settings?.defaultTimeLimit ?? 25,
      soundEnabled: data.settings?.soundEnabled ?? fallback?.settings?.soundEnabled ?? true
    }
  };
}

export const firebaseSync = {
  // Check live connection state
  isConnected(): boolean {
    return isFirebaseConnected;
  },

  // Subscribe to connection state changes
  listenToConnection(callback: (connected: boolean) => void): () => void {
    connectionListeners.push(callback);
    callback(isFirebaseConnected);
    return () => {
      const idx = connectionListeners.indexOf(callback);
      if (idx !== -1) connectionListeners.splice(idx, 1);
    };
  },

  // Initialize room in Firebase RTDB if not existing yet
  async initRoom(defaultState: RoomState): Promise<RoomState> {
    const cleanCode = defaultState.roomCode.replace(/[^a-zA-Z0-9_-]/g, '');
    try {
      const roomRef = ref(rtdb, `rooms/${cleanCode}`);
      const snap = await get(roomRef);
      if (snap.exists()) {
        const data = snap.val();
        if (data && data.phase) {
          notifyConnectionChange(true);
          const sanitized = sanitizeRoomState(data, defaultState);
          return sanitized;
        }
      }
      // If room doesn't exist, create it with initial questions & state
      const payload = cleanPayload(defaultState);
      await set(roomRef, payload);
      notifyConnectionChange(true);
      return defaultState;
    } catch (err) {
      console.warn('Firebase initRoom failed, using default state:', err);
      return defaultState;
    }
  },

  // Subscribe to real-time room changes in Firebase RTDB
  listenToRoom(roomCode: string, onUpdate: (state: RoomState) => void, fallbackState?: RoomState): () => void {
    const cleanCode = roomCode.replace(/[^a-zA-Z0-9_-]/g, '');

    try {
      const roomRef = ref(rtdb, `rooms/${cleanCode}`);
      const unsubscribeRtdb = onValue(
        roomRef,
        (snapshot) => {
          if (snapshot.exists()) {
            notifyConnectionChange(true);
            const data = snapshot.val();
            if (data && data.phase) {
              const sanitized = sanitizeRoomState(data, fallbackState);
              onUpdate(sanitized);
            }
          }
        },
        (error) => {
          console.warn('Realtime Database listener note:', error.message);
          this.listenToFirestore(cleanCode, onUpdate, fallbackState);
        }
      );

      return () => {
        unsubscribeRtdb();
      };
    } catch (e) {
      console.warn('Firebase RTDB error, falling back to Firestore:', e);
      return this.listenToFirestore(cleanCode, onUpdate, fallbackState);
    }
  },

  listenToFirestore(roomCode: string, onUpdate: (state: RoomState) => void, fallbackState?: RoomState): () => void {
    try {
      const roomDoc = doc(db, 'rooms', roomCode);
      const unsub = onSnapshot(
        roomDoc,
        (snapshot) => {
          if (snapshot.exists()) {
            notifyConnectionChange(true);
            const data = snapshot.data();
            if (data && data.phase) {
              const sanitized = sanitizeRoomState(data, fallbackState);
              onUpdate(sanitized);
            }
          }
        },
        (error) => {
          console.warn('Firestore snapshot note:', error.message);
        }
      );
      return unsub;
    } catch (e) {
      console.warn('Firestore fallback not active:', e);
      return () => {};
    }
  },

  // Push complete room state to Firebase
  async pushRoomState(state: RoomState): Promise<boolean> {
    const cleanCode = state.roomCode.replace(/[^a-zA-Z0-9_-]/g, '');
    const payload = cleanPayload(state);

    let success = false;
    try {
      const roomRef = ref(rtdb, `rooms/${cleanCode}`);
      await set(roomRef, payload);
      notifyConnectionChange(true);
      success = true;
    } catch (e) {
      try {
        const roomDoc = doc(db, 'rooms', cleanCode);
        await setDoc(roomDoc, payload, { merge: true });
        notifyConnectionChange(true);
        success = true;
      } catch (err) {
        console.warn('Firebase sync write note:', (err as any)?.message);
      }
    }
    return success;
  },

  // Student joining room: register player in Firebase
  async joinPlayer(roomCode: string, player: Player): Promise<boolean> {
    const cleanCode = roomCode.replace(/[^a-zA-Z0-9_-]/g, '');
    try {
      const playerRef = ref(rtdb, `rooms/${cleanCode}/players/${player.id}`);
      await set(playerRef, cleanPayload(player));
      notifyConnectionChange(true);
      return true;
    } catch (e) {
      console.warn('joinPlayer error:', e);
      return false;
    }
  },

  // Student leaves or closes browser explicitly
  async removePlayer(roomCode: string, playerId: string): Promise<boolean> {
    const cleanCode = roomCode.replace(/[^a-zA-Z0-9_-]/g, '');
    try {
      const playerRef = ref(rtdb, `rooms/${cleanCode}/players/${playerId}`);
      await remove(playerRef);
      return true;
    } catch (e) {
      console.warn('removePlayer error:', e);
      return false;
    }
  },

  // Student submitting question: add to repository
  async submitQuestion(roomCode: string, question: Question): Promise<boolean> {
    const cleanCode = roomCode.replace(/[^a-zA-Z0-9_-]/g, '');
    try {
      const questionsRef = ref(rtdb, `rooms/${cleanCode}/questions`);
      const snap = await get(questionsRef);
      const existing: Question[] = snap.exists() ? snap.val() : [];
      const updated = [cleanPayload(question), ...existing];
      await set(questionsRef, updated);
      notifyConnectionChange(true);
      return true;
    } catch (e) {
      console.warn('submitQuestion error:', e);
      return false;
    }
  },

  // Student answering: register answer & award points
  async submitAnswer(
    roomCode: string,
    submission: AnswerSubmission,
    pointsAwarded: number,
    isCorrect: boolean
  ): Promise<boolean> {
    const cleanCode = roomCode.replace(/[^a-zA-Z0-9_-]/g, '');
    try {
      // 1. Record answer in answersThisTurn
      const answerRef = ref(
        rtdb,
        `rooms/${cleanCode}/answersThisTurn/${submission.playerId}`
      );
      await set(answerRef, cleanPayload(submission));

      // 2. Update player's score and streak in Firebase
      const playerRef = ref(rtdb, `rooms/${cleanCode}/players/${submission.playerId}`);
      const snap = await get(playerRef);
      if (snap.exists()) {
        const player = snap.val() as Player;
        const newScore = (player.score || 0) + pointsAwarded;
        const newStreak = isCorrect ? (player.streak || 0) + 1 : 0;
        await update(playerRef, { score: newScore, streak: newStreak });
      } else {
        // If player was not in Firebase, create player record
        await set(playerRef, {
          id: submission.playerId,
          name: submission.playerName,
          avatar: '🚀',
          score: pointsAwarded,
          streak: isCorrect ? 1 : 0,
          isSimulated: false
        });
      }

      notifyConnectionChange(true);
      return true;
    } catch (e) {
      console.warn('submitAnswer Firebase error:', e);
      return false;
    }
  },

  // Student saving drawing for Draw & Vote
  async saveDrawing(roomCode: string, drawing: DrawingSubmission): Promise<boolean> {
    const cleanCode = roomCode.replace(/[^a-zA-Z0-9_-]/g, '');
    try {
      const drawRef = ref(
        rtdb,
        `rooms/${cleanCode}/drawingsThisTurn/${drawing.playerId}`
      );
      await set(drawRef, cleanPayload(drawing));
      notifyConnectionChange(true);
      return true;
    } catch (e) {
      console.warn('saveDrawing Firebase error:', e);
      return false;
    }
  },

  // Student voting for peer drawing
  async voteDrawing(
    roomCode: string,
    voterId: string,
    artistId: string
  ): Promise<boolean> {
    const cleanCode = roomCode.replace(/[^a-zA-Z0-9_-]/g, '');
    try {
      const votesRef = ref(
        rtdb,
        `rooms/${cleanCode}/drawingsThisTurn/${artistId}/votes`
      );
      const snap = await get(votesRef);
      const currentVotes: string[] = snap.exists() ? snap.val() || [] : [];
      if (!currentVotes.includes(voterId)) {
        const updatedVotes = [...currentVotes, voterId];
        await set(votesRef, updatedVotes);

        // Award +25 points to the artist
        const artistRef = ref(rtdb, `rooms/${cleanCode}/players/${artistId}`);
        const artistSnap = await get(artistRef);
        if (artistSnap.exists()) {
          const artist = artistSnap.val() as Player;
          await update(artistRef, { score: (artist.score || 0) + 25 });
        }
      }
      notifyConnectionChange(true);
      return true;
    } catch (e) {
      console.warn('voteDrawing Firebase error:', e);
      return false;
    }
  },

  // Change game phase (e.g. lobby -> question_intro -> question_active -> question_results -> leaderboard -> podium)
  async setPhase(
    roomCode: string,
    phase: GamePhase,
    currentQuestionIndex?: number,
    turnDuration?: number
  ): Promise<boolean> {
    const cleanCode = roomCode.replace(/[^a-zA-Z0-9_-]/g, '');
    try {
      const updates: any = {
        phase
      };

      if (currentQuestionIndex !== undefined) {
        updates.currentQuestionIndex = currentQuestionIndex;
      }

      if (phase === 'question_intro' || phase === 'question_active') {
        updates.turnStartTime = Date.now();
        if (turnDuration) updates.turnDuration = turnDuration;
      }

      // Reset turn answers & drawings when starting intro or active question
      if (phase === 'question_intro') {
        const answersRef = ref(rtdb, `rooms/${cleanCode}/answersThisTurn`);
        const drawingsRef = ref(rtdb, `rooms/${cleanCode}/drawingsThisTurn`);
        await set(answersRef, null);
        await set(drawingsRef, null);
      }

      const roomRef = ref(rtdb, `rooms/${cleanCode}`);
      await update(roomRef, updates);
      notifyConnectionChange(true);
      return true;
    } catch (e) {
      console.warn('setPhase Firebase error:', e);
      return false;
    }
  },

  // Reset room to lobby
  async resetRoom(roomCode: string): Promise<boolean> {
    const cleanCode = roomCode.replace(/[^a-zA-Z0-9_-]/g, '');
    try {
      const roomRef = ref(rtdb, `rooms/${cleanCode}`);
      await update(roomRef, {
        phase: 'lobby',
        currentQuestionIndex: 0
      });
      await set(ref(rtdb, `rooms/${cleanCode}/answersThisTurn`), null);
      await set(ref(rtdb, `rooms/${cleanCode}/drawingsThisTurn`), null);
      notifyConnectionChange(true);
      return true;
    } catch (e) {
      console.warn('resetRoom Firebase error:', e);
      return false;
    }
  },

  // Completely wipe room database from Firebase and re-initialize
  async wipeRoomDatabase(roomCode: string, freshState: RoomState): Promise<boolean> {
    const cleanCode = roomCode.replace(/[^a-zA-Z0-9_-]/g, '');
    try {
      const roomRef = ref(rtdb, `rooms/${cleanCode}`);
      // 1. Completely delete existing room node in Firebase RTDB
      await set(roomRef, null);
      // 2. Re-create clean initial room state
      const payload = cleanPayload(freshState);
      await set(roomRef, payload);
      notifyConnectionChange(true);
      return true;
    } catch (e) {
      console.warn('wipeRoomDatabase error:', e);
      return false;
    }
  },

  // Interactive Live Diagnostic Test
  async runDiagnostic(): Promise<FirebaseDiagnosticResult> {
    const start = performance.now();
    let writeSuccess = false;
    let rtdbConnected = false;
    let errorMessage: string | undefined = undefined;

    const projectId = 'gioco-multi-utente';
    const databaseUrl =
      'https://gioco-multi-utente-default-rtdb.europe-west1.firebasedatabase.app';

    try {
      // 1. Write ping to test_connection
      const pingRef = ref(rtdb, 'diagnostic_ping');
      const testTimestamp = Date.now();

      await set(pingRef, {
        timestamp: testTimestamp,
        client: 'FlipQuiz Classroom WebApp',
        status: 'OK'
      });

      // 2. Read it back
      const snap = await get(pingRef);
      if (snap.exists() && snap.val()?.timestamp === testTimestamp) {
        writeSuccess = true;
        rtdbConnected = true;
        notifyConnectionChange(true);
      }
    } catch (err: any) {
      console.error('Firebase diagnostic error:', err);
      errorMessage = err?.message || String(err);

      try {
        const testDoc = doc(db, 'system', 'ping');
        await setDoc(testDoc, { ping: Date.now() });
        writeSuccess = true;
        rtdbConnected = true;
        errorMessage = undefined;
        notifyConnectionChange(true);
      } catch (fErr: any) {
        errorMessage = fErr?.message || errorMessage;
      }
    }

    const end = performance.now();
    const latencyMs = Math.round(end - start);

    return {
      initialized: true,
      rtdbConnected: writeSuccess || isFirebaseConnected,
      writeSuccess,
      authStatus: auth.currentUser ? 'authenticated' : 'none',
      latencyMs,
      errorMessage,
      projectId,
      databaseUrl
    };
  }
};
