# Google Messages Client

### What is this?
- this is a [Google Messages](https://messages.google.com) Client library to send or read message with a backend .eg. with express to send otp messages. This module uses your own number to work as a sms gateway api and you can send message to other person with your own number.

### How to use

- Get session

```js
const { default: MessagesClient } = require('messages-web')
const fs = require('fs')

const client = new MessagesClient()

client.on('qr-code', (base64Image) => {
    // example code to save image
    fs.writeFileSync('qr.jpg', base64Image.replace(/^data:image\/png;base64,/, ""), { encoding: 'base64' })
    // your code
})

client.on('authenticated', async (service) => {
    const inbox = service.getInbox()
    const credentials = await client.getCredentials()
    fs.writeFileSync('credentials.json', JSON.stringify(credentials, null, '\t'))
    await client.quit()
})
```
You must have `credentials.json` or session file for accessing the feature. 

- Read messages

```js
const { default: MessagesClient } = require('messages-web')

const credentials = MessagesClient.loadCredentialFile('credentials.json')
const client = new MessagesClient({ credentials })

client.on('authenticated', async (service) => {
    const inbox = await service.getInbox()
    console.log('Inbox', inbox)
    await client.quit()
})
```

- Send messages

```js
const { default: MessagesClient } = require('messages-web')

const credentials = MessagesClient.loadCredentialFile('credentials.json')
const client = new MessagesClient({ credentials })

client.on('authenticated', async (service) => {
    console.log('Sending message...')
    await service.sendMessage('+1337', 'Test message from SMS Client.') 
    console.log('Done!')
    await client.quit()
})
```

**Note**: `sendMessage` takes first arg as number with `countryCode + Number` second arg as TextMessage

- Examples are given [here](https://github.com/ortod0x/google-messages-client/tree/main/examples).

### Todos
- add pagination in getInbox
- add sendMessage in Service
- add public method in client to save credentials to a file
- sendMessage: parse to var to check if country code is included or not
- Rewrite docs with proper details
- detect if phone is not connected
- detect if web client is open in another browser or not

# License 
ISC &copy;
