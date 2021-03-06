import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'
import Welcome from '../components/Welcome'
import User from '../components/system/User'
import Icon from '../components/system/Icon'
import Permission from '../components/system/Permission'
import Role from '../components/system/Role'
import Employeestate from '../components/company/Employeestate'
import Leavetype from '../components/company/Leavetype'
import Organization from '../components/company/Organization'
import Department from '../components/company/Department'
import Job from '../components/company/Job'

import Cate from '../components/goods/Cate'
import Params from '../components/goods/Params'
import GoodsList from '../components/goods/List'
import Add from '../components/goods/Add'
import Order from '../components/order/Order'
import Report from '../components/report/Report'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/user',
        component: User
      },
      {
        path: '/icon',
        component: Icon
      },
      {
        path: '/permission',
        component: Permission
      },
      {
        path: '/role',
        component: Role
      },
      {
        path: '/organization',
        component: Organization
      },
      {
        path: '/department',
        component: Department
      },
      {
        path: '/job',
        component: Job
      },
      {
        path: '/employeestate',
        component: Employeestate
      },
      {
        path: '/leavetype',
        component: Leavetype
      },
      {
        path: '/categories',
        component: Cate
      },
      {
        path: '/params',
        component: Params
      },
      {
        path: '/goods',
        component: GoodsList
      },
      {
        path: '/goods/add',
        component: Add
      },
      {
        path: '/orders',
        component: Order
      },
      {
        path: '/reports',
        component: Report
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行 next()--直接放行 next('/login')--强制跳转
  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
