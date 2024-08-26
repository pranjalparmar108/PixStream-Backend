const express = require("express");
const path = require("path");
const cors = require('cors')
const hmsroutes = require('./routes/allroutes.route')

const PORT = 3000;

const app = express();
app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/upload", express.static(path.join(__dirname, "upload")));
app.use('/', hmsroutes);


app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
})

app.get("/", (req, res) => {
    res.send(`HMS is running on http://localhost:${PORT}`);
});