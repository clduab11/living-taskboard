# 🎨 Living Taskboard

The Living Taskboard is a real-time collaborative whiteboard with AI assistance, designed to help you bring ideas to life!

## 🚀 Features

### Core Functionality
- **Infinite Canvas** - Pan, zoom, and work without boundaries
- **Drawing Tools** - Pen, eraser, shapes (rectangles, circles), text, and sticky notes
- **Real-time Collaboration** - Multiple users can work together simultaneously
- **Live Cursors** - See where your collaborators are working in real-time
- **Voice/Video** - WebRTC-based communication (foundation ready)

### Technology Stack
- **Frontend**: React + TypeScript + Vite
- **Canvas Engine**: Fabric.js for rich drawing capabilities
- **Backend**: Node.js + Express + TypeScript
- **Real-time Sync**: Socket.IO for presence, Y.js CRDTs for conflict-free data synchronization
- **State Management**: Zustand for efficient state management

### Templates
- Flowcharts
- Wireframes
- Mind maps
- Kanban boards

### Export Options
- PNG - High-resolution image export
- PDF - Document-ready format
- SVG - Vector graphics for scaling
- JSON - Save and restore canvas state

### UX Features
- Mobile-responsive design
- Keyboard shortcuts
- Dark mode support
- Grid and snap-to-grid options

### SaaS Ready
- Stripe integration foundation
- User authentication ready
- Multi-room support
- Scalable WebSocket architecture

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/clduab11/living-taskboard.git
cd living-taskboard
```

2. Install dependencies:
```bash
npm run install:all
```

3. Configure environment variables:

**Server** (`server/.env`):
```bash
cp server/.env.example server/.env
# Edit server/.env with your configuration
```

**Client** (`client/.env`):
```bash
cp client/.env.example client/.env
# Edit client/.env with your configuration
```

## 🏃 Running the Application

### Development Mode

Run both client and server concurrently:
```bash
npm run dev
```

Or run them separately:
```bash
# Terminal 1 - Server
npm run dev:server

# Terminal 2 - Client
npm run dev:client
```

The application will be available at:
- **Client**: http://localhost:5173
- **Server**: http://localhost:3001

### Production Build

```bash
npm run build
npm start
```

## 🎯 Usage

1. **Join a Room**: Enter a room ID or let the app generate one for you
2. **Share the Link**: Copy the URL with the room ID to invite collaborators
3. **Start Drawing**: Select tools from the toolbar and start creating
4. **Collaborate**: See other users' cursors and changes in real-time
5. **Export**: Save your work in multiple formats

### Keyboard Shortcuts

- `V` - Select tool
- `P` - Pen tool
- `E` - Eraser tool
- `T` - Text tool
- `R` - Rectangle tool
- `C` - Circle tool
- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Shift + Z` - Redo
- `Space + Drag` - Pan canvas
- `Ctrl/Cmd + Mouse Wheel` - Zoom

## 🏗️ Architecture

```
living-taskboard/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── canvas/   # Canvas components
│   │   │   ├── toolbar/  # Toolbar UI
│   │   │   └── templates/ # Template library
│   │   ├── services/     # API and WebSocket services
│   │   ├── store/        # Zustand state management
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utility functions
│   └── package.json
├── server/                # Node.js backend
│   ├── src/
│   │   ├── services/     # Business logic
│   │   ├── routes/       # API routes
│   │   └── types/        # TypeScript types
│   └── package.json
└── package.json          # Root package.json

```

## 🔧 Configuration

### Server Configuration

Edit `server/.env`:
- `PORT` - Server port (default: 3001)
- `CLIENT_URL` - Client URL for CORS (default: http://localhost:5173)
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `OPENAI_API_KEY` - Your OpenAI API key for AI features

### Client Configuration

Edit `client/.env`:
- `VITE_SERVER_URL` - Backend server URL (default: http://localhost:3001)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Fabric.js** - Powerful canvas library
- **Y.js** - CRDT framework for real-time collaboration
- **Socket.IO** - Real-time bidirectional communication
- **React** - UI framework
- **Vite** - Build tool
