import { app } from './app';

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`[CareSetu Server] Production API & Clinical Database Engine active on http://localhost:${PORT}`);
  console.log(`[CareSetu Server] Health Check: http://localhost:${PORT}/api/health`);
  console.log(`[CareSetu Server] Database: SQLite WAL mode enabled`);
});
