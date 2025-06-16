import LoginForm from "../components/LoginForm"

const Login = ({ debugMode }) => {
  return (
    <main>
      <LoginForm debugMode={debugMode} />
    </main>
  )
}
export default Login