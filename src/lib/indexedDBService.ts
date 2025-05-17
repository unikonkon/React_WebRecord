import { openDB, IDBPDatabase } from 'idb';

export interface AudioRecord {
  id: string;
  userId: string;
  name: string;
  description?: string;
  fileBlob: Blob;
  fileUrl: string;
  shareableUrl?: string;
  duration: number;
  size: number;
  format: string;
  createdAt: Date;
  updatedAt: Date;
  deviceInfo?: string;
  transcription?: string;
  isPublic: boolean;
  expirationDate?: Date;
}

const DB_NAME = 'web-record-db';
const DB_VERSION = 1;
const AUDIO_STORE = 'audios';

let dbPromise: Promise<IDBPDatabase> | null = null;

// Initialize the database
export const initDB = async (): Promise<IDBPDatabase> => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create a store of objects
        const store = db.createObjectStore(AUDIO_STORE, {
          // The 'id' property of the object will be the key
          keyPath: 'id',
          // If it isn't explicitly set, create a value
          autoIncrement: false,
        });
        
        // Create indexes
        store.createIndex('userId', 'userId', { unique: false });
        store.createIndex('shareableUrl', 'shareableUrl', { unique: true });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      },
    });
  }
  return dbPromise;
};

// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Create a URL from a Blob
export const createBlobUrl = (blob: Blob): string => {
  return URL.createObjectURL(blob);
};

// Add a new audio record
export const addAudio = async (audio: Omit<AudioRecord, 'id'>): Promise<AudioRecord> => {
  const db = await initDB();
  const id = generateId();
  const timestamp = new Date();
  
  const newAudio: AudioRecord = {
    ...audio,
    id,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  await db.put(AUDIO_STORE, newAudio);
  return newAudio;
};

// Get all audios for a user
export const getUserAudios = async (userId: string): Promise<AudioRecord[]> => {
  const db = await initDB();
  const index = db.transaction(AUDIO_STORE).store.index('userId');
  const audios = await index.getAll(userId);
  
  // Sort by createdAt in descending order (newest first)
  return audios.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// Get a single audio by ID
export const getAudioById = async (id: string): Promise<AudioRecord | undefined> => {
  const db = await initDB();
  return db.get(AUDIO_STORE, id);
};

// Get a single audio by shareableUrl
export const getAudioByShareableId = async (shareId: string): Promise<AudioRecord | undefined> => {
  const db = await initDB();
  const index = db.transaction(AUDIO_STORE).store.index('shareableUrl');
  const audio = await index.get(shareId);
  
  // Check if audio exists and is not expired
  if (audio && audio.expirationDate && audio.expirationDate < new Date()) {
    return undefined;
  }
  
  return audio;
};

// Update an audio record
export const updateAudio = async (id: string, updates: Partial<AudioRecord>): Promise<void> => {
  const db = await initDB();
  const audio = await db.get(AUDIO_STORE, id);
  
  if (!audio) {
    throw new Error("Audio not found");
  }
  
  const updatedAudio = {
    ...audio,
    ...updates,
    updatedAt: new Date()
  };
  
  await db.put(AUDIO_STORE, updatedAudio);
};

// Delete an audio record
export const deleteAudio = async (id: string): Promise<void> => {
  const db = await initDB();
  const audio = await db.get(AUDIO_STORE, id);
  
  if (!audio) {
    throw new Error("Audio not found");
  }
  
  // Revoke the Blob URL to free memory
  if (audio.fileUrl.startsWith('blob:')) {
    URL.revokeObjectURL(audio.fileUrl);
  }
  
  await db.delete(AUDIO_STORE, id);
};

// Generate a shareable URL
export const generateShareableUrl = async (id: string, expirationDays?: number): Promise<string> => {
  const db = await initDB();
  const audio = await db.get(AUDIO_STORE, id);
  
  if (!audio) {
    throw new Error("Audio not found");
  }
  
  // Generate a random ID for sharing
  const shareId = generateId();
  
  let updates: Partial<AudioRecord> = {
    shareableUrl: shareId,
    isPublic: true,
  };
  
  // Add expiration if provided
  if (expirationDays) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + expirationDays);
    updates.expirationDate = expirationDate;
  }
  
  await updateAudio(id, updates);
  
  return shareId;
};

// Save transcription
export const saveTranscription = async (id: string, transcription: string): Promise<void> => {
  await updateAudio(id, { transcription });
};

// Initialize DB when the module loads
initDB().catch(console.error); 