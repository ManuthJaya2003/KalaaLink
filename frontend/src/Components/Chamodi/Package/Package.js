import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Package(props) {
  const { _id, name, amount, description, isActive } = props.package;
  const history = useNavigate();

  const deleteHandler = async () => {
    await axios
      .delete(`http://localhost:5000/package/${_id}`)
      .then((res) => res.data)
      .then(() => history('/packagedetails'));
  };

  return (
    <div className="package-container">
      <h1>Package Display</h1>
      <div className="package-details">
        <p><strong>ID:</strong> {_id}</p>
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Amount:</strong> LKR {amount}</p>
        <p><strong>Description:</strong> {description || 'N/A'}</p>
        <p><strong>Active:</strong> {isActive ? 'Yes' : 'No'}</p>
        <Link to={`/updatepackage/${_id}`} className="update-link">Update</Link>
        <button onClick={deleteHandler} className="delete-button">Delete</button>
      </div>
    </div>
  );
}

export default Package;