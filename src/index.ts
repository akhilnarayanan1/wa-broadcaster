
import { sockMessageUpsert, sock } from './functions';

(async () => {
    (await sock).ev.on('messages.upsert', async(update) => sockMessageUpsert(update));
})();
