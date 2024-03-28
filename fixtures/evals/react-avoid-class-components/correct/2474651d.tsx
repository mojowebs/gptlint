// Functional component with conditional rendering
function Greeting({ isLoggedIn }) {
  // This is correct as it uses a functional component for conditional rendering
  return (
    <div>{isLoggedIn ? <h1>Welcome back!</h1> : <h1>Please sign in.</h1>}</div>
  )
}

// Generated by gpt-4-0125-preview