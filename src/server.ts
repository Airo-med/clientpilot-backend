import app from "./app";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.JWT_SECRET?.trim()) {
  console.error("Missing JWT_SECRET in .env (required to sign JWTs).");
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
