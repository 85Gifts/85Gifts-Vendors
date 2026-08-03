export interface ResellerEvent {
  resellerId: string
  eventId: string
  eventName: string
  eventSlug: string
  referralCode: string
  resellerLink: string
  status: string
  name?: string
}

export interface ResellerTokens {
  accessToken: string
  refreshToken: string
}

export interface ResellerAuthResponse {
  success: boolean
  message: string
  email: string
  events: ResellerEvent[]
  tokens: ResellerTokens
}

export interface ResellerProfile {
  email: string
  events: ResellerEvent[]
}

export interface ResellerRefreshResponse {
  success: boolean
  data: {
    tokens: ResellerTokens
  }
}

export interface RequestCodeResponse {
  success: boolean
  data: {
    message: string
  }
}

export interface ApiEnvelope {
  success: boolean
  message?: string
  data?: any
  error?: string | { message?: string }
  code?: string
}
