# Audio Transcription Studio

A modern, beautiful React application for audio transcription and text-to-speech using OpenAI's API.

**Live Demo**: https://schmidtpeti.github.io/audio-transcription/

## 🚀 Features

- **Audio → Text**: Transcribe audio files using OpenAI's Whisper model
- **Text → Audio**: Generate natural-sounding speech with multiple voices
- **Beautiful UI**: Built with NextUI (Hero UI) components
- **Smart Text Splitting**: Automatically handles texts longer than 4096 characters
- **Progress Tracking**: Real-time progress for multi-chunk generation
- **Responsive Design**: Works perfectly on desktop and mobile
- **Cancel Support**: Abort ongoing requests at any time

## 📦 Quick Start

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **NextUI** - Beautiful React UI library (Hero UI)
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animations

## 🔑 API Key

Your OpenAI API key is stored in `localStorage` and is never sent anywhere except OpenAI's API.

Get your API key: https://platform.openai.com/api-keys

## 📱 Screenshots

The app features a clean, modern interface with:
- Drag & drop file upload for audio transcription
- 6 voice options for text-to-speech
- Real-time progress tracking
- Responsive design for all devices

## 📄 Documentation

For detailed documentation, see [frontend/README.md](./frontend/README.md)

## 📄 License

MIT

---

Built with ❤️ using React and NextUI
