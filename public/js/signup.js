import axios from 'axios';
import { removeAlert, addAlert } from './alertMessage';

const changeURL = () => {
  setTimeout(function () {
    //location.assign('/');
    window.location.href = '/login';
  }, 1500);
};

export const signup = async (name, email, password, confirmPassword) => {
  try {
    console.log(name, email, password, confirmPassword);
    //using axios to send a http request(POST) to our url
    //this was the missing key!!! ;)

    const response = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        confirmPassword
      },
    });

    if (response.data.status === 'success') {
      addAlert('success', response.data.message);
      changeURL();
    }
  } catch (error) {
    addAlert('error', error.response.data.message);
  }
};

export const logOut = async () => {
  try {
    const response = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });

    if (response.data.status === 'success') location.reload();
  } catch (error) {
    addAlert('error', error.response.data.message);
  }
};

// window.addEventListener('submit', changeURL);
