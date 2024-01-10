//登录接口需要携带参数ts类型
export interface loginFormData {
  username: string
  password: string
}

//登录接口返回数据类型
interface dataType {
  token?: string
  message?: string
}
export interface ResponseData {
  code: number
  message: string
  ok: boolean
}
export interface loginResponseData extends ResponseData {
  data: string
}

// 定义服务器返回用户信息相关数据类型
export interface userInfoResponseData extends ResponseData {
  data: {
    routes: string[]
    buttons: string[]
    roles: string[]
    name: string
    avatar: string
  }
}
