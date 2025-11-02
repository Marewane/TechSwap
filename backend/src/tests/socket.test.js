// src/tests/socket.test.js
import io from 'socket.io-client';

// --- Configuration ---
const SOCKET_URL = 'http://localhost:5000'; // Your backend URL
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGVkMWE2MzQ1Mzc2OWIxYTdjYWU1ZDkiLCJpYXQiOjE3NjE3MzUxMDYsImV4cCI6MTc2MzAzMTEwNn0.Gvdh-6gCwC-6lYk5Oa6quuJjfMHXVIETKsTnTyq48Z4'; // Replace with a real token from your app
const TEST_SESSION_ID = '6904c67946bf4b07914e7a54'; // Replace with a real session ID

// --- Test Functions ---

/**
 * Test 1: Connect with valid JWT
 */
async function testConnection() {
  console.log('--- Test 1: Socket.IO Connection ---');
  
  return new Promise((resolve, reject) => {
    // Connect with valid JWT token
    const socket = io(SOCKET_URL, {
      auth: {
        token: JWT_TOKEN
      },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('✅ Connected to Socket.IO server with ID:', socket.id);
      resolve(socket);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Connection Error:', error.message);
      reject(error);
    });

    socket.on('error', (error) => {
      console.error('❌ Socket Error:', error);
      reject(error);
    });

    // Timeout after 5 seconds
    setTimeout(() => {
      console.error('❌ Connection Timeout');
      reject(new Error('Connection timeout'));
    }, 5000);
  });
}

/**
 * Test 2: Join Session Room
 */
async function testJoinSession(socket) {
  console.log('\n--- Test 2: Join Session Room ---');
  
  return new Promise((resolve, reject) => {
    // Listen for success response
    socket.once('session-joined', (data) => {
      console.log('✅ Session joined successfully:', data);
      resolve(data);
    });

    // Listen for error response
    socket.once('error', (error) => {
      console.error('❌ Join Session Error:', error);
      reject(error);
    });

    // Emit join-session event
    console.log(`Emitting 'join-session' for session ID: ${TEST_SESSION_ID}`);
    socket.emit('join-session', TEST_SESSION_ID);

    // Timeout after 5 seconds
    setTimeout(() => {
      console.error('❌ Join Session Timeout');
      reject(new Error('Join session timeout'));
    }, 5000);
  });
}

/**
 * Test 3: Leave Session Room
 */
async function testLeaveSession(socket) {
  console.log('\n--- Test 3: Leave Session Room ---');
  
  return new Promise((resolve, reject) => {
    // Listen for success response
    socket.once('session-left', (data) => {
      console.log('✅ Session left successfully:', data);
      resolve(data);
    });

    // Listen for error response
    socket.once('error', (error) => {
      console.error('❌ Leave Session Error:', error);
      reject(error);
    });

    // Emit leave-session event
    console.log(`Emitting 'leave-session' for session ID: ${TEST_SESSION_ID}`);
    socket.emit('leave-session', TEST_SESSION_ID);

    // Timeout after 5 seconds
    setTimeout(() => {
      console.error('❌ Leave Session Timeout');
      reject(new Error('Leave session timeout'));
    }, 5000);
  });
}

/**
 * Test 4: WebRTC Signaling Events
 */
async function testWebRTCSignaling(socket) {
  console.log('\n--- Test 4: WebRTC Signaling Events ---');
  
  return new Promise((resolve, reject) => {
    let offerReceived = false;
    let answerReceived = false;
    let iceCandidateReceived = false;

    // Listen for WebRTC events
    const offerListener = (data) => {
      console.log('✅ WebRTC Offer received:', data.offer?.type);
      offerReceived = true;
      checkCompletion();
    };

    const answerListener = (data) => {
      console.log('✅ WebRTC Answer received:', data.answer?.type);
      answerReceived = true;
      checkCompletion();
    };

    const iceCandidateListener = (data) => {
      console.log('✅ WebRTC ICE Candidate received:', data.candidate?.candidate?.substring(0, 50) + '...');
      iceCandidateReceived = true;
      checkCompletion();
    };

    const checkCompletion = () => {
      if (offerReceived && answerReceived && iceCandidateReceived) {
        console.log('✅ All WebRTC signaling events received');
        socket.off('webrtc-offer', offerListener);
        socket.off('webrtc-answer', answerListener);
        socket.off('webrtc-ice-candidate', iceCandidateListener);
        resolve();
      }
    };

    // Attach listeners
    socket.on('webrtc-offer', offerListener);
    socket.on('webrtc-answer', answerListener);
    socket.on('webrtc-ice-candidate', iceCandidateListener);

    // Emit test WebRTC events
    console.log('Emitting test WebRTC events...');
    
    // Test offer
    socket.emit('webrtc-offer', {
      offer: { type: 'offer', sdp: 'test-offer-sdp' },
      targetUserId: 'test-user-id',
      sessionId: TEST_SESSION_ID
    });

    // Test answer
    socket.emit('webrtc-answer', {
      answer: { type: 'answer', sdp: 'test-answer-sdp' },
      targetUserId: 'test-user-id',
      sessionId: TEST_SESSION_ID
    });

    // Test ICE candidate
    socket.emit('webrtc-ice-candidate', {
      candidate: { candidate: 'test-ice-candidate', sdpMid: '0', sdpMLineIndex: 0 },
      targetUserId: 'test-user-id',
      sessionId: TEST_SESSION_ID
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      console.error('❌ WebRTC Signaling Timeout');
      socket.off('webrtc-offer', offerListener);
      socket.off('webrtc-answer', answerListener);
      socket.off('webrtc-ice-candidate', iceCandidateListener);
      reject(new Error('WebRTC signaling timeout'));
    }, 10000);
  });
}

/**
 * Test 5: Disconnect
 */
async function testDisconnect(socket) {
  console.log('\n--- Test 5: Disconnect ---');
  
  return new Promise((resolve) => {
    socket.on('disconnect', (reason) => {
      console.log('✅ Disconnected from Socket.IO server. Reason:', reason);
      resolve();
    });

    console.log('Disconnecting...');
    socket.disconnect();
  });
}

// --- Run Tests ---
async function runTests() {
  console.log('🚀 Starting Socket.IO Server Tests...\n');
  
  try {
    // Test 1: Connect
    const socket = await testConnection();
    
    // Test 2: Join Session
    await testJoinSession(socket);
    
    // Test 3: Leave Session
    await testLeaveSession(socket);
    
    // Test 4: WebRTC Signaling (Optional - can be skipped if not implemented yet)
    // await testWebRTCSignaling(socket);
    
    // Test 5: Disconnect
    await testDisconnect(socket);
    
    console.log('\n🎉 All Socket.IO tests completed successfully!');
  } catch (error) {
    console.error('\n💥 Socket.IO tests failed:', error.message);
    console.error('Please check your backend server console for more details.');
  }
}

// Run the tests
runTests();

export default runTests;