import { makeInMemoryStore, delay } from 'baileys';
import type { WAMessage, MessageUpsertType, PresenceData, AnyMessageContent } from 'baileys';
import fs from 'fs';
import P from 'pino';
import _ from 'lodash';
import { startSock } from './connect';

export const logger = P({ level:'silent', timestamp: () => `,"time":"${new Date().toJSON()}"`});

export const sock = startSock();

// set your number here
const MY_NUMBER = '91xxxxxxxxxx'

export const sockMessageUpsert = async (upsert: {
    messages: WAMessage[];
    type: MessageUpsertType;
    requestId?: string;
}) => {
    const groupData = await (await sock).groupFetchAllParticipating();
    const filteredGroupData = {} as {[_: string]: string[]};
    _.each(groupData, (value, key) => {
        filteredGroupData[value.subject] = []
        _.each(value.participants, (participant) => {
            if (!participant.admin) {
                filteredGroupData[value.subject].push(participant.id.split('@')[0])
            }
        })
    })

    if(
        (upsert.messages[0].key.remoteJid === `${MY_NUMBER}@s.whatsapp.net`)
        && (upsert.messages[0].message?.extendedTextMessage?.text === 'BROADCAST')
    )  {
        const template = upsert.messages[0].message.extendedTextMessage.contextInfo?.quotedMessage?.conversation || upsert.messages[0].message.extendedTextMessage.contextInfo?.quotedMessage?.extendedTextMessage?.text
        
        console.log(template)
        
        if (!template) {
            console.error('No template found in the broadcast message')
            process.exit(1)
        }
        
        // send message to everyone from broadcast.json
        await runLoop(template)
    }

    if(
        (upsert.messages[0].key.remoteJid === `${MY_NUMBER}@s.whatsapp.net`)
        && (upsert.messages[0].message?.conversation === 'DUMP' || upsert.messages[0].message?.extendedTextMessage?.text === 'DUMP')
    )  {
        fs.writeFile('myjsonfile.json', JSON.stringify(filteredGroupData, undefined, 2), 'utf8', ()=>{});
    }
};

const sendMessageWTyping = async(msg: AnyMessageContent, jid: string) => {
    await (await sock).presenceSubscribe(jid)
    await delay(500)

    await (await sock).sendPresenceUpdate('composing', jid)
    await delay(2000)

    await (await sock).sendPresenceUpdate('paused', jid)

    await (await sock).sendMessage(jid, msg)
}

const runLoop = async (template: string) => {
    fs.readFile('broadcast.json', 'utf8', async (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
          }
        
        // Parse the JSON data
        const jsonData = JSON.parse(data);

        // lodash iterate over each key, store values list in a array
        let values: string[] = []
        _.each(jsonData, (value, key) => {
            values.push(value)
        })
        values = _.flatten(values)

        for (let i = 0; i < values.length; i++) {
            await sendMessageWTyping({ text: template }, `${values[i]}@s.whatsapp.net`)
        }
    })
};

// export const sockMessageUpsert = (update: {
//     messages: WAMessage[];
//     type: MessageUpsertType;
//     requestId?: string;
// }) => {
//     if (update.messages[0].message?.extendedTextMessage?.text) {
//         console.log('new message', update.messages[0].message?.extendedTextMessage.text)
//         console.log('new message id', update.messages[0].key.id)
//         console.log('new message by', update.messages[0].key.remoteJid)
//     }

//     if (update.messages[0].message?.protocolMessage?.type == 0) {
//         console.log('messages deleted id', update.messages[0].message?.protocolMessage?.key?.id)
//         console.log('messages deleted by', update.messages[0].key.remoteJid)
//     }

//     if (update.messages[0].message?.editedMessage?.message?.protocolMessage?.type == 14) {
//         console.log('messages edited', update.messages[0].message?.editedMessage?.message?.protocolMessage?.editedMessage?.extendedTextMessage?.text)
//         console.log('messages edited id', update.messages[0].message?.editedMessage?.message.protocolMessage?.key?.id)
//         console.log('messages edited by', update.messages[0].key.remoteJid)
//     }
// };

export const sockPresenceUpdate = (update: {
    id: string;
    presences: {
        [participant: string]: PresenceData;
    }}) => {
        console.log('presence update', update.id, update.presences)
};

export const saveLogs = () => {
    const store = makeInMemoryStore({ logger })
    store?.readFromFile('./auth_info_baileys/baileys_store_multi.json')
    // save every 10s
    setInterval(() => {
        store?.writeToFile('./auth_info_baileys/baileys_store_multi.json')
    }, 10_000)
    return {store}
};

