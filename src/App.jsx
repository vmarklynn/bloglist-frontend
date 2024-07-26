import { useState, useEffect } from 'react'
import loginService from './services/login'
import Blog from './components/Blog'
import blogService from './services/blogs'

const Login = ({ username, password, setPassword, setUsername, onSubmit }) => {
  return (
    <div>
      <form onSubmit={onSubmit}>
        <label>Username</label>
        <input
          type="text"
          value={username}
          name="Username"
          onChange={(event) => setUsername(event.target.value)}
        />
        <label>Password</label>
        <input
          type="password"
          value={password}
          name="Password"
          onChange={(event) => setPassword(event.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  )
}

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [errorMessage, setErrorMessage] = useState(null)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [user, setUser] = useState(null)


  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs(blogs)
    )
  }, [])


  /* const handleSubmit = (event) => {
    event.preventDefault()
    console.log(`Logging in with credentials ${username} ${password}`)
  } */

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({ username, password })
      setUser(user)
      setUsername('')
      setPassword('')
      console.log("success")
    } catch (e) {
      setErrorMessage('Wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  return (
    <div>
      <h2>{user ? "Blogs" : "Log In to Application"}</h2>
      {
        !user &&
        <Login
          username={username}
          password={password}
          setUsername={setUsername}
          setPassword={setPassword}
          onSubmit={handleLogin}
        />
      }

      {user &&
        <div>
          <p>{user.name} is currently logged in</p>
          {blogs.map(blog =>
            <Blog key={blog.id} blog={blog} />)}
        </div>
      }


    </div>
  )
}

export default App






