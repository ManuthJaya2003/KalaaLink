import React from 'react'

function complaints(props) {
    const {Name, Gmail, Message, Complaint_Category} = props.complaints;
  return (
    <div>
      <h1>Complaints Display</h1>
      <br></br>
      <h1>Name:{Name}</h1>
      <h1>Gmail:{Gmail}</h1>
      <h1>Message:{Message}</h1>
      <h1>Complaint_Category:{Complaint_Category}</h1>
      <button>Edit</button>
      <button>Delete</button>

    </div>
  )
}

export default complaints
