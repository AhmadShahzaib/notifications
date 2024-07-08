import { Body, Req, Res, UseInterceptors } from '@nestjs/common';
import { Controller, Inject, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import {
  BaseController,
  MessagePatternResponseInterceptor,
} from '@shafiqrathore/logeld-tenantbackend-common-future';
import SendDecorators from 'decorators/pushNotification';
import { Response } from 'express';
import { mapKeys, camelCase } from 'lodash';
import { RequestModel } from 'models/requestModel';

import { AppService } from '../services/app.service';
import { ApnProvider } from 'services/apn.service';

@Controller('PushNotification')
@ApiTags('PushNotification')
export class AppController extends BaseController {
  private readonly logger = new Logger('PushNotification App Controller');
  constructor(
    @Inject('AppService') private readonly appService: AppService,
    @Inject('ApnProvider') private readonly apnService: ApnProvider,
  ) {
    super();
  }

  @MessagePattern({ cmd: 'send_notification' })
  @UseInterceptors(new MessagePatternResponseInterceptor())
  async tcp_send_notification({ deviceToken, data }): Promise<void | Error> {
    let response;
    try {
      Logger.log(`Notification is about to send the device <ANDROID> : ${deviceToken}`);
      const result = await this.appService.sendNotificationAPI(
        deviceToken,
        data,
      );
      response = true;
    } catch (error) {
      Logger.error({ message: error.message, stack: error.stack });
      response = error;
    }
    return response;
  }

  @MessagePattern({ cmd: 'send_notification_IOS' })
  // @UseInterceptors(new MessagePatternResponseInterceptor())
  async tcp_send_notification_IOS({
    deviceToken,
    data,
  }): Promise<void | Error> {
    let response;
    try {
      Logger.log(`Notification is about to send the device <IOS> : ${deviceToken}`);
      const result = await this.apnService.sendNotificationIOS(
        deviceToken,
        data,
      )
      console.log(result);
      response = result;
    } catch (error) {
      Logger.log(`Notification error appear here ===== >>>>>`);
      Logger.error({ message: error.message, stack: error.stack });
      response = error;
    }
    Logger.log(`Notification is sent ===== >>>>>`);
    
    return response;
  }

  @SendDecorators()
  async sendNotification(
    @Body() model: RequestModel,
    @Res() response: Response,
  ) {
    try {
      Logger.log(
        `Notification is about to send the device${model.deviceToken}`,
      );
      const result = await this.appService.sendNotificationAPI(
        model.deviceToken,
        model.notification,
      );
      return response.status(200).send({
        message: 'Success',
        // data: result.data,
      });
    } catch (error) {
      throw error;
    }
  }
}
