import React from 'react';
import { Link } from 'react-router-dom';
import MainNav from '../MainNav/MainNav';

function Login() {
  return (
    <div>
        <MainNav/>
      <p>
        Are you an artist?{' '}
        <Link to="/professional_login" style={{ color: 'blue', textDecoration: 'underline' }}>
          Register here
        </Link>
      </p>
    </div>
  );
}

export default Login;

