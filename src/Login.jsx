import React, { useState } from 'react';
import { auth } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // लगइन वा साइन अप छुट्याउन
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let userCredential;
      if (isRegistering) {
        // नयाँ खाता बनाउने (Sign Up)
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        alert('खाता सफलतापूर्वक बन्यो र लगइन भयो!');
      } else {
        // लगइन गर्ने (Sign In)
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        alert('सफलतापूर्वक लगइन भयो!');
      }
      
      // यहाँ user डेटासहित अन-लगइन-सक्सेस कल गरिएको छ
      if (onLoginSuccess) {
        onLoginSuccess(userCredential.user);
      }
    } catch (err) {
      setError(err.message);
      alert('समस्या आयो: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '400px', margin: '50px auto', background: '#1e1e1e', borderRadius: '8px', color: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
        {isRegistering ? 'नयाँ खाता बनाउनुहोस्' : 'इमेलबाट लगइन गर्नुहोस्'}
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>इमेल (Email):</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="example@gmail.com"
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #555', background: '#2d2d2d', color: '#fff' }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>पासवर्ड (Password):</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="••••••••"
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #555', background: '#2d2d2d', color: '#fff' }}
          />
        </div>

        {error && <p style={{ color: '#ff6b6b', fontSize: '14px', margin: '0' }}>{error}</p>}

        <button 
          type="submit" 
          style={{ padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
        >
          {isRegistering ? 'साइन अप (Sign Up)' : 'लगइन (Login)'}
        </button>
      </form>
      
      <p 
        style={{ marginTop: '20px', textAlign: 'center', cursor: 'pointer', color: '#60a5fa', fontSize: '14px' }} 
        onClick={() => setIsRegistering(!isRegistering)}
      >
        {isRegistering ? 'पहिले नै खाता छ? लगइन गर्नुहोस्' : 'खाता छैन? नयाँ खाता बनाउनुहोस्'}
      </p>
    </div>
  );
}