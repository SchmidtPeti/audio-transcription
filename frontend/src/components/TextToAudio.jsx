import { useState, useRef } from 'react'
import { Button, Card, CardBody, Textarea, RadioGroup, Radio, Progress, Chip } from '@nextui-org/react'
import { generateSpeech } from '../services/openai'

const VOICES = [
  { id: 'alloy', name: 'Alloy', desc: 'Neutral & versatile' },
  { id: 'echo', name: 'Echo', desc: 'Male, articulate' },
  { id: 'fable', name: 'Fable', desc: 'Expressive storyteller' },
  { id: 'onyx', name: 'Onyx', desc: 'Deep & clear ⭐' },
  { id: 'nova', name: 'Nova', desc: 'Energetic female' },
  { id: 'shimmer', name: 'Shimmer', desc: 'Warm & natural ⭐' },
]

const TextToAudio = ({ apiKey }) => {
  const [text, setText] = useState('')
  const [voice, setVoice] = useState('alloy')
  const [quality, setQuality] = useState('tts-1-hd')
  const [audioUrl, setAudioUrl] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 1 })
  const abortControllerRef = useRef(null)
  const audioBlobRef = useRef(null)

  const MAX_CHARS = 4096
  const charCount = text.length
  const chunksNeeded = Math.ceil(charCount / MAX_CHARS)

  const handleGenerate = async () => {
    if (!text.trim() || !apiKey) return

    abortControllerRef.current = new AbortController()
    setIsLoading(true)
    setProgress({ current: 0, total: chunksNeeded })
    setAudioUrl(null)

    try {
      const blob = await generateSpeech(
        apiKey,
        text,
        voice,
        quality,
        abortControllerRef.current.signal,
        (current, total) => setProgress({ current, total })
      )

      audioBlobRef.current = blob
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Generation cancelled')
      } else {
        alert(error.message || 'Failed to generate speech')
      }
    } finally {
      setIsLoading(false)
      setProgress({ current: 0, total: 1 })
      abortControllerRef.current = null
    }
  }

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  const handleDownload = () => {
    if (!audioBlobRef.current) return

    const url = URL.createObjectURL(audioBlobRef.current)
    const a = document.createElement('a')
    a.href = url
    a.download = `speech-${Date.now()}.mp3`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const progressPercent = progress.total > 0 ? (progress.current / progress.total) * 100 : 0

  return (
    <div className="py-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Generate Speech from Text</h2>
        <p className="text-sm text-gray-600">Convert your text into natural-sounding speech</p>
      </div>

      {/* Text Input */}
      <div>
        <Textarea
          label="Enter Text"
          placeholder="Type or paste the text you want to convert to speech..."
          value={text}
          onValueChange={setText}
          minRows={6}
          maxRows={12}
        />
        <div className="flex justify-end mt-2">
          <p className="text-sm text-gray-500">
            <span className={charCount > MAX_CHARS ? 'text-danger font-semibold' : ''}>
              {charCount}
            </span>
            {' characters'}
            {charCount > MAX_CHARS && (
              <span className="text-primary font-semibold ml-2">
                (will be split into {chunksNeeded} parts)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Quality Selector */}
      <div>
        <label className="text-sm font-semibold mb-2 block">Audio Quality</label>
        <RadioGroup value={quality} onValueChange={setQuality} orientation="horizontal">
          <Radio value="tts-1">
            <div>
              <p className="font-semibold">Standard</p>
              <p className="text-xs text-gray-500">Faster, lower cost</p>
            </div>
          </Radio>
          <Radio value="tts-1-hd">
            <div>
              <p className="font-semibold">HD Quality</p>
              <p className="text-xs text-gray-500">Better pronunciation & accents</p>
            </div>
          </Radio>
        </RadioGroup>
      </div>

      {/* Voice Selector */}
      <div>
        <label className="text-sm font-semibold mb-3 block">Select Voice</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {VOICES.map((v) => (
            <Card
              key={v.id}
              isPressable
              isHoverable
              onPress={() => setVoice(v.id)}
              className={`${
                voice === v.id
                  ? 'border-2 border-primary bg-primary-50'
                  : 'border-2 border-transparent'
              }`}
            >
              <CardBody className="p-3">
                <p className="font-semibold text-sm">{v.name}</p>
                <p className="text-xs text-gray-500">{v.desc}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Progress */}
      {isLoading && (
        <Card className="bg-primary-50">
          <CardBody className="gap-3">
            <Progress value={progressPercent} color="primary" className="max-w-full" />
            <p className="text-sm text-center font-medium text-primary">
              {progress.total > 1
                ? `Generating speech: ${progress.current}/${progress.total} chunks completed`
                : progress.current === 0
                ? 'Generating speech...'
                : 'Processing audio...'}
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
          isDisabled={!text.trim() || isLoading}
          onPress={handleGenerate}
        >
          Generate Speech
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
      {audioUrl && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Generated Audio</h3>
            <Button
              size="sm"
              variant="flat"
              color="primary"
              onPress={handleDownload}
            >
              💾 Download
            </Button>
          </div>
          <Card>
            <CardBody>
              <audio controls src={audioUrl} className="w-full" />
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}

export default TextToAudio
