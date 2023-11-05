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

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.error('logging an error!!')
  console.error(error.name, error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  } else if (error.name === 'NameInUse') {
    return response.status(400).send({ error: 'name must be unique' })
  } else if (error.name === 'NotInDB') {
    return response.status(400).send({ error: 'Person not in database' })
  }

  next(error)
}


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
        throw({ name: 'NotInDB' })
      }})
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then( () => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const { name, number } = req.body

  Person.exists({ name:name })
    .then(doesExist => {
      if(doesExist) {
        throw({ name: 'NameInUse' })
      } else {
        const person = new Person({
          name: name,
          number: number,
        })

        person.save()
          .then(savedPerson => {
            res.json(savedPerson)
          })
          .catch(error => next(error))
      }
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body
  Person.findByIdAndUpdate(
    req.params.id,
    { name, number },
    { new:true, runValidators:true, context:'query' }
  )
    .then(updatedPerson => {
      if(updatedPerson) {
        res.json(updatedPerson)
      } else {
        throw({ name: 'NotInDB' })
      }
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

app.use(unknownEndpoint)
app.use(errorHandler)