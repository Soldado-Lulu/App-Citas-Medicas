import "dotenv/config";
import express from "express";
import cors from "cors";
import { auth } from "./routes/auth";
import { catalogos } from "./routes/catalogos";
import { disponibilidad } from "./routes/disponibilidad";
import { citas } from "./routes/citas";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", auth);
app.use("/", catalogos);
app.use("/", disponibilidad);
app.use("/", citas);

const port = Number(process.env.PORT || 8080);
app.listen(port, () => console.log(`API escuchando en http://localhost:${port}`));
