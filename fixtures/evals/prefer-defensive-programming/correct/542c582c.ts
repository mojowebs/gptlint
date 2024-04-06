// Use Partial utility type to handle incomplete data
interface UserProfile {
  name: string
  email: string
  age?: number
}

function createUserProfile(data: Partial<UserProfile>) {
  const userProfile: UserProfile = {
    name: data.name ?? 'Unknown',
    email: data.email ?? 'Unknown',
    age: data.age
  }
  // Further processing
}
// This adheres to defensive programming by handling potentially incomplete data gracefully.

// Generated by gpt-4-0125-preview