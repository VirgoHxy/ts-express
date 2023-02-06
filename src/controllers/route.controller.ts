import { authMiddleware, resultMiddleware } from 'middlewares';
import { Get, JsonController, UseBefore } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Service } from 'typedi';

@Service()
@JsonController('/routes')
@UseBefore(authMiddleware, resultMiddleware)
export class RouteController {
  @Get('/getAsyncRoutes')
  @OpenAPI({ summary: 'Return static data' })
  getAsyncRoutes() {
    return [
      {
        path: '/permission',
        meta: {
          title: '权限管理',
          icon: 'lollipop',
          rank: 10,
        },
        children: [
          {
            path: '/permission/page/index',
            name: 'PermissionPage',
            meta: {
              title: '页面权限',
              roles: ['admin', 'common'],
            },
          },
          {
            path: '/permission/button/index',
            name: 'PermissionButton',
            meta: {
              title: '按钮权限',
              roles: ['admin', 'common'],
              auths: ['btn_add', 'btn_edit', 'btn_delete'],
            },
          },
        ],
      },
    ];
  }
}
