import axios from "axios";


export const api = axios.create({
    baseURL: import.meta.env.REACT_APP_URL_SERVER || 'http://localhost:3333',
})