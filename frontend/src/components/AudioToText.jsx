import { useState, useRef } from 'react'
import { Button, Card, CardBody, Progress, Chip } from '@nextui-org/react'
import { transcribeAudio } from '../services/openai'

const AudioToText = ({ apiKey }) => {
  const [file, setFile] = useState(null)
  const [transcription, setTranscription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)
  const abortControllerRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (selectedFile) => {
    const validTypes = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm', 'audio/m4a', 'audio/x-m4a']
    const validExtensions = ['.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm']

    const isValidType = validTypes.some(type => selectedFile.type === type)
    const isValidExtension = validExtensions.some(ext => selectedFile.name.toLowerCase().endsWith(ext))

    if (!isValidType && !isValidExtension) {
      alert('Please select a valid audio file')
      return
    }

    if (selectedFile.size > 25 * 1024 * 1024) {
      alert('File size must be less than 25MB')
      return
    }

    setFile(selectedFile)
    setTranscription('')
  }

  const handleTranscribe = async () => {
    if (!file || !apiKey) return

    abortControllerRef.current = new AbortController()
    setIsLoading(true)
    setProgress(50)

    try {
      const result = await transcribeAudio(apiKey, file, abortControllerRef.current.signal)
      setProgress(100)
      setTranscription(result.text)
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Transcription cancelled')
      } else {
        alert(error.message || 'Failed to transcribe audio')
      }
    } finally {
      setIsLoading(false)
      setProgress(0)
      abortControllerRef.current = null
    }
  }

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(transcription)
      .then(() => alert('Copied to clipboard!'))
      .catch(() => alert('Failed to copy'))
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="py-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Transcribe Audio to Text</h2>
        <p className="text-sm text-gray-600">Upload an audio file and get accurate text transcription</p>
      </div>

      {/* Upload Zone */}
      {!file ? (
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-primary bg-primary-50'
              : 'border-gray-300 hover:border-primary hover:bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-6xl mb-4">📁</div>
          <p className="text-lg font-semibold mb-2">Drag & drop audio file here</p>
          <p className="text-sm text-gray-500 mb-4">or click to browse</p>
          <p className="text-xs text-gray-400">Supported: MP3, MP4, MPEG, MPGA, M4A, WAV, WEBM</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">🎵</span>
                <div>
                  <p className="font-semibold">{file.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                color="danger"
                onPress={() => {
                  setFile(null)
                  setTranscription('')
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
              >
                ✕
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Progress */}
      {isLoading && (
        <Card className="bg-primary-50">
          <CardBody className="gap-3">
            <Progress value={progress} color="primary" className="max-w-full" />
            <p className="text-sm text-center font-medium text-primary">
              {progress < 100 ? 'Transcribing audio...' : 'Processing response...'}
            </p>
          </CardBody>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          color="primary"
          size="lg"
          className="flex-1"
          isDisabled={!file || isLoading}
          onPress={handleTranscribe}
        >
          Transcribe Audio
        </Button>
        {isLoading && (
          <Button
            color="danger"
            size="lg"
            variant="flat"
            onPress={handleCancel}
          >
            ✕ Cancel
          </Button>
        )}
      </div>

      {/* Result */}
      {transcription && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Transcription Result</h3>
            <Button
              size="sm"
              variant="flat"
              color="primary"
              onPress={handleCopy}
            >
              📋 Copy
            </Button>
          </div>
          <Card>
            <CardBody>
              <p className="whitespace-pre-wrap leading-relaxed">{transcription}</p>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}

export default AudioToText
