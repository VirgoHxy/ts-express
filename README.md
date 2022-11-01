# ts-express

This project was generated with express(4.18.1) + typescript.

## Install dependencies

```
npm i
```

## Run the application of js

```
npm start
```

You can also execute `node .` to run the application.

Open http://127.0.0.1:3000 in your browser.

## Run the application of ts

```
npm run dev
```

Open http://127.0.0.1:3000 in your browser.

## Build the application

```
npm run build
```

Open dist folder in your file system to check output.

## Build the api by openapi-axios

```
npm run build:sdk
```

```typescript
// 测试api用例
import { Configuration, PingApi } from './sdk';

// 这个config是公共的 作用于所有api
const config = new Configuration({
  basePath: 'http://localhost:3000',
});

class Test {
  static instance = new Test();

  constructor(private pingApi: PingApi = new PingApi(config)) {
    this.init();
  }

  async init() {
    try {
      const result = await this.pingApi.pingControllerPing();
      console.log(result.data);
    } catch (error) {
      console.log(error.message);
    }
  }
}
```

## Lint code style and formatting issues

```
npm run lint
```

## Fix code style and formatting issues

```
npm run lint:fix
```

## Run the test

```
npm run test
```

## Generate/Run/Revert the migrations

### generate

```
npm run typeorm:g
```

#### run

```
npm run typeorm:s
```

#### revert

```
npm run typeorm:r
```
