import axios from "axios";
import { BASE_URL } from "./constants";

export async function handleGetGeoTiffJson() {
    try {
        const resp = await axios.postForm(`${BASE_URL}/geo-json-path/`);
        if (resp?.data) {
            return { status: true, data: resp?.data };
        } else {
            return { status: false };
        }
    } catch (err) {
        console.error("Error:", err);
        return { status: false };
        throw err; 
    }
}





