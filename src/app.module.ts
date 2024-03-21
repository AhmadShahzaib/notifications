import { Module } from '@nestjs/common';
import { AppService } from './services/app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigurationService, MessagePatternResponseInterceptor ,SharedModule} from '@shafiqrathore/logeld-tenantbackend-common-future';
import { AppController } from './controllers/app.controller';
import { Transport, ClientProxyFactory } from '@nestjs/microservices';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HttpModule } from '@nestjs/axios';
import { ApnProvider } from 'services/apn.service';

const getProxyObject = (
  proxyName: string,
  hostPort: string,
  tcpPort: string,
) => {
  return {
    provide: proxyName,
    useFactory: (config: ConfigurationService) => {
      return ClientProxyFactory.create({
        transport: Transport.TCP,
        options: {
          port: Number(config.get(tcpPort)),
          host: config.get(hostPort)
        },
      });
    },
    inject: [ConfigurationService],
  };
};

@Module({
  imports: [ SharedModule,MongooseModule.forRootAsync({
    useFactory: async (configService: ConfigurationService) => ({
      uri: configService.mongoUri,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }),
    inject: [ConfigurationService],
  }),
  HttpModule.register({
    timeout: 5000,
    maxRedirects: 5,
  })],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: MessagePatternResponseInterceptor,
    },
    { useClass: AppService, provide: 'AppService' },
    { useClass: ApnProvider, provide: 'ApnProvider' },
    ConfigurationService,
    AppService
  ]
})

export class AppModule {
  static port: number | string;
  static isDev: boolean;

  constructor(private readonly _configurationService: ConfigurationService) {
    AppModule.port = AppModule.normalizePort(
      this._configurationService.get('SELF_MICROSERVICE_HOST'),
    );
    AppModule.isDev = this._configurationService.isDevelopment;
  }

  /**
   * Normalize port or return an error if port is not valid
   * @param val The port to normalize
   */
  private static normalizePort(val: number | string): number | string {
    const port: number = typeof val === 'string' ? parseInt(val, 10) : val;

    if (Number.isNaN(port)) {
      return val;
    }

    if (port >= 0) {
      return port;
    }

    throw new Error(`Port "${val}" is invalid.`);
  }
}
