import emailjs from '@emailjs/browser'

const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const DEFAULT_EMAIL = import.meta.env.VITE_EMAIL_TO

// Simple PIN protection - only you know this PIN
const VALID_PIN = import.meta.env.VITE_EMAIL_PIN

export const validatePin = (pin) => {
  return pin === VALID_PIN
}

export const sendTranscriptionEmail = async (transcription, audioFile, pin) => {
  if (!validatePin(pin)) {
    throw new Error('Invalid PIN. Please enter the correct PIN to send email.')
  }

  // Initialize EmailJS
  emailjs.init(EMAILJS_PUBLIC_KEY)

  // Prepare email parameters
  const templateParams = {
    to_email: DEFAULT_EMAIL,
    from_name: 'Audio Transcription App',
    message: transcription.length > 3000
      ? `${transcription.substring(0, 3000)}...\n\n[Transcription too long - see attachment]`
      : transcription,
    file_name: audioFile?.name || 'No file',
    file_size: audioFile ? `${(audioFile.size / 1024).toFixed(2)} KB` : 'N/A',
    timestamp: new Date().toLocaleString(),
  }

  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    )
    return response
  } catch (error) {
    console.error('EmailJS Error:', error)
    throw new Error(`Failed to send email: ${error.text || error.message}`)
  }
}

export const sendAudioEmail = async (audioFile, audioUrl, settings, pin) => {
  if (!validatePin(pin)) {
    throw new Error('Invalid PIN. Please enter the correct PIN to send email.')
  }

  emailjs.init(EMAILJS_PUBLIC_KEY)

  const templateParams = {
    to_email: DEFAULT_EMAIL,
    from_name: 'Audio Transcription App',
    message: `Generated audio file from text.\n\nSettings:\n- Voice: ${settings.voice}\n- Quality: ${settings.quality}`,
    file_name: audioFile?.name || 'generated-audio.mp3',
    file_size: audioFile ? `${(audioFile.size / 1024).toFixed(2)} KB` : 'N/A',
    timestamp: new Date().toLocaleString(),
    audio_url: audioUrl, // If you want to include download link
  }

  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    )
    return response
  } catch (error) {
    console.error('EmailJS Error:', error)
    throw new Error(`Failed to send email: ${error.text || error.message}`)
  }
}
