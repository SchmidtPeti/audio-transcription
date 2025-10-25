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

// Upload file to catbox.moe and get shareable link
const uploadToFileIO = async (file) => {
  const formData = new FormData()
  formData.append('reqtype', 'fileupload')
  formData.append('fileToUpload', file)

  try {
    const response = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Upload service responded with status: ${response.status}`)
    }

    // catbox.moe returns the direct URL as plain text
    const url = await response.text()
    console.log('catbox.moe response URL:', url)

    if (url && url.startsWith('https://')) {
      return url.trim()
    } else {
      console.error('Unexpected catbox.moe response:', url)
      throw new Error('Failed to get download URL from upload service')
    }
  } catch (error) {
    console.error('File upload error:', error)
    throw error
  }
}

export const sendTranscriptionEmail = async (transcription, audioFile, pin, customEmail = null) => {
  if (!validatePin(pin)) {
    throw new Error('Invalid PIN. Please enter the correct PIN to send email.')
  }

  // Initialize EmailJS
  emailjs.init(EMAILJS_PUBLIC_KEY)

  // Prepare email parameters
  const templateParams = {
    to_email: customEmail || DEFAULT_EMAIL,
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

export const sendAudioEmail = async (audioFile, audioUrl, settings, pin, customEmail = null) => {
  if (!validatePin(pin)) {
    throw new Error('Invalid PIN. Please enter the correct PIN to send email.')
  }

  emailjs.init(EMAILJS_PUBLIC_KEY)

  // Upload file to catbox.moe and get shareable link
  let downloadLink = 'Not available'
  let uploadError = null

  try {
    console.log('Uploading file to catbox.moe...', audioFile)
    downloadLink = await uploadToFileIO(audioFile)
    console.log('Upload successful! Link:', downloadLink)
  } catch (error) {
    console.error('Failed to upload file:', error)
    uploadError = error.message
    // Continue with email even if upload fails
  }

  const message = uploadError
    ? `Generated audio file from text.\n\nSettings:\n- Voice: ${settings.voice}\n- Quality: ${settings.quality}\n\n⚠️ File upload failed: ${uploadError}\nPlease contact support or try again.`
    : `Generated audio file from text.\n\nSettings:\n- Voice: ${settings.voice}\n- Quality: ${settings.quality}\n\nDownload Link: ${downloadLink}\n\nClick the link above to download your audio file.`

  const templateParams = {
    to_email: customEmail || DEFAULT_EMAIL,
    from_name: 'Audio Transcription App',
    message: message,
    file_name: audioFile?.name || 'generated-audio.mp3',
    file_size: audioFile ? `${(audioFile.size / 1024).toFixed(2)} KB` : 'N/A',
    timestamp: new Date().toLocaleString(),
    download_link: downloadLink,
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
