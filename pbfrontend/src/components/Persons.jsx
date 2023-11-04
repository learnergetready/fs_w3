import Person from "./Person"

const Persons = ({persons, filterNames, handleDelete}) => {
    return(
    <div>
       {persons.filter( (person => person.name.toLowerCase().includes( filterNames.toLowerCase() ) ) )
               .map( person => <Person key={person.name} person={person} handleDelete={handleDelete} /> )}
    </div>
    )
}

export default Persons