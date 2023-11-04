const express = require('express')
var morgan = require('morgan')
const app = express()

app.use(express.json())
app.use(express.static('dist'))
app.use(morgan((tokens, req, res) => {
  const loggedData =  [
     tokens.method(req, res),
     tokens.url(req, res),
     tokens.status(req, res),
     tokens.res(req, res, 'content-length'), '-',
     tokens['response-time'](req, res), 'ms',
     JSON.stringify(req.body)
  ]

  return loggedData.join(' ')
}))


let persons = [
    {
      name: "Arto Hellas",
      number: "040-123456",
      id: 1
    },
    {
      name: "Ada Lovelace",
      number: "39-44-5323523",
      id: 2
    },
    {
      name: "Dan Abramov",
      number: "12-43-234345",
      id: 3
    },
    {
      name: "Mary Poppendieck",
      number: "39-23-6423122",
      id: 4
    }
  ]

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(person => person.id === id)
  
  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)
  
  res.status(204).end()
})

app.post('/api/persons', (req, res) => {
  const person = {...req.body}

  if(!person.name || !person.number) {
    return res.status(400).json({
      error: 'name or number is missing'
    })
  }

  if(persons.find(p => p.name === person.name)) {
    return res.status(400).json({
      error: 'name must be unique'
    })
  }

  person.id = Math.round(Math.random()*1000000)
  persons = persons.concat(person)

  res.json(person)
})

app.get('/info', (req, res) => {
  const dateTime = new Date()
  res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${dateTime}</p>`)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
