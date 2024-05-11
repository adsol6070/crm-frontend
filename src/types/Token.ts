export type Token = {
	accessToken: string
	refreshToken: string
}

interface Permissions {
	[category: string]: {
		[action: string]: boolean
	}
}

export interface DecodedToken {
	sub: string
	tenantID: string
	role: string
	iat: number
	exp: number
	type: string
	permissions?: Permissions
}
