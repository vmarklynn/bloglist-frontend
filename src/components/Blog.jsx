import { useState } from "react"

const Blog = ({ blog }) => {
  const [visible, setVisible] = useState(false)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  return (
    <div style={blogStyle}>
      <p>{blog.title} - {blog.author} <button onClick={toggleVisibility}>{visible ? "Hide" : "View"}</button></p>
      {visible &&
        <div>
          <p>{blog.url}</p>
          <p>{blog.likes} <button>Like</button></p>
          <p>{blog.user ? blog.user.name : ''}</p>
        </div>
      }
    </div>
  )
}



export default Blog
