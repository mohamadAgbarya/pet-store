
import React from 'react';
import { Redirect, Route } from 'react-router-dom';

const ProtectedRoutes = ({ component: Component, ...rest }) => {
  // this file work when user add id pass and then isAuthenticated then there is token recieve and will store in local storage if there is no toke and user is authencticated that they will goto home page
  
  const isAuthenticated = () => {
    // Implement your JWT token validation logic here
    const token = localStorage.getItem('token');
    // For example, you might want to check if the token exists and is not expired
    return token !== null;
  };

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated() ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
        )
      }
    />
  );
};

export default ProtectedRoutes;
