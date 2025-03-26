/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

const serviceAccount = require('./pwa-course-90792-firebase-adminsdk-fbsvc-3cc5573b67.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://pwa-course-90792-default-rtdb.firebaseio.com',
});

exports.storePostData = onRequest((request, response) => {
  logger.info('Hello logs!', { structuredData: true });

  cors(request, response, () => {
    const body = request.body;
    admin
      .database()
      .ref('posts')
      .push({
        id: body.id,
        title: body.title,
        location: body.location,
        image: body.image,
      })
      .then(function () {
        response.status(201).json({ message: 'Data stored', id: body.id });
      })
      .catch(function (error) {
        response.status(500).json({ error: error });
      });
  });
});
