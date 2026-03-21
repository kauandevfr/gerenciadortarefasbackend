const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const routes = require('./routes')
const path = require("path");

const app = express();



const ALLOWED_ORIGINS = new Set([
    "http://localhost:7006",
    "http://192.168.0.173:7006",
    "http://172.24.48.1:7006",
    "http://127.0.0.1:7006",
    "https://tarefas.kauanrodrigues.com.br"
]);

app.use(cors({
    origin: (origin, cb) => {

        if (!origin) return cb(null, true);
        try {
            const u = new URL(origin);
            const host = u.hostname.replace(/^www\./, "");
            if (ALLOWED_ORIGINS.has(origin) ||
                ALLOWED_ORIGINS.has(`${u.protocol}//${host}`) ||
                ALLOWED_ORIGINS.has(`${u.protocol}//www.${host}`)) {
                return cb(null, true);
            }
        } catch { }

        return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
}));

app.set("trust proxy", 1);
app.use(cookieParser());
app.use(express.json());

app.use("/assets", express.static(path.join(__dirname, "src", "assets"), {
    maxAge: "365d",
    immutable: true
}));

app.use(routes)



app.listen(process.env.PORT, "0.0.0.0");
