import { Injectable, Logger } from '@nestjs/common';
import { ConfigurationService } from '@shafiqrathore/logeld-tenantbackend-common-future';
import * as apn from 'apn';
import path from 'path';

// Setting certificate for UAT and other servers
const pfx = path.join(__dirname, `./../../.pem`); // path to certificates

@Injectable()
export class ApnProvider {
  private readonly apnProvider: apn.Provider;

  constructor() {
    this.apnProvider = new apn.Provider({
      cert: pfx,
      key: pfx,
    });
  }

  async sendNotificationIOS(deviceToken, payload) {
    const notification = new apn.Notification({
      aps: {
        'content-available': 1,
      },
    });
    // notification.topic = process.env.IOS_PUSH_BUNDLE_ID; // Replace with your app's bundle identifier
    notification.topic = `com.tekhqs.logELD`; // Replace with your app's bundle identifier
    notification.alert = payload.title;
    notification.payload = payload.notificationObj;

    const response = await this.apnProvider
      .send(notification, [deviceToken])
      .then((success) => {
        Logger.log('Notification dispatch successfull!', success);
        return success;
      })
      .catch((error) => {
        Logger.error('Notification dispatch failed!');
      });

    return {
      statusCode: 200,
      message: 'Notification dispatched successfully!',
      data: response,
    };
  }

  getProvider(): apn.Provider {
    return this.apnProvider;
  }
}
