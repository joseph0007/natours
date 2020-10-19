import axios from 'axios';
import { removeAlert, addAlert } from './alertMessage';

const changeURL = () => {
  setTimeout(function () {
    //location.assign('/');
    window.location.href = '/';
  }, 1500);
};

export const login = async (email, password) => {
  try {
    console.log(email, password);
    //using axios to send a http request(POST) to our url
    //this was the missing key!!! ;)
    const response = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (response.data.status === 'success') {
      addAlert('success', response.data.message);
      changeURL();
    }

    console.log(response);
  } catch (error) {
    addAlert('error', error.response.data.message);
  }
};

export const logOut = async () => {
  try {
    const response = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout',
    });

    if (response.data.status === 'success') location.reload();
  } catch (error) {
    addAlert('error', error.response.data.message);
  }
};

// window.addEventListener('submit', changeURL);
