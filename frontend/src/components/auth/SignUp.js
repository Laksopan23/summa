import React, { useState } from 'react';
import axios from 'axios';

const SignUp = () => {
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '', role: 'user' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', form);
      alert('Registration successful!');
    } catch (err) {
          const message = err.response?.data?.message || 'An error occurred';
      alert(message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" placeholder="Username" onChange={handleChange} /><br/>
      <input name="password" type="password" placeholder="Password" onChange={handleChange} /><br/>
      <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} /><br/>
      <select name="role" onChange={handleChange}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select><br/>
      <button type="submit">Sign Up</button>
    </form>
  );
};

export default SignUp;
