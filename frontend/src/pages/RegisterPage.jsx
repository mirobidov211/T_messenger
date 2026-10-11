import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    const success = await register(formData);
    if (success) navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-telegram-darker p-4">
      <div className="w-full max-w-md bg-telegram-dark p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-white text-center mb-6">Create Account</h2>
        
        {error && <div className="bg-red-500 bg-opacity-10 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
          <Input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <Input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          <Input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
          
          <Button type="submit" className="w-full py-3 mt-4" disabled={loading}>
            {loading ? 'Creating...' : 'Sign Up'}
          </Button>
        </form>

        <p className="text-center text-gray-400 mt-6 text-sm">
          Already have an account? <Link to="/login" className="text-telegram-blue hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};
export default RegisterPage;