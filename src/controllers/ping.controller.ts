import { Controller, Get } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Service } from 'typedi';

@Service()
@Controller()
export class PingController {
  @Get('/ping')
  @OpenAPI({ summary: 'Return OK' })
  ping() {
    return 'OK';
  }
}
