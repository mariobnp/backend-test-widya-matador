import { app } from "./applications/app.js";

const PORT: number = 3000;

app.listen(PORT, () => {
  console.log(`Server Berjalan di http://localhost:${PORT}`)
});
