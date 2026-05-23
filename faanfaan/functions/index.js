const line = require('@line/bot-sdk');
const mihome = require('node-mihome');
const functions = require("firebase-functions");
const fetch = require("whatwg-fetch")
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const messagePayload = (text) => {
    return {
        type: 'text',
        text: text
    }
}

const stickerPayload = (pgkId, stkId) => {
    return     {
        type: 'sticker',
        packageId: pgkId,
        stickerId: stkId,
      }
}

// const manageMiiDevice = async (device, mode) => {
//     // const device = mihome.device({
//     //     id: '100000', // required, device id
//     //     model: 'zhimi.aircondition.v1', // required, device model
      
//     //     address: '192.168.31.13', // miio-device option, local ip address
//     //     token: 'abcdefgfabcdefgfabcdefgfabcdefgf', // miio-device option, device token
//     //     refresh: 30000 // miio-device option, device properties refresh interval in ms
        
//     //     parent: '1234abcd', // aqara-device option, gateway SID for aqara-protocol compatible device
//     //   });
//     //   device.on('properties', (data) => {
//     //     console.log(data);
//     //   });

//     switch (mode) {
//         case 'on':
//             await device.init(); // connect to device and poll for properties
//             await device.setPower(true); // call the method
//             device.destroy();
//             break;
    
//         default:
//             break;
//     }
// }

const getMiiDevices = (username, password) => {
    return new Promise(async (resolve, reject) => {
        console.log(mihome.miCloudProtocol.CLIENT_ID);
        if (!mihome.miCloudProtocol.isLoggedIn) {
            await mihome.miCloudProtocol.login(username, password);
        }
        console.log('done logged in');

        const options = { country: 'sg' }; // 'ru', 'us', 'tw', 'sg', 'cn', 'de' (Default: 'cn')
        let lists = await mihome.miCloudProtocol.getDevices(null, options); // return all devices from your acount with all information (deviceId, token, model ...) to create device in the next step
        console.log('done getdevices');

        let devicesInfo = []
        
        console.log(lists);
        if (lists.length) {
            await Promise.all(
                lists.map(async device => {
    
    
                    if (device.isOnline) {
                        // let d = await mihome.miCloudProtocol.getDevice(device.did, { country: 'sg' })
                        // console.log(d);
    
                        let props = [
                            'power',
                            'mode',
                            'favorite_level',
                            'temp_dec',
                            'humidity',
                            'aqi',
                            'average_aqi',
                            'buzzer',
                            'led',
                            'led_b',
                            'filter1_life',
                            'f1_hour',
                            'f1_hour_used',
                            'motor1_speed',
                            'child_lock',
                          ]
                        await mihome.miCloudProtocol.miioCall(device.did, 'get_prop', props, {country: 'sg' })
                        .then(res => {
    
                            let result = {}
                            res.map((v, index) => result[props[index]] = v )
                            device.info = result
                            devicesInfo.push(device)
                            console.log(result)}); // call miio method with params via cloud protocol

                    } else {
                        devicesInfo.push(device)
                    }
                }))
            
        }

        resolve(devicesInfo || []);
        
        // res.send(lists || []);

    })
}

exports.faanfaan = functions.https.onRequest((request, response) => {
    // response.send("hello")


    // create LINE SDK config from env variables
    const config = {
        channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
        channelSecret: process.env.CHANNEL_SECRET,
    };

    // create LINE SDK client
    const client = new line.Client(config);

    if (!request.body.destination) {
        return response.status(200).end();
    }

    // req.body.events should be an array of events
    if (!Array.isArray(request.body.events)) {
        return response.status(500).end();
    }

    // handle events separately
    Promise.all(request.body.events.map(handleEvent))
    .then(() => response.end())
    .catch((err) => {
        console.error(err);
        response.status(500).end();
    });

    function handleEvent(event) {

        switch (event.type) {
            case 'message':
              const message = event.message;
              switch (message.type) {
                case 'location':
                  return handleLocation(message);
                case 'text':
                  return handleText();
                case 'image':
                //   return handleImage(message, event.replyToken);
                case 'video':
                //   return handleVideo(message, event.replyToken);
                case 'audio':
                //   return handleAudio(message, event.replyToken);
                case 'sticker':
                //   return handleSticker(message, event.replyToken);
                default:
                    return Promise.resolve(null)
                  throw new Error(`Unknown message: ${JSON.stringify(message)}`);
              }
        
            case 'follow':
            //   return replyText(event.replyToken, 'Got followed event');
        
            case 'unfollow':
            //   return console.log(`Unfollowed this bot: ${JSON.stringify(event)}`);
        
            case 'join':
            //   return replyText(event.replyToken, `Joined ${event.source.type}`);
        
            case 'leave':
            //   return console.log(`Left: ${JSON.stringify(event)}`);
        
            case 'postback':
              let data = event.postback.data;
              if (data === 'DATE' || data === 'TIME' || data === 'DATETIME') {
                data += `(${JSON.stringify(event.postback.params)})`;
              }
            //   return replyText(event.replyToken, `Got postback: ${data}`);
        
            case 'beacon':
            //   return replyText(event.replyToken, `Got beacon: ${event.beacon.hwid}`);
        
            default:
                return Promise.resolve(null)
              throw new Error(`Unknown event: ${JSON.stringify(event)}`);

            }

        
        async function handleText() {

            let message = `${event.message}`
            if (event.source.type == 'group') {
                return Promise.resolve(null)
            }
             


            

        }

        function handleLocation(message) {
            console.log('====================================');
            console.log(message.latitude);
            console.log(message.longitude);
            console.log('====================================');
            return reply({
                type: 'location',
                title: message.title || 'Location:',
                address: message.address,
                latitude: message.latitude,
                longitude: message.longitude,
                })
        }


        

        function reply(payloads, silent) {
            client.replyMessage(event.replyToken, payloads, silent)
            .catch(err => {
                console.log(err.originalError.response.data);
            })
        }
            
    }
    

})

async function manageMiiDevice(mode) {

    let devices = await getMiiDevices(process.env.MIIUSERNAME, process.env.MIIPASS)
    if (!devices.length) {
        return(messagePayload('ไม่พบอุปกรณ์'))                
    }

    let messages = []
    devices.map(device => {
        if (!device.isOnline) return messages.push(messagePayload(`${device.name} ออฟไลน์`))
        const picked = (({
            name,
            ssid
        }) => ({
            name,
            ssid
        }))(device);

        let message = Object.entries(picked).map(([k, v]) => `${k}: ${v}`).join('\n')
        if (device.info) {
            message = [message, ...Object.entries(device.info).map(([k, v]) => `${k}: ${v}`).join('\n')].join('')
        }
        console.log(message);
        
        messages.push(messagePayload(message))
    })

    return messages
}