import { useRef, useEffect } from 'react'
import io from 'socket.io-client'
import './App.css'

function App() {
  const socket = io("http://localhost:8080/");
  const configuration = { 
    offerToReceiveAudio: true,
    offerToReceiveVideo: true,
    "iceServers": [{ "url": "stun:stun.1.google.com:19302" }] 
  };
  const peer = new RTCPeerConnection(configuration);
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  useEffect(() => {
    
    peer.onicecandidate = async (icecandidate) => {
      if(icecandidate.candidate) {
        socket.emit("icecandidateserver", icecandidate.candidate);
      }
    }

    peer.ontrack = (e) => {
      remoteVideoRef.current.srcObject = e.streams[0];
    }

    socket.on('answerclient', async (offersdp) => {
      await peer.setRemoteDescription(offersdp);
      const answersdp = await peer.createAnswer();
      await peer.setLocalDescription(answersdp);
      socket.emit("answerserver", answersdp);
    });

    socket.on('offerclient', async (answersdp) => {
      await peer.setRemoteDescription(answersdp);
    });

    socket.on('icecandidateclient', async (candidate) => {
      console.log(candidate);
      await peer.addIceCandidate(candidate);
    });

    return () => {
      socket.off('answerclient');
      socket.off('offerclient');
      socket.off('icecandidateclient');
    };
  }, []);

  const startCall = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
        video: true
      });

      localVideoRef.current.srcObject = displayStream
      peer.addStream(displayStream);
      const offersdp = await peer.createOffer();
      await peer.setLocalDescription(offersdp);
      socket.emit("offerserver", offersdp)
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="App">
      <video ref={localVideoRef} width="400px" height="400px" muted autoPlay/>
      <video ref={remoteVideoRef} width="400px" height="400px" muted autoPlay/>
      <button type='submit' onClick={startCall}>Start Call</button>
    </div>
  )
}

export default App
