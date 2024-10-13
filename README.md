# Setup
- RUN `npm i` to install all dependencies.
- open `src\functions.ts` replace `MY_NUMBER`.

# Connect
- Delete `auth_info_baileys` folder to clear existing login sessions.
- RUN `npm run dev` to launch local server.
- open whatsapp and link your device with the QR code in terminal (make sure the terminal has black background).


# Working
- open whatsapp, seach 'you', a chat should appear which is basically YOU (if you are not able to find it: type on browser- https://wa.me/91xxxxxxxxxx) where 91xxxxxxxxxx is your mobile number with country code.

- TYPE `DUMP` and send, to download `myjsonfile.json` where all your groups and its participant will be listed in JSON format (no admins will be present in the list).

- TYPE `BROADCAST` by REPLYING to one of your **template**, which is already present in **YOU** chat. (before that, please make sure to pick any group, copy the content
```json 
{
    "<GROUP_NAME>": [
        "91xxxxxxxxx1",
        "91xxxxxxxxx2",
        "91xxxxxxxxx3",
        ...
    ],
    ...
}
```
and paste it to `broadcast.json`, this file will be taken as reference to send same template to all participants inside it [ you can have multiple group and their participant, just follow the valid JSON structure]