import {useEffect, useState } from 'react'
import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import Notification from './components/Notification'
import peopleService from './services/persons'
import axios from 'axios'

const App = () => {

  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filterNames, setNewFilterNames] = useState('')
  const [notification, setNotification] = useState(null)
  const [notificationColor, setNotificationColor] = useState(undefined)

  useEffect(() => {
    peopleService
      .getAll()
      .then( initialPeople => setPersons(initialPeople))
      .catch(error => handleError(error))
  }, [])

  const showNotification = (message, color) => {
    setNotification(message)
    setNotificationColor(color)
    setTimeout( () => {
      setNotification(null)
      setNotificationColor(undefined)
    }, 5000)
  }

  const handleError = (error) => {
    console.log(error.response.data)
    showNotification(error.response.data.error, "red")
  }

    const addPerson = (event) => {
    event.preventDefault()


    if( persons.every( person => person.name !== newName) ) {   
      const newPerson = { name: newName, 
                          number: newNumber }   
      peopleService
        .create(newPerson)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson))
          showNotification(`Added ${returnedPerson.name}`)
          })
          .catch(error => handleError(error))
     } else {
      if(window.confirm(`${newName} is already added to Phonebook, replace the old number with a new one?`)) {
        const oldPerson = persons.find(person => person.name === newName)
        peopleService
          .update({ ...oldPerson, number: newNumber})
            .then( returnedPerson => {
              setPersons(persons.map( person => person.id !== returnedPerson.id ? person : returnedPerson ))
              showNotification(`Changed the phonenumber for ${returnedPerson.name}`, "red")
            })
            .catch(error => handleError(error))
      }
    }
    setNewName("")
    setNewNumber("")
  }

  const handleFilter = (event) => setNewFilterNames(event.target.value)

  const handleChangeName = (event) => setNewName(event.target.value)
  const handleChangeNumber = (event) => setNewNumber(event.target.value)

  const handleDelete = (nixedPerson) => {
    if(window.confirm(`Delete ${nixedPerson.name} ?`)) {
      peopleService.deletePerson(nixedPerson.id)
        .then( () => {
          setPersons(persons.filter(person => person.id !== nixedPerson.id))
          showNotification(`Deleted ${nixedPerson.name}`)
        })
        .catch(error => handleError(error))
    }
  }

  return (
    <div>
      <h2>Phonebook</h2>

      <Notification message={notification} color={notificationColor}/>

      <Filter filterNames={filterNames} handleFilter={handleFilter} />
      
      <h3>Add a new person</h3>

      <PersonForm addPerson={addPerson} newName={newName} handleChangeName={handleChangeName} newNumber={newNumber} handleChangeNumber={handleChangeNumber} />
      
      <h3>Numbers</h3>
      
      <Persons persons={persons} filterNames={filterNames} handleDelete={handleDelete} />
    
    </div>
  )

}

export default App