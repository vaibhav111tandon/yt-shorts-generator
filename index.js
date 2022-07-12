
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const fetch = require('node-fetch')
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Say = require('say').Say
const say = new Say('darwin' || 'win32' || 'linux')

const port = process.env.PORT || 3000

const app = express();

app.use(bodyParser.json());
app.use(cors());

ffmpeg.setFfmpegPath(ffmpegPath);

app.get('/', (req, res) => {
    let num = Math.floor(Math.random()*1000);
    fetch(`http://numbersapi.com/${num}/math?json`)
    .then(res => res.json())
    .then(text => {
        console.log(text);
        say.export(text.text, null, 1, 'hal.wav', (err) => {
            if (err) {
              return console.error(err)
            }
            let textBreak = text.text.split(' ');
            let halfLength = textBreak.length/2;

            let text1 = textBreak.filter((d, i) => {
              if(i < halfLength){
                return d
              }
            }).join(' ');

            let text2 = textBreak.filter((d, i) => {
              if(i >= halfLength){
                return d
              }
            }).join(' ');

            let k = ffmpeg().addInput('./video.mp4').addInput('./hal.wav').setDuration(10)
            .videoFilters({
                filter: 'drawtext',
                options: {
                  text: `${text1}\n${text2}`,
                  fontsize: 50,
                  fontcolor: "000000",
                  box: 1,
                  boxcolor: "white",
                  x: "(w-text_w)/2+10",
                  y: "(h-text_h)/2+10"
                }
              }).save('./test.mp4')
            // display progress
            .on('progress', function(progress) {
                console.log(progress);
            })
            .on('error', function(err) {
                console.log('An error occurred: ' + err.message);
            })
            // after whole merging operation is finished
            .on('end', function() {
                console.log('Processing finished !');
                res.download('./test.mp4')
            });
          })
    });
});
  
app.listen(port, () => {
    console.log('listening on port: ', port);
});