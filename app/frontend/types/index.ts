export type FlashData = {
  notice?: string
  alert?: string
  ts?: number
}

export type UserData = {
  id: number
  name: string
  email: string
}

export type SharedProps = {
  user?: UserData
  flash?: FlashData
}
