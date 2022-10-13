import { Controller, Get } from 'routing-controllers';

@Controller()
export class PingController {
  @Get('/ping')
  ping() {
    return 'OK';
  }
}
