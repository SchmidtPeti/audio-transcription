# Audio Studio Frontend - React + NextUI

A modern, beautiful React application for audio transcription and text-to-speech using OpenAI's API.

## 🚀 Features

- **Audio → Text**: Transcribe audio files using OpenAI's Whisper model
- **Text → Audio**: Generate natural-sounding speech with multiple voices
- **Beautiful UI**: Built with NextUI (Hero UI) components
- **Smart Text Splitting**: Automatically handles texts longer than 4096 characters
- **Progress Tracking**: Real-time progress for multi-chunk generation
- **Responsive Design**: Works perfectly on desktop and mobile
- **Cancel Support**: Abort ongoing requests at any time

## 📦 Installation

```bash
cd frontend
npm install
```

## 🏃‍♂️ Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🏗️ Build for Production

```bash
npm run build
```

Built files will be in the `dist` folder.

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **NextUI** - Beautiful React UI library (Hero UI)
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animations (required by NextUI)

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── AudioToText.jsx    # Audio transcription component
│   │   └── TextToAudio.jsx    # Text-to-speech component
│   ├── services/
│   │   └── openai.js          # OpenAI API service layer
│   ├── App.jsx                # Main app with tabs
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🎨 Components

### AudioToText
- Drag & drop file upload
- File validation (type & size)
- Progress tracking
- Copy transcription to clipboard
- Cancel support

### TextToAudio
- 6 voice options (Alloy, Echo, Fable, Onyx, Nova, Shimmer)
- Quality selector (Standard / HD)
- Character counter with chunk preview
- Real-time progress for multi-chunk texts
- Download generated audio
- Cancel support

## 🔑 API Key

Your OpenAI API key is stored in `localStorage` and is never sent anywhere except OpenAI's API.

Get your API key: https://platform.openai.com/api-keys

## 🌟 NextUI Features Used

- **Cards** - Container components with elevation
- **Tabs** - Tab navigation
- **Buttons** - Various button styles and states
- **Input/Textarea** - Form inputs
- **Progress** - Loading indicators
- **Radio** - Option selection
- **Chip** - Status badges

## 📱 Responsive Design

The app is fully responsive and works great on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## 🎯 Future Enhancements

- [ ] Dark mode support
- [ ] Multiple language support
- [ ] Audio playback speed control
- [ ] Voice preview samples
- [ ] Batch processing
- [ ] Export transcriptions as files

## 📄 License

MIT

---

Built with ❤️ using React and NextUI
