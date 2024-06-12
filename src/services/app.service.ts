import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigurationService } from '@shafiqrathore/logeld-tenantbackend-common-future';
import { NotificationType } from 'shared/types';

@Injectable()
export class AppService {
  private readonly logger = new Logger('PushNotificationService');
  constructor(
    private readonly httpService: HttpService,
    private readonly configurationService: ConfigurationService,
  ) {}

  /**
   * V2 - added title
   * AUthor: Farzan
   */
  sendNotificationAPI = async (
    deviceToken: string,
    payload: NotificationType,
  ) => {
    try {
      const notificationTitle = payload.title;
      delete payload.title;
      const isSilent = payload.isSilent;
      delete payload.isSilent;

      // let silentObj = {};
      // if (isSilent) {
      //   silentObj = { content_available: true, priority: 'high' };
      // }

      const url = 'https://fcm.googleapis.com/fcm/send';
      const data = {
        to: deviceToken,
        // ...silentObj,
        /**
         * Replacing notification object with data
         * REASON:
         *      The android app will receive push in both cases if app is ON, in BACKGROUND or killed.
         */
        data: {
          title:
            notificationTitle != 'unidentified'
              ? notificationTitle
              : 'Log edit request',
          type: 'LOG_EDIT',
          body: payload,
        },
      };
      const config = {
        method: 'POST',
        headers: {
          Authorization: `key=${this.configurationService.get('SERVER_KEY')}`,
          'Content-Type': 'application/json',
        },
      };
      const response = await firstValueFrom(
        this.httpService.post(url, data, config).pipe(),
      );
      return response;
    } catch (error) {
      throw error;
    }
  };
}
