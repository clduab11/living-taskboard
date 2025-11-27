# The Living Taskboard

A real-time collaborative whiteboard application with AI assistance for brainstorming, diagramming, and visual thinking.

![Living Taskboard](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### 🎨 Canvas Engine
- Infinite canvas with smooth panning and zooming
- Drawing tools: pen, shapes (rectangle, circle, triangle), text, sticky notes
- Image uploads and embedding
- Pre-built templates (flowcharts, mind maps, wireframes)
- Layer management and object grouping
- Advanced undo/redo with branching history

### 🤝 Real-Time Collaboration
- Live cursors showing other users in real-time
- Presence indicators for active collaborators
- Conflict-free replicated data types (CRDTs) using Y.js
- Real-time voice/video chat (WebRTC)
- Threaded comments on canvas objects
- Version history with visual diff

### 🤖 AI Features (Claude Integration)
- **Smart Shapes**: AI understands context and suggests connections
- **Auto-Layout**: Automatically organize diagrams for optimal readability
- **Mind Map Generator**: Create mind maps from text descriptions
- **Sketch to Diagram**: Convert rough sketches to professional diagrams
- **Connection Suggestions**: AI suggests logical relationships between ideas
- **Meeting Notes**: Auto-generate meeting notes from whiteboard content
- **Image Generation**: DALL-E integration for visual assets

### 🔐 Backend Infrastructure
- Node.js + Express REST API
- PostgreSQL for persistent storage
- Redis for session management and real-time message broker
- WebSocket server with Socket.io
- JWT authentication
- Role-based access control

### 💻 Frontend
- React 18 + TypeScript
- Vite for fast development
- Fabric.js for canvas rendering
- Zustand for state management
- TailwindCSS for styling
- Responsive design with mobile/tablet support
- Dark mode support
- Full keyboard shortcuts
- Touch gesture support

### 🎯 Integrations
- Import from Figma, Miro, FigJam (planned)
- Export to Notion, Confluence (planned)
- Slack notifications (planned)
- Zoom app integration (planned)
- Google Drive sync (planned)

## Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **Cache/Sessions**: Redis 7
- **Real-time**: Socket.io + Y.js
- **AI**: Anthropic Claude API
- **Storage**: AWS S3
- **Payments**: Stripe

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Canvas**: Fabric.js
- **State**: Zustand
- **Styling**: TailwindCSS
- **HTTP Client**: Axios
- **Queries**: TanStack Query

### DevOps
- **Containerization**: Docker + Docker Compose
- **Deployment**: (Configure as needed)

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional, recommended)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/living-taskboard.git
cd living-taskboard
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Backend (`apps/backend/.env`):
```bash
cp apps/backend/.env.example apps/backend/.env
```

Edit `apps/backend/.env` and add your configuration:
- Database URL
- Redis URL
- JWT secret
- Claude API key
- AWS credentials
- Stripe keys

Frontend (`apps/frontend/.env`):
```bash
cp apps/frontend/.env.example apps/frontend/.env
```

4. **Start with Docker (Recommended)**

```bash
# Start all services (PostgreSQL, Redis, Backend, Frontend)
npm run docker:up

# Stop all services
npm run docker:down
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

5. **Or start manually**

Start PostgreSQL and Redis, then:

```bash
# Start backend
npm run dev:backend

# In another terminal, start frontend
npm run dev:frontend
```

### Database Setup

The database schema will be automatically initialized when you start the PostgreSQL container. If running manually:

```bash
psql -U taskboard -d living_taskboard -f apps/backend/db/init.sql
```

## Project Structure

```
living-taskboard/
├── apps/
│   ├── backend/              # Node.js backend
│   │   ├── src/
│   │   │   ├── config/       # Configuration files
│   │   │   ├── controllers/  # Route controllers
│   │   │   ├── middleware/   # Express middleware
│   │   │   ├── routes/       # API routes
│   │   │   ├── services/     # Business logic
│   │   │   ├── utils/        # Utilities
│   │   │   ├── websocket/    # WebSocket server
│   │   │   └── index.ts      # Entry point
│   │   ├── db/               # Database migrations
│   │   └── package.json
│   │
│   └── frontend/             # React frontend
│       ├── src/
│       │   ├── components/   # React components
│       │   ├── pages/        # Page components
│       │   ├── hooks/        # Custom hooks
│       │   ├── services/     # API services
│       │   ├── store/        # Zustand stores
│       │   ├── styles/       # CSS files
│       │   ├── utils/        # Utilities
│       │   ├── App.tsx       # Main app component
│       │   └── main.tsx      # Entry point
│       └── package.json
│
├── packages/
│   └── shared/               # Shared types & utilities
│       └── src/
│           └── types.ts      # TypeScript types
│
├── docker-compose.yml        # Docker configuration
├── package.json              # Root package.json
└── README.md
```

## API Documentation

### Authentication

**Register**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Boards

**Create Board**
```http
POST /api/boards
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "My Board",
  "description": "Optional description",
  "visibility": "private"
}
```

**Get User Boards**
```http
GET /api/boards
Authorization: Bearer {token}
```

**Get Board by ID**
```http
GET /api/boards/:id
Authorization: Bearer {token}
```

### AI Features

**Generate with AI**
```http
POST /api/ai/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "prompt": "Create a mind map for a new mobile app",
  "type": "mindMap",
  "boardId": "board-uuid"
}
```

## Pricing Tiers

### Free Tier
- 5 boards maximum
- 100MB storage
- Basic features
- Community support

### Pro Tier ($12/month)
- 100 boards
- 10GB storage
- All AI features
- Priority support
- Export to all formats

### Team Tier ($49/month for 10 users)
- Unlimited boards
- 100GB storage
- All AI features
- Team collaboration tools
- Admin dashboard
- Priority support
- Custom integrations

## Development

### Running Tests

```bash
npm run test
```

### Linting

```bash
npm run lint
```

### Building for Production

```bash
npm run build
```

## WebSocket Events

The application uses WebSocket for real-time collaboration:

- `join_board` - Join a board room
- `leave_board` - Leave a board room
- `cursor_move` - Update cursor position
- `object_created` - New object created
- `object_updated` - Object modified
- `object_deleted` - Object removed
- `user_joined` - User joined the board
- `user_left` - User left the board

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Helmet.js for security headers
- SQL injection protection
- XSS protection

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Fabric.js](http://fabricjs.com/) for canvas rendering
- [Y.js](https://github.com/yjs/yjs) for CRDT implementation
- [Anthropic Claude](https://www.anthropic.com/) for AI features
- [Socket.io](https://socket.io/) for WebSocket communication

## Support

For support, email support@livingtaskboard.com or join our Slack community.

## Roadmap

- [ ] Mobile apps (iOS, Android)
- [ ] Offline mode with sync
- [ ] Advanced export options
- [ ] More AI features
- [ ] Third-party integrations
- [ ] Custom branding for teams
- [ ] Analytics dashboard
- [ ] API for developers

---

Built with ❤️ by the Living Taskboard team
