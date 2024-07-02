import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as jwt from 'jsonwebtoken';
import {initializeApp, applicationDefault } from 'firebase-admin/app';
import { getMessaging } from "firebase-admin/messaging";
import admin from 'firebase-admin';

import { firstValueFrom } from 'rxjs';
import { ConfigurationService } from '@shafiqrathore/logeld-tenantbackend-common-future';
import { NotificationType } from 'shared/types';
// import admin from "firebase-admin"
const https = require('https');
const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');

const PROJECT_ID = 'driverbook-31002';
const HOST = 'fcm.googleapis.com';
const PATH = '/v1/projects/driverbook-31002/messages:send';
const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
const SCOPES = [MESSAGING_SCOPE];
@Injectable()
export class AppService {
  private readonly logger = new Logger('PushNotificationService');
  constructor(
    private readonly httpService: HttpService,
    private readonly configurationService: ConfigurationService,
  ) {

  }


  async  mainFunc() {
    const auth = new GoogleAuth({
      scopes: 'https://www.googleapis.com/auth/firebase.messaging'
    });
    const client = await auth.getClient();
    const projectId = await auth.getProjectId();
    const url = `https://dns.googleapis.com/dns/v1/projects/${PROJECT_ID}`;
    const res = await client.request({ url });
    console.log(res.data);
  }
  

  /**
   * V2 - added title
   * AUthor: Farzan
   */

  sendNotificationAPI = async (
    deviceToken: string,
    payload: NotificationType,
  ) => {
    try {
      
      // const accessToken = await this.getAccessToken();
     
      // const options = {
      //   hostname: HOST,
      //   path: PATH,
      //   method: 'POST',
      //   // [START use_access_token]
      //   headers: {
      //     Authorization: 'Bearer ' + accessToken.access_token,
      //   },
      //   // [END use_access_token]
      // };
      // const message = {
      //   notification: {
      //     title: "Notif",
      //     body: 'This is a Test Notification'
      //   },
      //   token: "YOUR FCM TOKEN HERE",
      // };
      
      let message = await this.sendNotif(deviceToken, payload,"title", "data");
      // getMessaging()
      //   .send(message)
      //   .then((response) => {
      //     console.log("Successfully sent message:", response);
      //    return {
      //       message: "Successfully sent message",
      //       token: deviceToken,
      //     };
      //   })
      //   .catch((error) => {
         
      //     console.log("Error sending message:", error);
      //   });
      
    //  await this.mainFunc().catch(console.error);
      // const request = await https.request(options, function(resp) {
      //   resp.setEncoding('utf8');
      //   resp.on('data', function(data) {
      //     console.log('Message sent to Firebase for delivery, response:');
      //     console.log(data);
      //   });
      // });

      // request.on('error', function(err) {
      //   console.log('Unable to send message to Firebase');
      //   console.log(err);
      // });

      // request.write(JSON.stringify(this.buildCommonMessage()));
      // request.end();
      // const url = 'https://fcm.googleapis.com/v1/projects/driverbook-31002/messages:send';
      // const config = {
      //   method: 'POST',
      //   headers: {
      //     Authorization: 'Bearer ' + accessToken.access_token,
      //     'Content-Type': 'application/json',
      //   },
      // };
      // const response = await firstValueFrom(
      //   this.httpService.post(url, this.buildCommonMessage(), config).pipe(),
      // );
      // // const response = await this.sendNotification(options);
      // console.log('Response:', response);

      // return response;
    } catch (error) {
      throw error;
    }
  };
  sendNotif = async (token,payload, title, body) => {
    try {
      if (!token || typeof token !== 'string') {
        throw new Error('Invalid FCM token provided');
      }
      payload
      let bodyData = JSON.stringify(payload.notificationObj)
      const message = {
        notification: {
         
          body: bodyData,
         
        },
        android: {
          // notification: {
          //   sound: "default",
          // },
          data: {
           
            body: body,
          },
        },
        token: token,
      };
      const response = await admin.messaging().send(message);
      console.log("Successfully sent message:", response);
    } catch (error) {
      console.error("Error sending message:", error.message);
      throw error;
    }
  };
  async sendNotification(options) {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
          data += chunk;
        });

        resp.on('end', () => {
          console.log('Message sent to Firebase for delivery, response:');
          console.log(data);
          resolve({ success: true, data });
        });
      });

      req.on('error', (err) => {
        console.log('Unable to send message to Firebase');
        console.log(err);
        reject({ success: false, error: err });
      });

      req.write(JSON.stringify(this.buildCommonMessage()));
      req.end();
    });
  }

  buildCommonMessage() {
    return {
      message: {
        topic: 'news',
        notification: {
          title: 'FCM Notification',
          body: 'Notification from FCM',
        },
      },
    };
  }
  getAccessToken = async () => {
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const expiresIn = 3600; // 1 hour in seconds
    const additionalClaims = {
      // Manually add iat and exp
      iat: now,
      exp: now + expiresIn,
    };

    const key = await require('../utils/service-account.json');
    const jwtClient = await new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      SCOPES,
    );
    const tokens = await jwtClient.authorize();
    return tokens;

    // const now = Math.floor(Date.now() / 1000); // Current time in seconds
    // const expiresIn = 60 * 60; // 1 hour in seconds
    // const key = require('../utils/service-account.json');

    // const payload = {
    //   iss: key.client_email,
    //   sub: key.client_email,
    //   aud: 'https://oauth2.googleapis.com/token',
    //   scope: SCOPES,
    //   iat: now,
    //   exp: now + expiresIn,
    // };

    // const token = jwt.sign(payload, key.private_key, { algorithm: 'RS256' });
    // return token;
  };
}
