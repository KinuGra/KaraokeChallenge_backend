const express = require('express')
const app = express()
const PORT = 3000

app.get('/ping', (req, res) => {
    res.json({ message: 'pong' })
})

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`)
})