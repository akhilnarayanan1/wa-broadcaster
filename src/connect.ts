import makeWASocket, { fetchLatestBaileysVersion, useMultiFileAuthState, DisconnectReason} from 'baileys';
import { saveLogs, logger } from './functions';
import { Boom } from '@hapi/boom';


const startSock = async () => {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({ version, logger, printQRInTerminal: true, auth: state });
    const {store} = saveLogs();

    store?.bind(sock.ev);

    sock.ev.on('creds.update', async () => await saveCreds());
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if(connection === 'close') {
            // reconnect if not logged out
            const {statusCode, error, message} = (lastDisconnect?.error as Boom)?.output.payload;
            (statusCode !== DisconnectReason.loggedOut) ? 
                startSock() : console.log('You have been logged out', error, message);
        } else {
            console.log('connection update', update);
        }
    });
    
    return sock;
}

export {startSock};