
/*
Setup Instructions
1. INSTALL LIBRARY, from terminal: npm install --save @google-cloud/text-to-speech

2. Application environment variable for automatic credentialing with our G-Cloud Account:

    In WebStorm: FROM TOOL BAR: Run > Edit Configurations > Environment Variables
                > click + to add >
                (key, has to be exact): GOOGLE_APPLICATION_CREDENTIALS
                (field is local path to authentication json file)
3. Test it!


(don't need this if doing automatic credentials, not sure how to set up
environmental variables in other IDEs....
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/credential/file.json";)
*/

// Imports the Google Cloud client library
const textToSpeech = require('@google-cloud/text-to-speech');

// Import other required libraries
const fs = require('fs');
const util = require('util');


//THIS IS OUR PROJECT ID:
const projectId = 'amiable-anagram-344820'
// THIS IS WHERE YOU PUT THE LOCAL PATH TO OUR AUTHENTICATION DETAILS .JSON FILE
const keyFilename = 'Users/cat/Documents/SCHOOL/UNCC/spring_2022/capstone_course/dyntts_files/amiable-anagram-344820-98a8eadb0d30.json'
// Creates a new client
const client = new textToSpeech.TextToSpeechClient(projectId, keyFilename);

async function quickStart() {

    // ** THE TEXT TO SYNTHESIZE ** //
    const text = 'Welcome to Dynamic TTS, let\'s get it done! Testing new file!';

    // Construct the request
    const request = {
        input: {text: text},
        // Select the language and SSML voice gender (optional)
        // LIST OF VOICES and their PARAMETERS: https://cloud.google.com/text-to-speech/docs/voices
        voice: {languageCode: 'en-AU', name:"en-AU-Standard-C", ssmlGender: 'FEMALE'},
        // select the type of audio encoding
        //speed, herz, etc.
        audioConfig: {audioEncoding: 'MP3'},
    };

    // Performs the text-to-speech request
    const [response] = await client.synthesizeSpeech(request);
    // Write the binary audio content to a local file
    const writeFile = util.promisify(fs.writeFile);
    await writeFile('output.mp3', response.audioContent, 'binary');
    console.log('Audio content written to file: output.mp3');
}
quickStart();