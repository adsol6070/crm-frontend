export type Token = {
	token: string
}

export interface DecodedToken {
	sub: string // Typically used for the user ID or subject
	tenantID: string // Tenant ID associated with the user
	role: string // User role within the system
	iat: number // Issued At: Time when the token was issued, as Unix timestamp
	exp: number // Expiration time: Unix timestamp when the token expires
	type: string // Type of token, e.g., access or refresh
}
