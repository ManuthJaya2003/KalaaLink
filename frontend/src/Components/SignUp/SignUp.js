import React from 'react';
import { Link } from 'react-router-dom';
import MainNav from '../MainNav/MainNav';

function SignUp() {
  return (
    <div>
        <MainNav/>
      <p>
        Are you an artist?{' '}
        <Link to="/register" style={{ color: 'blue', textDecoration: 'underline' }}>
          Register here
        </Link>
      </p>
    </div>
  );
}

export default SignUp;
