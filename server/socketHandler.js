const socketIo = require('socket.io');

let io;

const rooms = {}; // In-memory store for rooms (Note: Will reset on server restart/redeploy)

const initializeSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "*",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        // Join a room
        socket.on('join_room', ({ roomId, user }) => {
            socket.join(roomId);

            if (!rooms[roomId]) {
                rooms[roomId] = {
                    users: [],
                    movies: [],
                    votes: {}, // { movieId: { userId: 'like'/'dislike' } }
                    matches: []
                };
            }

            // Add user to room if not exists
            const existingUser = rooms[roomId].users.find(u => u.id === user.id);
            if (!existingUser) {
                rooms[roomId].users.push({ ...user, socketId: socket.id });
            }

            // Notify others
            io.to(roomId).emit('user_joined', rooms[roomId].users);

            console.log(`User ${user.name} joined room ${roomId}`);
        });

        // Start Session (Host sets movies)
        socket.on('start_session', ({ roomId, movies }) => {
            if (rooms[roomId]) {
                rooms[roomId].movies = movies;
                io.to(roomId).emit('session_started', movies);
            }
        });

        // Handle Swipe/Vote
        socket.on('vote_movie', ({ roomId, movieId, userId, vote }) => {
            // vote: 'like' | 'dislike'
            if (!rooms[roomId]) return;

            if (!rooms[roomId].votes[movieId]) {
                rooms[roomId].votes[movieId] = {};
            }

            rooms[roomId].votes[movieId][userId] = vote;

            // Check for match (if all users liked)
            const roomUsers = rooms[roomId].users;
            const movieVotes = rooms[roomId].votes[movieId];

            const allVoted = roomUsers.every(u => movieVotes[u.id]);
            const allLiked = roomUsers.every(u => movieVotes[u.id] === 'like');

            if (allLiked) {
                rooms[roomId].matches.push(movieId);
                io.to(roomId).emit('match_found', movieId);
            }
        });

        // Chat Message
        socket.on('send_message', ({ roomId, message, user }) => {
            io.to(roomId).emit('receive_message', {
                text: message,
                user: user,
                timestamp: new Date()
            });
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
            // Handle user removal from rooms if needed
        });
    });

    return io;
};

module.exports = { initializeSocket };
