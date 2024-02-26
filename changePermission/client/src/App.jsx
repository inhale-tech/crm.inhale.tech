/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import './App.css'

const App = () => {
  const [inputValue, setInputValue] = useState('');
  const handleSubmit = async (e) => {
   // const navigate = useNavigate(); 
    e.preventDefault();

    try {
      const url = 'https://crm.inhale.tech/authorization'; 
      const body = {
        params: {
          userName: inputValue
        }
      };
      axios.get(url,body).then(res=>{
        console.log(res);
        if (res.status == 200) {
          window.location.replace(res.data.url_redirect);
   //       navigate('/another-page');
        } else {
          console.error('Error: response bode absent', res);
        }
      });
    } catch (error) {
      console.error('Error:', error);

    }
  };

  return (
    <div>
      <header>
       <h1>User transfer ownersip form</h1>
      </header>
      <main>
        <form className='frm-sbmt' onSubmit={handleSubmit}>
          <h2 className='hddr-sbmt'>File Ownership transfer</h2>
          <div>
            <label htmlFor="inputField">Your full name:   </label>

            <input
              required 
              className='inpt-sbmt'
              type="text"
              id="inputField"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="type your full name..."
            />
          </div>
          <div>
          <button style={{paddingTop:300, marginTop:100 }} type="submit" className='bttn-sbmt'>Submit</button>
          </div>
        </form>
      </main>
    </div>
  );
};


export default App;
