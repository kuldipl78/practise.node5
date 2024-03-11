const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')
const path = require('path')
const dbpath = path.join(__dirname, 'userData.db')
const app = express()
app.use(express.json())

let db = null

const initilizationDBServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running At 3000 Port: http://localhost:3000')
    })
  } catch (error) {
    console.log(`DB Error: error.message`)
    process.exit(1)
  }
}
initilizationDBServer()

app.post('/register', async (request, response) => {
  const {username, name, password, gender, location} = request.body
  const selectDBQuery = `SELECT * FROM user WHERE username = ${username}`
  const getUsernameFromDb = await db.get(selectDBQuery)
  const lengthOfPass = password.length
  if (getUsernameFromDb !== undefined) {
    response.status(400)
    response.send('User already exists')
  } else if (lengthOfPass < 5) {
    response.status(400)
    response.send('Password is too short')
  } else {
    const hashedPassword = await bcrypt.hash(request.body.password, 10)
    const postQuery = `INSERT INTO user (username, name, password, gender, location)
            VALUES ('${username}', '${name}', '${hashedPassword}', '${gender}', '${location}')`
    const dbResponse = await db.run(postQuery)
    const newUserId = dbResponse.lastID
    response.status(200)
    response.send('User created successfully')
  }
})
