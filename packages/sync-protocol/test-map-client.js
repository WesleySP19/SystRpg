import { io } from "socket.io-client";

// Mude a porta se o servidor iniciar em outra (padrão TOME: 3000)
const URL = process.env.PORT ? `http://localhost:${process.env.PORT}` : "http://localhost:3000";
const socket = io(URL);

const TEST_SESSION_ID = "session:test-1234-abcd";

socket.on("connect", () => {
  console.log(`[TestClient] Conectado com ID: ${socket.id}`);
  
  // Entra na room
  socket.emit("joinRoom", { mesaId: TEST_SESSION_ID });
  console.log(`[TestClient] Entrou na sala: ${TEST_SESSION_ID}`);

  // O mapa solicita o snapshot da batalha
  setTimeout(() => {
    console.log(`[TestClient] Solicitando snapshot da batalha...`);
    socket.emit("battle:snapshot:request", {
      meta: { sessionId: TEST_SESSION_ID, timestamp: Date.now() }
    });
  }, 500);

  // O mapa tenta mover uma entidade
  setTimeout(() => {
    console.log(`[TestClient] Solicitando movimento da entidade...`);
    socket.emit("request:entity:move", {
      meta: { sessionId: TEST_SESSION_ID, timestamp: Date.now() },
      payload: {
        entityId: "orc-1",
        targetPosition: { x: 5, y: 10 }
      }
    });
  }, 1000);
});

// Listener para a resposta do snapshot
socket.on("battle:snapshot:response", (response) => {
  console.log(`[TestClient] < Snapshot Recebido:`, JSON.stringify(response, null, 2));
});

// Listener para o evento OFICIAL de movimento (broadcasted pelo DM)
socket.on("entity:move", (event) => {
  console.log(`[TestClient] < Movimento Confirmado:`, JSON.stringify(event, null, 2));
  console.log(`[TestClient] Teste finalizado. Fechando conexão.`);
  socket.disconnect();
  process.exit(0);
});

socket.on("connect_error", (err) => {
  console.error(`[TestClient] Erro de conexão: ${err.message}`);
  process.exit(1);
});
