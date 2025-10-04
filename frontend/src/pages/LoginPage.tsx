import React, { useState } from 'react';
import '../styles/login.css';
import { creataUser } from '../apis/UserApi';
import { useNavigate } from 'react-router-dom';

interface LoginForm {
  firstName: string;
  lastName: string;
  emailId: string;
}

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginForm>({
    firstName: '',
    lastName: '',
    emailId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
   const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.emailId.trim()) {
    setError('All fields are required');
    return;
  }

  setIsSubmitting(true);
  setError('');

  try {
    // Use the creataUser API call
    const userData = await creataUser({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.emailId,
    });
    
    // Store user data in localStorage
    sessionStorage.setItem('currentUser', JSON.stringify(userData));
    navigate('/analytics')
  } catch (error) {
    console.error('Error creating account:', error);
    setError(error instanceof Error ? error.message : 'Failed to create account. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="container">
        <div className="login-card">
          <div className="login-header">
            <h1>Welcome to Site Summary</h1>
            <p>Please enter your details to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  className="form-input"
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  className="form-input"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="emailId">Email ID *</label>
              <input
                id="emailId"
                name="emailId"
                type="email"
                value={formData.emailId}
                onChange={handleChange}
                placeholder="Enter your email address"
                className="form-input"
                disabled={isSubmitting}
                required
              />
            </div>

            {error && (
              <div className="form-message error">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary login-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Get Started'}
            </button>

            <div className="login-note">
              <p>🔒 No password required - we'll identify you by your email</p>
            </div>
          </form>
        </div>
    </div>
  );
};

export default LoginPage;