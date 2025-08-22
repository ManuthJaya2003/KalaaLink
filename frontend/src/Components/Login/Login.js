import React from 'react';
import { Link } from 'react-router-dom';
import MainNav from '../MainNav/MainNav';

function Login() {
  return (
    <div>
        <MainNav/>
      <p>
        Are you a professional?{' '}
        <Link to="/professional_login" style={{ color: 'blue', textDecoration: 'underline' }}>
          Login here
        </Link>
      </p>
      <p>
        Are you an artist?{' '}
        <Link to="/artist_login" style={{ color: 'blue', textDecoration: 'underline' }}>
          Login here
        </Link>
      </p>
    </div>
  );
}

export default Login;

