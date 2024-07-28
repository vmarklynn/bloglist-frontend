import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import loginService from './services/login'
import './index.css'
import Blog from './components/Blog'
import blogService from './services/blogs'

const Alert = ({ show, text, error }) => {
  return (
    <div>
      {show && <h2 className={error ? "error" : "success"}>{text}</h2>}
    </div>
  )
}

const Togglable = forwardRef((props, refs) => {
  const [visible, setVisible] = useState(false)

  const hideWhenVisible = { display: visible ? 'none' : '' }
  const showWhenVisible = { display: visible ? '' : 'none' }

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  useImperativeHandle(refs, () => {
    return {
      toggleVisibility
    }
  })

  return (
    <div>
      <div style={hideWhenVisible}>
        <button onClick={toggleVisibility}>{props.buttonLabel}</button>
      </div>

      <div style={showWhenVisible}>
        {props.children}
        <button onClick={toggleVisibility}>Close</button>
      </div>
    </div>
  )
})

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

const BlogForm = ({ create }) => {
  const [author, setAuthor] = useState('')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const blog = {
      author: author,
      title: title,
      url: url,
    }
    create(blog)
    setTitle('')
    setAuthor('')
    setUrl('')
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>Title</label>
        <input
          type="text"
          value={title}
          name="Title"
          onChange={(event) => setTitle(event.target.value)}
        />
        <label>Author</label>
        <input
          type="text"
          value={author}
          name="Author"
          onChange={(event) => setAuthor(event.target.value)}
        />
        <label>URL</label>
        <input
          type="text"
          value={url}
          name="Url"
          onChange={(event) => setUrl(event.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [error, setErrorMessage] = useState(null)
  const [message, setMessage] = useState(null)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [user, setUser] = useState(null)

  const blogFormRef = useRef()

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs(blogs)
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogUser')
    if (loggedUserJSON) {
      console.log(loggedUserJSON)
      const user = JSON.parse(loggedUserJSON)
      blogService.setToken(user.token)
      setUser(user)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({ username, password })
      window.localStorage.setItem('loggedBlogUser', JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (e) {
      setErrorMessage('Wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogUser')
    setUser(null)
  }

  const handleLike = async (blogToUpdate) => {
    try {
      const userInfo = blogToUpdate.user
      const updatedBlog = await blogService.updateBlog(blogToUpdate)
      updatedBlog.user = userInfo
      const updatedBlogs = blogs.map(blog => blog.id === updatedBlog.id ? updatedBlog : blog)
      setBlogs(updatedBlogs)
    } catch (e) {
      setErrorMessage('Failed to Update')
      console.log(e.response.data.message)
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const createBlog = async (blogObject) => {
    try {
      console.log(user.token)
      console.log(window.localStorage.getItem('loggedBlogUser'))
      blogFormRef.current.toggleVisibility()
      const createdBlog = await blogService.createBlog(blogObject)
      createdBlog.user = {
        id: user.id,
        name: user.name,
        username: user.username
      }
      setBlogs(blogs.concat(createdBlog))
      setMessage(`A new blog ${createdBlog.title} by ${createdBlog.author} has been added`)
      setTimeout(() => {
        setMessage(null)
      }, 5000)
    } catch (e) {
      setErrorMessage('Failed to post blog')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000);
    }
  }

  return (
    <div>
      <Alert show={(error || message) ? true : false} text={error ? error : message} error={error ? true : false} />
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
          <p>{user.name} is currently logged in
            {user && <button onClick={handleLogout}>Log out</button>}
          </p>
          {blogs.map(blog =>
            <Blog key={blog.id} blog={blog} isCreator={user.username === blog.user.username} onLike={handleLike} />)}
        </div>
      }

      {user &&
        <Togglable buttonLabel="New Note" ref={blogFormRef}>
          <BlogForm
            create={createBlog}
          />
        </Togglable>
      }
    </div>
  )
}

export default App






