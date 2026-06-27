import React , {createContext , useState, useContext,useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user , setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        const storedUser = localStorage.getItem('user');
        if(!storedUser){
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);

           // axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
        }
        setLoading(false);
    },[]);

    const login = async (email , password) =>{
        try {
            const response = await api.post('/auth/login',{email, password});
            const userData = response.data;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return {success: true};
        }catch(error){
            return {success: false , message: error.response?.data?.message || 'Login failed'};
        }
    };

    const register = async (username , email, password) => {
        try{
            const response = await api.post('/auth/register', {username, email, password});
            const userData = response.data;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return {success: true};
        }catch(error){
            return {success: false , message: error.response?.data?.message || 'Registration failed'};
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{user, login, register, logout, loading}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () =>{
    const context = useContext(AuthContext);
    if (!context){
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};