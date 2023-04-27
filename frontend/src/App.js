import logo from "./logo.svg";
import "./App.css";

import React, { useEffect, useMemo, useRef } from "react";
import { useState } from "react";
import {
  Route,
  Switch,
  Redirect,
  BrowserRouter as Router,
  useLocation,
  useHistory,
} from "react-router-dom";
import { useRouter } from "next/router";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import "bootstrap/dist/css/bootstrap.min.css";
import { useMediaQuery } from "react-responsive";
import { Helmet } from "react-helmet";
// import ErrorComponent from "./Components/ErrorComponent";
import axios from "axios";
function App() {
  return (
    <div className="App">
      <div className="appContainer" id="inner-container">
        <main id="page-wrap">
          <Router>
            <Route path="/">
              {({ match }) => (
                <CSSTransition
                  in={match != null}
                  timeout={1000}
                  classNames="page"
                  unmountOnExit
                >
                  <div>yo</div>
                </CSSTransition>
              )}
            </Route>
          </Router>
        </main>
      </div>
    </div>
  );
}

export default App;
