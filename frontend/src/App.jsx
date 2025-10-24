import { useState, useEffect } from 'react'
import { Card, CardBody, Tabs, Tab, Input, Button, Chip } from '@nextui-org/react'
import AudioToText from './components/AudioToText'
import TextToAudio from './components/TextToAudio'

function App() {
  const [apiKey, setApiKey] = useState('')
  const [tempApiKey, setTempApiKey] = useState('')
  const [showApiKeyInput, setShowApiKeyInput] = useState(true)

  useEffect(() => {
    const storedKey = localStorage.getItem('openai_api_key')
    if (storedKey) {
      setApiKey(storedKey)
      setShowApiKeyInput(false)
    }
  }, [])

  const handleSaveApiKey = () => {
    if (tempApiKey.trim()) {
      localStorage.setItem('openai_api_key', tempApiKey)
      setApiKey(tempApiKey)
      setShowApiKeyInput(false)
    }
  }

  const handleChangeApiKey = () => {
    setTempApiKey('')
    setApiKey('')
    localStorage.removeItem('openai_api_key')
    setShowApiKeyInput(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎙️ Audio Studio
          </h1>
          <p className="text-gray-600">Transcribe audio or generate speech</p>
        </div>

        {/* API Key Section */}
        {showApiKeyInput ? (
          <Card className="mb-6">
            <CardBody className="gap-4">
              <h2 className="text-lg font-semibold">Enter Your OpenAI API Key</h2>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="sk-..."
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveApiKey()}
                  className="flex-1"
                />
                <Button color="primary" onPress={handleSaveApiKey}>
                  Save Key
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Your API key is stored locally and never sent to any server except OpenAI.{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Get your API key
                </a>
              </p>
            </CardBody>
          </Card>
        ) : (
          <Card className="mb-6 bg-success-50">
            <CardBody>
              <div className="flex justify-between items-center">
                <Chip color="success" variant="flat">
                  ✓ API Key Set
                </Chip>
                <Button
                  size="sm"
                  variant="light"
                  color="primary"
                  onPress={handleChangeApiKey}
                >
                  Change Key
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Main Content */}
        {!showApiKeyInput && (
          <Card>
            <CardBody className="p-6">
              <Tabs
                aria-label="Audio operations"
                color="primary"
                variant="underlined"
                classNames={{
                  tabList: "gap-6",
                  cursor: "w-full bg-primary",
                  tab: "max-w-fit px-0 h-12",
                }}
              >
                <Tab
                  key="transcribe"
                  title={
                    <div className="flex items-center gap-2">
                      <span>🎵</span>
                      <span>Audio → Text</span>
                    </div>
                  }
                >
                  <AudioToText apiKey={apiKey} />
                </Tab>
                <Tab
                  key="tts"
                  title={
                    <div className="flex items-center gap-2">
                      <span>💬</span>
                      <span>Text → Audio</span>
                    </div>
                  }
                >
                  <TextToAudio apiKey={apiKey} />
                </Tab>
              </Tabs>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  )
}

export default App
