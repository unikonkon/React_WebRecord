import { 
  addAudio as addIndexedDBAudio, 
  getUserAudios as getIndexedDBAudios, 
  getAudioById as getIndexedDBAudioById, 
  getAudioByShareableId as getIndexedDBAudioByShareableId, 
  updateAudio as updateIndexedDBAudio, 
  deleteAudio as deleteIndexedDBAudio, 
  generateShareableUrl as generateIndexedDBShareableUrl,
  saveTranscription as saveIndexedDBTranscription,
  createBlobUrl,
  AudioRecord,
  deleteAllUserAudios as deleteAllUserIndexedDBAudios
} from "@/lib/indexedDBService";

export type AudioMetadata = Omit<AudioRecord, 'fileBlob'>;

export type CreateAudioParams = {
  userId: string;
  name: string;
  description?: string;
  file: File | Blob;
  duration: number;
  format: string;
  deviceInfo?: string;
};

export type UploadExistingAudioParams = {
  userId: string;
  name: string;
  description?: string;
  file: File;
};

export type UpdateAudioParams = {
  id: string;
  name?: string;
  description?: string;
  isPublic?: boolean;
  expirationDate?: Date | null;
  transcription?: string;
};

// Save a new audio recording
export const saveAudio = async (params: CreateAudioParams): Promise<AudioMetadata> => {
  const { userId, name, description, file, duration, format, deviceInfo } = params;
  
  // Create blob URL for the file
  const fileUrl = createBlobUrl(file);
  
  // Save to IndexedDB
  const audioRecord = await addIndexedDBAudio({
    userId,
    name,
    description: description || "",
    fileBlob: file,
    fileUrl,
    duration,
    size: file.size,
    format,
    createdAt: new Date(),
    updatedAt: new Date(),
    deviceInfo: deviceInfo || navigator.userAgent,
    isPublic: false,
  });
  
  // Return metadata (excluding the blob)
  const { fileBlob, ...metadata } = audioRecord;
  return metadata;
};

// Upload existing audio file
export const uploadExistingAudio = async (params: UploadExistingAudioParams): Promise<AudioMetadata> => {
  const { userId, name, description, file } = params;
  
  // Create blob URL
  const fileUrl = createBlobUrl(file);
  
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.src = URL.createObjectURL(file);
    
    audio.addEventListener('loadedmetadata', async () => {
      const duration = audio.duration;
      
      // Save to IndexedDB
      const audioRecord = await addIndexedDBAudio({
        userId,
        name,
        description: description || "",
        fileBlob: file,
        fileUrl,
        duration,
        size: file.size,
        format: file.type,
        createdAt: new Date(),
        updatedAt: new Date(),
        deviceInfo: navigator.userAgent,
        isPublic: false,
      });
      
      // Return metadata (excluding the blob)
      const { fileBlob, ...metadata } = audioRecord;
      resolve(metadata);
    });
  });
};

// Get all audios for a specific user
export const getUserAudios = async (userId: string): Promise<AudioMetadata[]> => {
  const audios = await getIndexedDBAudios(userId);
  
  // Convert AudioRecord[] to AudioMetadata[] (exclude the blob)
  return audios.map(audio => {
    const { fileBlob, ...metadata } = audio;
    return metadata;
  });
};

// Get audio by ID
export const getAudioById = async (id: string): Promise<AudioMetadata | null> => {
  const audio = await getIndexedDBAudioById(id);
  
  if (!audio) {
    return null;
  }
  
  // Return metadata (excluding the blob)
  const { fileBlob, ...metadata } = audio;
  return metadata;
};

// Get audio by shareable ID
export const getAudioByShareableId = async (shareId: string): Promise<AudioMetadata | null> => {
  const audio = await getIndexedDBAudioByShareableId(shareId);
  
  if (!audio) {
    return null;
  }
  
  // Return metadata (excluding the blob)
  const { fileBlob, ...metadata } = audio;
  return metadata;
};

// Update audio metadata
export const updateAudio = async (params: UpdateAudioParams): Promise<void> => {
  const { id, ...updateData } = params;
  await updateIndexedDBAudio(id, updateData);
};

// Delete audio
export const deleteAudio = async (id: string): Promise<void> => {
  await deleteIndexedDBAudio(id);
};

// Generate a shareable URL for an audio
export const generateShareableUrl = async (id: string, expirationDays?: number): Promise<string> => {
  return generateIndexedDBShareableUrl(id, expirationDays);
};

// Upload transcription for an audio
export const saveTranscription = async (id: string, transcription: string): Promise<void> => {
  await saveIndexedDBTranscription(id, transcription);
};

// Delete all audios for a user
export const deleteAllUserAudios = async (userId: string): Promise<void> => {
  await deleteAllUserIndexedDBAudios(userId);
};
