# question

## question list

- 使用 typedi 依赖注入问题 -- 即使没有用 DI，也需要在头部添加`@Service()`
  - 不需要使用依赖注入的 controller 报错`Service with "MaybeConstructable<XXXController>" identifier was not found in the container. Register it before usage via explicitly calling the "Container.set" function or using the "@Service()" decorator`
- typeorm 问题
  - 自定义扩展过的仓库无法使用事务，因为扩展仓库上的方法并没有定义在 EntityManager 上

## solved question list

- winston 无法获取文件地址或者记录文件名称 -- 使用包装方法
- 请求后报错 `Cannot set headers after they are sent to the client`，和 routing-controllers 包有关
  - 是因为 swagger 和 routing-controllers 有冲突，swagger 地址不能设置 `'/'`，或者 routing-controllers 需要升级到最新版
- swagger 渲染参数问题
  - entity 需要配置 class-validator
  - routing-controllers 的注解需要设置正确
- express 204 状态码返回，在 controller 层还是需要 return，无论 return 什么返回给客户端都是 204，并且没有响应内容；如果`return null`会自动设置为 204
- openapip-generator 生成 axios 问题
  - 如何设置 basepath -- openapi.json 需要有 `"servers": [{ "url": "http://[::1]:3000/" }]`
  - controller 层不要使用 options 会默认在 controller 加一个 options 的参数用于 axios

## to-do list

- mock server

## done list

- controllers 自动化引入 -- 使用 `Object.values(controllers).map(ele => ele)` 和 controllers/index.ts
- swagger -- express-ui + routing-controllers + routing-controllers-openapi + class-validator
- 可以访问 openapi.json
- unit test -- mocha + should + supertest
- 设置别名问题
  - build: tsc-alias
  - ts-node: tsconfig-paths
- 连接数据库，模型定义，以及基础 crud 方法包(orm/odm) -- 采用 typeorm
  - 需要注意版本，旧版本使用 `createConnection` ，已被废弃，采用 `new Datasource(opt)`
  - 使用 entites/migrations 数组时，使用`['src/entities/**/*.{js,ts}']`在 `npm run dev/start` 会出现下列问题
    - Unexpected token 'export/import'
    - Cannot use import/export statement outside a module
    - No metadata for \"XXXEntity\" was found.
    - 方案 1(推荐):
      - `entities: [join(__dirname, '..', 'entities/**/*.{ts,js}')]`
      - `migrations: [join(__dirname, '..', 'migrations/**/*.{ts,js}')]`
    - 方案 2:
      - 使用 `import XXXEntity` + `entities: [XXXEntity]`
  - synchronize 和 migrationsRun 两个配置需要小心配置，分别是启动项目就自动生成数据库架构和启动项目就自动生成数据库迁移
  - 增加 migration 的 npm-script，用来生成(`npm run typeorm:g`)、运行(`npm run typeorm:s`)、重置(`npm run typeorm:r`)migration，重置如果涉及删除表或者操作表数据操作，请谨慎使用，数据被删除将无法恢复
- 权限的中间件
- 引入 jwt
- 结果和报错做统一处理
- 参数验证
- 基础模板 crud，以及事务处理
- 后端 sdk -- 使用@openapitools/openapi-generator-cli
