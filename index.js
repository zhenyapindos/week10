import * as handpose from 'https://cdn.skypack.dev/@tensorflow-models/handpose';
import * as tf from 'https://cdn.skypack.dev/@tensorflow/tfjs';

document.addEventListener('DOMContentLoaded', async () => {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('output');
    const fingerAnglesDiv = document.getElementById('fingerAngles');
    const ctx = canvas.getContext('2d');

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        video.srcObject = stream;

        await tf.setBackend('webgl');

        const model = await handpose.load();
        detectHand(model);
    } catch (err) {
        console.error('Error accessing webcam or loading handpose model:', err);
    }

    function detectHand(model) {
        async function runHandpose() {
            const predictions = await model.estimateHands(video);
            ctx.clearRect(0, 0, video.width, video.height);

            if (predictions.length > 0) {
                const hand = predictions[0];
                drawHand(hand);
                calculateFingerAngles(hand);
            }

            requestAnimationFrame(runHandpose);
        }

        runHandpose();
    }

    function drawHand(hand) {
        const landmarks = hand.landmarks;
    
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
    
        const fingers = [
            [0, 1, 2, 3, 4],   
            [0, 5, 6, 7, 8], 
            [0, 9, 10, 11, 12], 
            [0, 13, 14, 15, 16],
            [0, 17, 18, 19, 20] 
        ];

        fingers.forEach(fingerIndices => {
            for (let i = 0; i < fingerIndices.length - 1; i++) {
                const fromIndex = fingerIndices[i];
                const toIndex = fingerIndices[i + 1];
    
                const [x1, y1] = landmarks[fromIndex];
                const [x2, y2] = landmarks[toIndex];

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
    
                ctx.fillStyle = 'blue';
                ctx.fillText(fromIndex, x1, y1 - 5);
                ctx.fillText(toIndex, x2, y2 - 5);
            }
        });

        ctx.fillStyle = 'red';
        for (let i = 0; i < landmarks.length; i++) {
            const [x, y] = landmarks[i];
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fill();

            ctx.fillStyle = 'blue';
            ctx.fillText(i, x, y - 5);
        }
    }

    function calculateFingerAngles(hand) {
        const fingerJointIndices = [
            { name: 'Thumb', joints: [2, 4] },
            { name: 'Index', joints: [6, 8] },
            { name: 'Middle', joints: [10, 12] },
            { name: 'Ring', joints: [14, 16] },
            { name: 'Little', joints: [18, 20] }
        ];
    
        let anglesText = '';

        const vector1 = [hand.landmarks[12][0] - hand.landmarks[0][0], hand.landmarks[12][1] - hand.landmarks[0][1]]
        const vector2 = [hand.landmarks[8][0] - hand.landmarks[0][0], hand.landmarks[8][1] - hand.landmarks[0][1]]

        const magnitude1 = Math.sqrt(vector1[0] ** 2 + vector1[1] ** 2);
        const magnitude2 = Math.sqrt(vector2[0] ** 2 + vector2[1] ** 2);
        const dob1 = vector1[0] * vector2[0] + vector1[1] * vector2[1];

        const angle1 = Math.acos(dob1/(magnitude1 * magnitude2));

        anglesText += `${'\n Кут між середнім та вказівним ~ ' + angle1 * 100}`;

        const vector3 = [hand.landmarks[8][0] - hand.landmarks[0][0], hand.landmarks[8][1] - hand.landmarks[0][1]]
        const vector4 = [hand.landmarks[4][0] - hand.landmarks[0][0], hand.landmarks[4][1] - hand.landmarks[0][1]]

        const magnitude3 = Math.sqrt(vector3[0] ** 2 + vector3[1] ** 2);
        const magnitude4 = Math.sqrt(vector4[0] ** 2 + vector4[1] ** 2);
        const dob2 = vector3[0] * vector4[0] + vector3[1] * vector4[1];

        const angle2 = Math.acos(dob2/(magnitude3 * magnitude4));

        anglesText += `${'\n Кут між вказівним та великим ~ ' + angle2 * 100}`;

        const vector5 = [hand.landmarks[12][0] - hand.landmarks[0][0], hand.landmarks[12][1] - hand.landmarks[0][1]]
        const vector6 = [hand.landmarks[16][0] - hand.landmarks[0][0], hand.landmarks[16][1] - hand.landmarks[0][1]]

        const magnitude5 = Math.sqrt(vector5[0] ** 2 + vector5[1] ** 2);
        const magnitude6 = Math.sqrt(vector6[0] ** 2 + vector6[1] ** 2);
        const dob3 = vector5[0] * vector6[0] + vector5[1] * vector6[1];

        const angle3 = Math.acos(dob3/(magnitude5 * magnitude6));

        anglesText += `${'\n Кут між середнім та підмізинним ~ ' + angle3 * 100}`;

        const vector7 = [hand.landmarks[16][0] - hand.landmarks[0][0], hand.landmarks[16][1] - hand.landmarks[0][1]]
        const vector8 = [hand.landmarks[20][0] - hand.landmarks[0][0], hand.landmarks[20][1] - hand.landmarks[0][1]]

        const magnitude7 = Math.sqrt(vector7[0] ** 2 + vector7[1] ** 2);
        const magnitude8 = Math.sqrt(vector8[0] ** 2 + vector8[1] ** 2);
        const dob4 = vector7[0] * vector8[0] + vector7[1] * vector8[1];

        const angle4 = Math.acos(dob4/(magnitude7 * magnitude8));

        anglesText += `${'\n Кут між підмізинним та мизинцем ~ ' + angle4 * 100}`;

        fingerAnglesDiv.innerHTML = anglesText;
    }
});