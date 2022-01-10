let myID = prompt("Please enter your name");
const socket = io('/');
const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video');
myVideo.muted = true;
//Init PeerJS
var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
});

let myVideoStream;
navigator.mediaDevices.getUserMedia({
    //Turn on or off the webcam/mic
    video: true,
    audio: true
}).then(stream => {
    //Create a video stream and add it to the view
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    //Get message using JQuery
    let message = $('input');

    $('html').keydown((e) => {
        //If enter is pressed
        if(e.which == 13 && message.val().length !== 0) {
            //Sending a the value of the input
            socket.emit('message', message.val(), myID);
            //Clear the input
            message.val('');
        }
    });
    

    socket.on('createMessage', (message, name) => {
        //Append a message to the view
        $('.messages').append(`<li class="message"><b>${name}</b><br/>${message}</li>`);
        scrollToBottom();
    })

})

//Answer the call 
peer.on('call', call => {
    call.answer(stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
})
//When a new user gets connected,...
socket.on('user-connected', (userId) => {
    connectToNewUser(userId, stream);
})

peer.on('open', id => {
    //Give an ID to the user when they join
    socket.emit('join-room', ROOM_ID, id);
})

const connectToNewUser = (userId, stream) => {
    //Prepare to give away our stream
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    //Calling the new user
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    })
}

const addVideoStream = (video, stream) => {
    //Links the stream to the <div/> int the view and starts it
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () =>{
        video.play();
    })
    videoGrid.append(video);
}

const scrollToBottom = () => {
    //Scroll to the end of chat
    let d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}

const muteUnmute = () => {
    //Check if the mic is muted from the video stream
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        //Mute if unmuted
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    }
    else{
        //Unmute if unmuted
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    //Change to mute button in the view
    const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
    //Change to unmute button in the view
    const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span style="color: #eb534b;">Unmute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}

const playStop = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        //Stop the video if it was playing
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    }
    else{
        //Play video if it was stopped
        setStopVideo();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setStopVideo = () => {
    //Change to stop button in the view
    const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
    //Change to play button in the view
    const html = `
    <i class="stop fas fa-video-slash"></i>
    <span style="color: #eb534b;">Play Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}

