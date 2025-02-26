import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 4000;

connectDB();

// add the frontend server url where we want to use the backend
const allowedOrigins = ["http://localhost:5173"];
app.use(express.json());
app.use(cookieParser());
// app.use(cors());
 app.use(cors({ origin: allowedOrigins, credentials: true }));
// app.use(cors({  credentials: true }));
// Api Endpoints
app.get("/", (req, res) => {
  res.send("api working");
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

app.listen(port, () => {
  console.log(`Server started on Port: ${port}`);
});
