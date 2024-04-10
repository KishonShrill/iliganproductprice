import { BrowserRouter, Route, Switch as Routes } from "react-router-dom";
import { Container, Col, Row } from "react-bootstrap";
// import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';

import Login from './components/Login.jsx'
import FreeComponent from './components/FreeComponent.jsx';
import AuthComponent from './components/AuthComponent.jsx';
import ProtectedRoutes from "./components/ProtectedRoutes.jsx";

function App() {

  return (
    <>
      <BrowserRouter>
        <Container>
          <Row>
            <Col className="text-center">
              <h1>React Authentication Tutorial</h1>

              <section id="navigation">
                <a href="/">Home</a>
                <a href="/free">Free Component</a>
                <a href="/auth">Auth Component</a>
              </section>
            </Col>
          </Row>

            <Routes>
              <Route exact path="/" component={Login} />
              <Route exact path="/free" component={FreeComponent} />
              <ProtectedRoutes path="/auth" component={AuthComponent} />
            </Routes>
          
        </Container>
      </BrowserRouter>
    </>
  )
}

export default App
