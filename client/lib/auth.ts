// Authentication library with JWT simulation
export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface AuthToken {
  token: string
  user: User
  expiresAt: string
}

// Mock database for users (in production, this would be Cloud SQL)
const USERS_KEY = "invoice_manager_users"
const SESSIONS_KEY = "invoice_manager_sessions"

// Password hashing simulation (in production, use bcrypt)
function hashPassword(password: string): string {
  // Simple hash simulation - in production use bcrypt
  return btoa(password + "salt_invoice_manager")
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

// JWT simulation
function generateToken(userId: string): string {
  const token = btoa(
    JSON.stringify({
      userId,
      iat: Date.now(),
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    }),
  )
  return token
}

export function validateToken(token: string): { userId: string } | null {
  try {
    const decoded = JSON.parse(atob(token))
    if (decoded.exp < Date.now()) {
      return null
    }
    return { userId: decoded.userId }
  } catch {
    return null
  }
}

export function getUsers(): Map<string, { email: string; password: string; name: string; createdAt: string }> {
  if (typeof window === "undefined") return new Map()
  const data = localStorage.getItem(USERS_KEY)
  if (!data) return new Map()
  return new Map(JSON.parse(data))
}

function saveUsers(users: Map<string, any>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(Array.from(users.entries())))
}

export function getCurrentSession(): AuthToken | null {
  if (typeof window === "undefined") return null
  const session = localStorage.getItem(SESSIONS_KEY)
  if (!session) return null

  const authToken = JSON.parse(session)
  const valid = validateToken(authToken.token)

  if (!valid) {
    localStorage.removeItem(SESSIONS_KEY)
    return null
  }

  return authToken
}

export function saveSession(authToken: AuthToken) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(authToken))
}

export function clearSession() {
  localStorage.removeItem(SESSIONS_KEY)
}

// Validation helpers
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Nieprawidłowy format adresu e-mail" }
  }
  return { valid: true }
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: "Hasło musi mieć co najmniej 8 znaków" }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "Hasło musi zawierać wielką literę" }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "Hasło musi zawierać cyfrę" }
  }
  return { valid: true }
}

// Auth operations
export async function register(
  email: string,
  password: string,
  name: string,
): Promise<{ success: boolean; error?: string; token?: AuthToken }> {
  // Validate email
  const emailValidation = validateEmail(email)
  if (!emailValidation.valid) {
    return { success: false, error: emailValidation.error }
  }

  // Validate password
  const passwordValidation = validatePassword(password)
  if (!passwordValidation.valid) {
    return { success: false, error: passwordValidation.error }
  }

  const users = getUsers()

  // Check if user exists
  for (const [, userData] of users) {
    if (userData.email === email) {
      return { success: false, error: "Użytkownik o tym adresie e-mail już istnieje" }
    }
  }

  // Create user
  const userId = crypto.randomUUID()
  const hashedPassword = hashPassword(password)

  users.set(userId, {
    email,
    password: hashedPassword,
    name,
    createdAt: new Date().toISOString(),
  })

  saveUsers(users)

  // Generate token
  const token = generateToken(userId)
  const authToken: AuthToken = {
    token,
    user: {
      id: userId,
      email,
      name,
      createdAt: new Date().toISOString(),
    },
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }

  saveSession(authToken)

  return { success: true, token: authToken }
}

export async function login(
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string; token?: AuthToken }> {
  const users = getUsers()

  // Find user
  let foundUser: { userId: string; userData: any } | null = null
  for (const [userId, userData] of users) {
    if (userData.email === email) {
      foundUser = { userId, userData }
      break
    }
  }

  if (!foundUser || !verifyPassword(password, foundUser.userData.password)) {
    return { success: false, error: "Niepoprawny e-mail lub hasło" }
  }

  // Generate token
  const token = generateToken(foundUser.userId)
  const authToken: AuthToken = {
    token,
    user: {
      id: foundUser.userId,
      email: foundUser.userData.email,
      name: foundUser.userData.name,
      createdAt: foundUser.userData.createdAt,
    },
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }

  saveSession(authToken)

  return { success: true, token: authToken }
}

export function logout() {
  clearSession()
}
