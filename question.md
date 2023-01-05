# question

## question list

- 使用 typedi 依赖注入问题 -- 即使没有用 DI，也需要在头部添加`@Service()`
  - 不需要使用依赖注入的 controller 报错`Service with "MaybeConstructable<XXXController>" identifier was not found in the container. Register it before usage via explicitly calling the "Container.set" function or using the "@Service()" decorator`
- routing-controllers-openapi 无法显示`@Body: Dto[]`这种数组形式的正常 schema，只能显示成`[{}]`

## solved question list

- winston 无法获取文件地址或者记录文件名称 -- 使用包装方法
- 请求后报错 `Cannot set headers after they are sent to the client`，和 routing-controllers 包有关
  - 是因为 swagger 和 routing-controllers 有冲突，swagger 地址不能设置 `'/'`，或者 routing-controllers 需要升级到最新版
- swagger 渲染参数问题
  - entity 需要配置 class-validator 的注解
  - routing-controllers 的注解需要设置正确
- swagger 无法接收 query 数组，只能收到一个数组元素，只能在 swagger 中的第一个元素写数组值而不是元素值
- swagger 中 query 使用 object 类型，还必须要在对象值中再定义一次字段值，例如：`where`是个 object，值应该是`{"where": {}}`
- swagger 无法发送 token 请求头 -- OpenAPIObject 加入下列配置

  ```javascript
    components: {
      // 其他配置

      // token配置
      securitySchemes: {
        bearerAuth: {
          type: 'apiKey',
          scheme: 'bearer',
          in: 'header',
          name: 'Authorization',
        },
      },
    },
    // token配置 这个一定要加
    security: [{ bearerAuth: [] }],
  ```

- openapi-generator 生成 axios 问题
  - 如何设置 basepath -- openapi.json 需要有 `"servers": [{ "url": "http://127.0.0.1:3000/" }]`
  - controller 层不要使用 options 字段作为参数，openapi 默认在 controller 加一个 options 的参数用于 axios sdk
- express 204 状态码返回，在 controller 层还是需要 return，无论 return 什么返回给客户端都是 204，并且没有响应内容；如果`return null`会自动设置为 204
- controller 的接口顺序问题
  - @Get('/records/:id')
  - @Patch('/records/:id')
  - @Delete('/records/:id')
  - 这三个接口会模糊匹配请求路径，当你的另一个接口，例如：@Get('/records/like')放在@Get('/records/:id')后面，这个 like 接口是不会被匹配到的。所以尽量不使用 Get，Patch，Delete 的`/records/xxx`的格式，如果要用请放在这三个接口的前面，或者使用 Post Method。
- typeorm 问题
  - 自定义扩展过的仓库无法使用事务，因为扩展仓库上的方法并没有定义在 EntityManager 上
  - EntityManager 增加自定义 exist 和 existOrFail 方法，并修改自定义仓库的 EntityManager
- 为什么要新创建一个 class 来使用 DTO，而不是使用 interface 和 entity
  - interface 因为在编译过程中是被删除的，也无法在 interface 上添加 swagger 的装饰器
  - entity 是因为单一性原则，每个类有自己不同的职种，entity 只负责与数据库模型对应，dto 负责每个传参的含义、类型以及是否必传（待考虑）
  - 个人觉得，以下通用接口和自定义接口都采用 dto，并通过分组添加不同的规则，dto 可以分为 request dto 主要验证参数和 response dto 主要控制返回字段显示
    - find
    - count
    - findById
    - updateById
    - deleteById
    - update
    - create
    - upsert
- class-validator 验证中间件和 routing-controllers 的自动验证冲突 -- 需要去掉一个验证，这里选择去掉 routing-controllers，在验证中间件做统一处理，只需要在接受参数的装饰器中添加`{ validate: false }`
- class-validator 无法正常校验数组 @ValidateNested 和 groups，只好改用循环使用 validate
- typeorm
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
  - 增加 migration 的 npm-script，用来生成(`npm run migrate:g`)、运行(`npm run migrate:s`)、重置(`npm run migrate:r`)migration，重置如果涉及删除表或者操作表数据操作，请谨慎使用，数据被删除将无法恢复

## to-do list

- 自定义复合型注解 -- 将重复注解进行解耦，一般是用于 controller 和 dto
- 新建 shared 文件夹作为唯一单例文件注入使用
- mock server
- unit test 示例书写

## done list

- controllers 自动化引入 -- 使用 `Object.values(controllers).map(ele => ele)` 和 controllers/index.ts
- swagger -- express-ui + routing-controllers + routing-controllers-openapi + class-validator
- swagger 运行正常，并替换 interface 为 dto
- logger -- winston
- unit test -- mocha + should + supertest
- 设置别名
  - build（编译）: tsc-alias
  - ts-node（运行）: tsconfig-paths
- 连接数据库，模型定义，以及基础 crud 方法包(orm/odm) -- 采用 typeorm
- 引入 jwt
- token 的中间件 -- middleware
- 结果和报错做统一处理 -- middleware
- 参数验证 -- class-validator
- 基础模板 crud，以及事务处理 -- typeorm repository
- 可以访问 openapi.json，用来生成 sdk
- 后端 sdk -- 使用@openapitools/openapi-generator-cli
- controller service entity repository dto 在 index.ts 导出等等模板写入，在 others 的 fs-template.ts 实现
