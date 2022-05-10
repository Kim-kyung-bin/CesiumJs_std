const express = require('express');
const app = express();
const path = require('path');
const PORT = 7777;

app.use(express.static(path.join(__dirname, 'html')));

app.get('/', (req,res)=>{
    res.sendFile(path.join(__dirname, 'html', 'main.html'));
})

app.use('/' , (req, res) => {
    res.send("")
});

app.listen(PORT, () => {
    console.log(`run port : ${PORT}`)
});

