// res.send, res.end, res.json() -- remember the diff, ok?

require('dotenv').config()
const express = require('express')
// const mongoose = require('mongoose')
const cors = require('cors')

const Note = require('./models/note')

const app = express()

/* const url = `mongodb+srv://ph9t:${process.env.PASS}@an9el.7dvxbvi.mongodb.net/noteApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})

noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()

    delete returnedObject._id
    delete returnedObject.__v
  },
})

const Note = mongoose.model('Note', noteSchema) */

let notes = [
  {
    id: 1,
    content: 'HTML is easy',
    important: true,
  },
  {
    id: 2,
    content: 'Browser can execute only JavaScript',
    important: false,
  },
  {
    id: 3,
    content: 'GET and POST are the most important methods of HTTP protocol',
    important: true,
  },
]

const requestLogger = (request, response, next) => {
  console.log('Method: ', request.method)
  console.log('Path: ', request.path)
  console.log('Body: ', request.body)
  console.log('---')

  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(express.static('build'))
app.use(cors())
app.use(express.json())
app.use(requestLogger)

app.get('/', (request, response) => {
  response.send('<h1>hello, world!</h1>')
})

/* app.get('/api/notes', (request, response) => {
  response.json(notes)
}) */

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

/* app.get('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  const note = notes.find(note => note.id === id)

  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
}) */

app.get('/api/notes/:id', (request, response) => {
  Note.findById(request.params.id).then(note => {
    response.json(note)
  })
})

/* app.post('/api/notes', (request, response) => {
  const maxId = notes.length > 0 ? Math.max(...notes.map(n => n.id)) : 0

  const note = request.body
  note.id = maxId + 1

  notes = notes.concat(note)
  response.json(note)
}) */

const generateId = () => {
  const maxId = notes.length > 0 ? Math.max(...notes.map(n => n.id)) : 0
  return maxId
}

app.post('/api/notes', (request, response) => {
  const body = request.body

  // if (!body.content) {
  if (body.content === undefined) {
    return response.status(400).json({
      error: 'content missing',
    })
  }

  /* const note = {
    content: body.content,
    important: body.important || false,
    id: generateId() + 1,
  } */

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  /* notes = notes.concat(note)
  response.json(note) */
  note.save().then(savedNote => {
    response.json(savedNote)
  })
})

app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  notes = notes.filter(note => note.id !== id)

  response.status(204).end()
})

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Sever running on port ${PORT}`)
})
