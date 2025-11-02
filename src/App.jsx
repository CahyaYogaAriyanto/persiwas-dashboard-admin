import React from 'react'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom'
import './index.css'
import Login from './pages/Login.jsx'
import Student from './pages/Student.jsx'
import Teacher from './pages/Teacher.jsx'
import Presence from './pages/Presence.jsx'

function isLoggedIn() {
  return !!localStorage.getItem('token');
}

function RequireAuth({ children }) {
  const location = useLocation();
  if (!isLoggedIn()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <Student />
            </RequireAuth>
          }
        />
        <Route
          path="/teacher"
          element={
            <RequireAuth>
              <Teacher />
            </RequireAuth>
          }
        />
        <Route
          path="/presence"
          element={
            <RequireAuth>
              <Presence />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  )
}

export default App