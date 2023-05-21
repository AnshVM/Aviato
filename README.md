# Aviatojs
A simple library to trim, cut and join audio files.

# Usage

For a fully working example refer to [this example](https://github.com/AnshVM/Aviato/blob/main/examples/react-ts-example/src/App.tsx)

### Importing
   ```javascript
   import  {AviatoAudio}  from  'aviatojs'
   ```
### Initialising
   ```javascript
   const audio1  =  new  AviatoAudio(document.getElementById('audio1'));
   //playing audio
   audio1.play();
   //pausing audio
   audio2.pause();
   ```

### Trimming 
   ```javascript
   audio1.trim({start:"20s",end:"25s"})
   //or
   audio2.trim({start:"10%",end:"75%"})
   //or
   audio2.trim({start:10,end:75}) //also trims by percentage
   ``` 
### Joining
   ```javascript
   const audio1  =  new  AviatoAudio(document.getElementById('audio1'));
   const audio2  =  new  AviatoAudio(document.getElementById('audio2'));
   audio1.append(audio2) 
   ```
### Cut / Remove a part of audio
   ```javascript
   //removes the mentioned part from the audio
   audio2.cut({start:'5s',end:'10s'});
   //or
   audio2.cut({start:'5%',end:'10%'});
   //or
   audio2.cut({start:5,end:10}); //also cuts by percentage
   ```
### Converting to mp3
After performing trim,cut or append operations, you might want to convert the AviatoAudio object back to mp3 so that users can download the new audio file or something.
   ```javascript
   //you might wanna convert back to mp3 after performing trim/append operations.
   //you can do that like this
     
   audio1.convertToMP3()
   .then((url:String)=>console.log(url))
    
   //returns a url which contains the audio file in mp3 format
   //this url can then be set as the src attribute of another audio element
   ```
