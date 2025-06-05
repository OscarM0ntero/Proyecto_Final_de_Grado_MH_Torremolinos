import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const RECAPTCHA_SECRET = process.env['RECAPTCHA_SECRET_KEY'];

export async function verificarRecaptcha(token: string): Promise<boolean> {
    if (!RECAPTCHA_SECRET) {
        return false;
    }

    try {
        const respuesta = await axios.post(
            'https://www.google.com/recaptcha/api/siteverify',
            new URLSearchParams({
                secret: RECAPTCHA_SECRET,
                response: token
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        return respuesta.data.success;
    } catch (err) {
        return false;
    }
}
