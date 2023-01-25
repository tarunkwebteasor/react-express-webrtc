import Express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = Express();

app.get("/", (req, res) => {
    return res.status(200).json({msg: "Server run successfully"})
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
      origin: "*",
    }
  });

io.on("connection", (socket) => {
    socket.on("offerserver", (offersdp) => {
        socket.broadcast.emit("answerclient", offersdp);
    })

    socket.on("answerserver", (answersdp) => {
        socket.broadcast.emit("offerclient", answersdp);
    })

    socket.on("icecandidateserver", (candidate) => {
        socket.broadcast.emit("icecandidateclient", candidate);
    })
});

httpServer.listen(8080, () => {
    console.log("Server listen on port 8080");
});

