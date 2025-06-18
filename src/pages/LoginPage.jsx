import LoginForm from "../components/LoginForm"
import PropTypes from "prop-types"

const Login = ({ debugMode }) => {
  return (
    <main>
      <LoginForm debugMode={debugMode} />
    </main>
  )
}

// 👇 Give the component a name for debugging purposes
Login.displayName = "Login Page"

// 👇 Define PropTypes
Login.propTypes = {
  debugMode: PropTypes.bool.isRequired,
}

export default Login