import axios from "axios"
const baseUrl = "/api/persons"

const getAll = () => 
  axios
    .get(baseUrl)
    .then(response => response.data)

const create = (newPerson) => 
  axios
    .post(baseUrl, newPerson)
    .then(response => response.data)

const deletePerson = (id) => 
  axios
    .delete(`${baseUrl}/${id}`)
    .then(response => response.data)

const update = (newPerson) => 
  axios
    .put(`${baseUrl}/${newPerson.id}`, newPerson)
    .then(response => response.data)


export default {getAll, create, deletePerson, update}