const express = require("express");
const connectDb = require("./config/db");
require("dotenv").config();

const app = express();
//Connect DB
connectDb();

//Init Middleware
app.use(express.json({ extended: false }));

app.get("/", (req, res) => {
	res.send("API Running");
});

//Define routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/posts", require("./routes/api/posts"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
