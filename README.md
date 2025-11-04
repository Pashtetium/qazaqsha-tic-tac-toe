# Qazaqsha Tic-Tac-Toe

A 4x4 multiplayer tic-tac-toe game built with vanilla Node.js, WebSockets, and SQLite. Built using minimal dependencies and no TypeScript. Build step is super simple and fast.

## Features

- Real-time multiplayer gameplay using WebSockets
- 4x4 game board (win condition: 4 in a row)
- Room-based matchmaking with unique room codes
- Anonymous play (no authentication required)
- Game state persistence with SQLite database
- Dockerized deployment

## Tech Stack

- **Backend**: Vanilla Node.js (no frameworks)
- **Database**: SQLite with raw SQL queries
- **Real-time Communication**: Socket.io (WebSockets)
- **Frontend**: Vanilla JavaScript, HTML, CSS
- **Architecture**: Entity classes (Game, Player, Board, Cell)
- **Type Safety**: JSDoc type definitions
- **Deployment**: Docker + Docker Compose

## Dependencies

Only 2 dependencies:
- `socket.io` - WebSocket server
- `sqlite3` - Database driver

## Quick Start

### Using Docker (Recommended)

Start the application with a single command:

```bash
docker-compose up --build
```

The application will be available at `http://localhost:3000`

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Run the server:
```bash
npm start
```

The server will start on `http://localhost:3000`

## How to Play

1. Open `http://localhost:3000` in your browser
2. Click "Create New Room" to start a new game
3. Share the 6-character room code with another player
4. The other player enters the room code and clicks "Join Room"
5. Take turns placing X or O on the 4x4 board
6. First player to get 4 in a row (horizontal, vertical, or diagonal) wins!

## Project Structure

```
.
├── server/
│   ├── entities/
│   │   ├── Cell.js                 # Cell entity
│   │   ├── Board.js                # Board entity with game logic
│   │   ├── Player.js               # Player entity
│   │   └── Game.js                 # Game entity
│   ├── database.js                 # SQLite database service
│   ├── gameManager.js              # Game state manager
│   └── index.js                    # HTTP + WebSocket server
├── shared/
│   └── types.js                    # JSDoc type definitions
├── public/
│   ├── index.html                  # Frontend HTML
│   ├── style.css                   # Styles
│   └── game.js                     # Frontend game client
├── Dockerfile                      # Docker build
├── docker-compose.yml              # Docker Compose configuration
└── package.json                    # Dependencies (only 2!)
```

## API Events

### Client → Server

- `create-room` - Create a new game room
- `join-room` - Join an existing room with a room code
- `make-move` - Make a move at a specific position

### Server → Client

- `room-created` - Room successfully created (returns room code)
- `game-joined` - Successfully joined a game
- `game-update` - Game state updated
- `game-over` - Game has ended
- `error` - Error message

## Architecture

### Entity Classes

- **Cell**: Represents a single board cell with position and value
- **Board**: 4x4 grid with T wildcard placement and win detection logic
- **Player**: Player with socket ID and symbol (X or O)
- **Game**: Complete game state with room management and turn handling

### Type Safety

JSDoc type definitions in `shared/types.js` provide type checking without TypeScript:
- `GameStatus`, `PlayerSymbol`, `CellValue` types
- `GameData`, `PlayerData` interfaces

### Database

SQLite database file is stored in `data/game.db` and auto-created on first run.

## License

ISC
