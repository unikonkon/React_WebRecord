# React_WebRecord - Local Audio Recording App

A modern web application for recording, storing, and sharing audio recordings locally using IndexedDB.

## Features

- **Local Storage**: All audio recordings are stored in your browser using IndexedDB
- **No Server Required**: Everything runs in your browser - no data is sent to external servers
- **Audio Recording**: Record audio directly from your browser
- **Audio Uploading**: Upload existing audio files
- **Sharing**: Generate shareable links to recordings
- **Transcription Support**: Add text transcriptions to your recordings
- **User Authentication**: Firebase authentication
- **Responsive UI**: Beautiful UI built with shadcn/ui components

## Privacy First

Sonic Echo stores all your audio data locally on your device using IndexedDB. Your recordings never leave your browser unless you explicitly share them.

## Technologies

- **React**: UI library
- **TypeScript**: Type safety
- **IndexedDB**: Local database (via idb)
- **Firebase Auth**: User authentication
- **Shadcn/UI**: Component library
- **Vite**: Build tool
- **Tailwind CSS**: Styling

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd sonic-echo-cloud
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory and can be served by any static file server.

## Usage

1. **Recording Audio**:
   - Navigate to the "Record" page
   - Click the record button to start
   - Stop when finished and save your recording

2. **Uploading Audio**:
   - Go to the "Upload" page
   - Drag and drop an audio file or click to browse
   - Add details and save

3. **Managing Recordings**:
   - View all your recordings in the Dashboard
   - Click on a recording to access options like edit, share, and delete

4. **Sharing Recordings**:
   - Open a recording
   - Click the share button
   - Choose expiration (optional)
   - Copy the generated link to share with others

## Browser Compatibility

This application works best in modern browsers that support:
- IndexedDB
- MediaRecorder API
- Web Audio API

## Limitations

- **Data Persistence**: Data is stored in your browser's IndexedDB. Clearing browser data will delete your recordings.
- **Storage Limits**: Subject to your browser's storage limits (typically several GB).
- **No Cross-Device Sync**: Recordings are only available on the device where they were created.

## License

[MIT License](LICENSE)
