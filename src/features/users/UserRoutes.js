import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UserList from './UserList';
import UserCreate from './UserCreate';
import UserEdit from './UserEdit';
import UserDetail from './UserDetail';
import AdminRoute from '../../components/routes/AdminRoute';

const UserRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AdminRoute>
            <UserList />
          </AdminRoute>
        }
      />
      <Route
        path="/create"
        element={
          <AdminRoute>
            <UserCreate />
          </AdminRoute>
        }
      />
      <Route
        path="/:id"
        element={
          <AdminRoute>
            <UserDetail />
          </AdminRoute>
        }
      />
      <Route
        path="/:id/edit"
        element={
          <AdminRoute>
            <UserEdit />
          </AdminRoute>
        }
      />
    </Routes>
  );
};

export default UserRoutes; 