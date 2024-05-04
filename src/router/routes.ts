//对外暴露配置路由
export const constantRoute = [
  {
    //登录
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    name: 'login',
    meta: {
      title: '登录', //菜单标题
      hidden: true, //代表路由标题在菜单中是否隐藏  true:隐藏 false:不隐藏
      icon: 'Promotion', //菜单文字左侧的图标,支持element-plus全部图标
    },
  },
  {
    //登录成功以后展示数据的路由
    path: '/',
    component: () => import('@/layout/index.vue'),
    name: 'layout',
    meta: {
      title: '',
      hidden: false,
      icon: '',
    },
    redirect: '/home',
    children: [
      {
        path: '/home',
        component: () => import('@/views/home/index.vue'),
        meta: {
          title: '首页',
          hidden: false,
          icon: 'HomeFilled',
        },
      },
    ],
  },
  {
    path: '/statistics',
    component: () => import('@/layout/index.vue'),
    name: 'Statistics',
    meta: {
      title: '',
      hidden: false,
      icon: '',
    },
    redirect: '/statistics1',
    children: [
      {
        path: '/statistics1',
        component: () => import('@/views/statistics/index.vue'),
        name: 'st',
        meta: {
          title: '数据统计',
          icon: 'DataAnalysis',
        },
      },
    ],
  },
  {
    //404
    path: '/404',
    component: () => import('@/views/404/index.vue'),
    name: '404',
    meta: {
      title: '404',
      hidden: true,
      icon: 'DocumentDelete',
    },
  },
  // {
  //   path: '/screen',
  //   component: () => import('@/views/screen/index.vue'),
  //   name: 'Screen',
  //   meta: {
  //     hidden: false,
  //     title: '数据大屏',
  //     icon: 'Platform',
  //   },
  // },
  {
    path: '/acl',
    component: () => import('@/layout/index.vue'),
    name: 'Acl',
    meta: {
      title: '数据管理',
      icon: 'Notebook',
    },
    redirect: '/acl/user',
    children: [
      {
        path: '/acl/user',
        component: () => import('@/views/acl/user/index.vue'),
        name: 'User',
        meta: {
          title: '垃圾投放点',
        },
      },
      {
        path: '/acl/role',
        component: () => import('@/views/acl/role/index.vue'),
        name: 'Role',
        meta: {
          title: '其他垃圾中转站',
        },
      },
      {
        path: '/acl/permission',
        component: () => import('@/views/acl/permission/index.vue'),
        name: 'Permission',
        meta: {
          title: '厨余垃圾处理站',
        },
      },
      {
        path: '/acl/depot',
        component: () => import('@/views/acl/depot/index.vue'),
        name: 'Depot',
        meta: {
          title: '车辆出发点',
        },
      },
      {
        path: '/acl/truck',
        component: () => import('@/views/acl/truck/index.vue'),
        name: 'Truck',
        meta: {
          title: '车辆信息',
        },
      },
    ],
  },
  {
    path: '/product',
    component: () => import('@/layout/index.vue'),
    name: 'Product',
    meta: {
      title: '运输路径规划',
      icon: 'Van',
    },
    redirect: '/product/garbsiplan',
    children: [
      {
        path: '/product/garbsiplan',
        component: () => import('@/views/decision/garbsiplan/index.vue'),
        name: 'Trademark',
        meta: {
          title: '其他垃圾',
        },
      },
      {
        path: '/product/attr',
        component: () => import('@/views/decision/kirouteplan/index.vue'),
        name: 'Attr',
        meta: {
          title: '厨余垃圾',
        },
      },
    ],
  },
  {
    path: '/sitedecison',
    component: () => import('@/layout/index.vue'),
    name: 'Sitedecison',
    meta: {
      title: '垃圾投放点规划',
      icon: 'MapLocation',
    },
    redirect: '/sitedecison/site',
    children: [
      {
        path: '/sitedecison/decision',
        component: () => import('@/views/sitedecision/decision/index.vue'),
        name: 'site',
        meta: {
          title: '任务规划',
        },
      },
      {
        path: '/sitedecison/site2',
        component: () => import('@/views/sitedecision/chart/index.vue'),
        name: 'site2',
        meta: {
          title: '解决方案详情',
        },
      },
    ],
  },
]

export const asyncRoute = [
  // {
  //   path: '/product',
  //   component: () => import('@/layout/index.vue'),
  //   name: 'Product',
  //   meta: {
  //     title: '运输路径规划',
  //     icon: 'Van',
  //   },
  //   redirect: '/product/garbsiplan',
  //   children: [
  //     {
  //       path: '/product/garbsiplan',
  //       component: () => import('@/views/decision/garbsiplan/index.vue'),
  //       name: 'Trademark',
  //       meta: {
  //         title: '其他垃圾',
  //       },
  //     },
  //     {
  //       path: '/product/attr',
  //       component: () => import('@/views/decision/kirouteplan/index.vue'),
  //       name: 'Attr',
  //       meta: {
  //         title: '厨余垃圾',
  //       },
  //     },
  //   ],
  // },
]

export const anyRoute = {
  //任意路由
  path: '/:pathMatch(.*)*',
  redirect: '/404',
  name: 'Any',
  meta: {
    title: '任意路由',
    hidden: true,
    icon: 'DataLine',
  },
}
