require('dotenv').config()
const express = require('express')
var morgan = require('morgan')
const Person = require('./models/person')
const app = express()

app.use(express.static('dist'))
app.use(express.json())
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

app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then(people => {
      res.json(people)
    })
    .catch(error => next(error))
  })


app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }})
    .catch(error => next(error))
    })

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
  })

app.post('/api/persons', (req, res, next) => {
  const {name, number} = req.body

  if(!name || !number) {
    return res.status(400).json({
      error: 'name or number is missing'
    })
  }

  const person = new Person({
    name: name,
    number: number,
  })
  /*
  if(Person.find({})) {
    return res.status(400).json({
      error: 'name must be unique'
    })
  }*/
  
  person.save()
    .then(savedPerson => {
      res.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const {name, number} = req.body
  Person.findByIdAndUpdate(req.params.id, {name, number}, {new:true})
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.get('/info', (req, res, next) => {
  
  Person.find({})
    .then(persons => {
      const dateTime = new Date()
      res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${dateTime}</p>`)
    })
    .catch(error => next(error))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// olemattomien osoitteiden käsittely
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.use(errorHandler)