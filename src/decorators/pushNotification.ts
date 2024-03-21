import { HttpStatus, Post, SetMetadata } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import {
  CombineDecorators,
  CombineDecoratorType,
  GetOperationId,
  ErrorType,
  NOTIFICATION,
} from '@shafiqrathore/logeld-tenantbackend-common-future';

export default function SendDecorators() {
  const SendDecorators: Array<CombineDecoratorType> = [
    Post('send'),
    SetMetadata('permissions', [NOTIFICATION.SEND]),
    ApiBearerAuth('access-token'),
    ApiResponse({ status: HttpStatus.OK }),
    ApiResponse({ status: HttpStatus.CONFLICT, type: ErrorType }),
    ApiOperation(GetOperationId('ELD', 'Add')),
  ];
  return CombineDecorators(SendDecorators);
}
