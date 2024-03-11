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

  const selectDBQuery = `SELECT * FROM user WHERE username = ?`
  const getUsernameFromDb = await db.get(selectDBQuery, [username])

  if (getUsernameFromDb) {
    return response.status(400).send('User already exists')
  }
  if (password.length < 5) {
    return response.status(400).send('Password is too short')
  }
  const hashedPassword = await bcrypt.hash(request.body.password, 10)
  const postQuery = `INSERT INTO user (username, name, password, gender, location)
      VALUES (?, ?, ?, ?, ?)`
  try {
    const dbResponse = await db.run(postQuery, [
      username,
      name,
      hashedPassword,
      gender,
      location,
    ])
    return response.status(200).send('User created successfully')
  } catch (error) {
    return response.send(`DB Error: ${error.message}`)
  }
})
