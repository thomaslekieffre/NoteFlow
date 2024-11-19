import { Server } from "socket.io";
import { createServer } from "http";

interface DocumentUpdate {
  noteId: string;
  userId: string;
  content: string;
}

interface JoinDocument {
  documentId: string;
  userId: string;
}

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const activeConnections = new Map<string, Set<string>>();

io.on("connection", (socket) => {
  console.log("Nouvelle connexion:", socket.id);

  socket.on("join-document", (data: JoinDocument) => {
    socket.join(data.documentId);

    if (!activeConnections.has(data.documentId)) {
      activeConnections.set(data.documentId, new Set());
    }
    activeConnections.get(data.documentId)?.add(socket.id);

    console.log(
      `Utilisateur ${data.userId} a rejoint le document ${data.documentId}`
    );
  });

  socket.on("document-update", (data: DocumentUpdate) => {
    console.log("Reçu document-update:", data);

    socket.broadcast.to(data.noteId).emit("document-update", {
      content: data.content,
      userId: data.userId,
    });
  });

  socket.on("disconnect", () => {
    activeConnections.forEach((connections, documentId) => {
      if (connections.has(socket.id)) {
        connections.delete(socket.id);
        if (connections.size === 0) {
          activeConnections.delete(documentId);
        }
      }
    });
    console.log("Déconnexion:", socket.id);
  });
});

const PORT = process.env.WEBSOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Serveur WebSocket en cours d'exécution sur le port ${PORT}`);
});
