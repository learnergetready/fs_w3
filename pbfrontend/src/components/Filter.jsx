const Filter = ({ filterNames, handleFilter }) => {
    return(
        <div>
        filter shown with: <input value={filterNames} onChange={handleFilter} />
      </div>
    )
}

export default Filter