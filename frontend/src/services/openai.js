const MAX_CHARS = 4096;

export const splitTextIntoChunks = (text, maxChars = MAX_CHARS) => {
  const chunks = [];
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  let currentChunk = '';

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();

    if (trimmedSentence.length > maxChars) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }

      const words = trimmedSentence.split(/\s+/);
      let wordChunk = '';

      for (const word of words) {
        if ((wordChunk + ' ' + word).length > maxChars) {
          if (wordChunk.trim()) {
            chunks.push(wordChunk.trim());
          }
          wordChunk = word;
        } else {
          wordChunk += (wordChunk ? ' ' : '') + word;
        }
      }

      if (wordChunk.trim()) {
        chunks.push(wordChunk.trim());
      }
    } else {
      if ((currentChunk + ' ' + trimmedSentence).length > maxChars) {
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = trimmedSentence;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + trimmedSentence;
      }
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
};

export const transcribeAudio = async (apiKey, file, signal) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('model', 'whisper-1');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    },
    body: formData,
    signal
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Transcription failed');
  }

  return await response.json();
};

export const generateSpeechChunk = async (apiKey, text, voice, model, signal) => {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      input: text,
      voice,
      response_format: 'mp3'
    }),
    signal
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Speech generation failed');
  }

  return await response.arrayBuffer();
};

export const concatenateAudioBuffers = async (audioBuffers) => {
  const totalLength = audioBuffers.reduce((sum, buffer) => sum + buffer.byteLength, 0);
  const result = new Uint8Array(totalLength);

  let offset = 0;
  for (const buffer of audioBuffers) {
    result.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  }

  return result.buffer;
};

export const generateSpeech = async (apiKey, text, voice, model, signal, onProgress) => {
  if (text.length > MAX_CHARS) {
    const chunks = splitTextIntoChunks(text);
    let completedChunks = 0;

    const audioBufferPromises = chunks.map(async (chunk, index) => {
      const buffer = await generateSpeechChunk(apiKey, chunk, voice, model, signal);

      completedChunks++;
      if (onProgress) {
        onProgress(completedChunks, chunks.length);
      }

      return buffer;
    });

    const audioBuffers = await Promise.all(audioBufferPromises);
    const concatenatedBuffer = await concatenateAudioBuffers(audioBuffers);

    return new Blob([concatenatedBuffer], { type: 'audio/mpeg' });
  } else {
    if (onProgress) {
      onProgress(0, 1);
    }

    const buffer = await generateSpeechChunk(apiKey, text, voice, model, signal);

    if (onProgress) {
      onProgress(1, 1);
    }

    return new Blob([buffer], { type: 'audio/mpeg' });
  }
};
