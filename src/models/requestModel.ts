import { ApiProperty } from '@nestjs/swagger';
import { NotificationModel } from './notificationModel';
export class RequestModel {
  @ApiProperty()
  notification: NotificationModel;
  @ApiProperty()
  deviceToken: string;
}
