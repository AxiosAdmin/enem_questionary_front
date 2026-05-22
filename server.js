const express = require("express");
const path = require("path");

const app = express();

app.get("/env-config.js", (req, res) => {
  res.type("application/javascript");
  res.send(
    `window.__APP_CONFIG__ = ${JSON.stringify({
      REACT_APP_BASE_API_URL: process.env.REACT_APP_BASE_API_URL || "",
    })};`,
  );
});

// Serve the React build output.
app.use(express.static(path.join(__dirname, "build")));

app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
