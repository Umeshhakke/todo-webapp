import axios from 'axios';

const api = axios.create({
    baseURL: ' https://todo-webapp-z716.onrender.com/api',

    headers:{
            'Content-Type' : 'application/json',
        },
});

api.interceptors.request.use(
    (config)=>{
        const user = localStorage.getItem('user');
        if(user){
            const parsedUser = JSON.parse(user);
            if(parsedUser.token){
                config.headers.Authorization = `Bearer ${parsedUser.token}`;
            }
        }
        return config;
    },
    (error)=>{
        return Promise.reject(error);
    }
);

export default api;