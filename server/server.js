const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, 'html')));

app.get('/', (req,res)=>{
    res.sendFile(path.join(__dirname, 'html', 'main.html'));
})

app.use('/' , (req, res) => {
    res.send("teddddst")
});

app.listen(7777, () => {
    console.log("run node server")
});

