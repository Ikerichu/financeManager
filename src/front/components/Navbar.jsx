import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { initialStore } from "../store";
import { toast } from 'react-toastify';

export const Navbar = () => {

  const [user, setUser] = useState(null);

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    lastname: "",
    email: "",
    password: ""
  });

  const handleLogin = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData)
      });

      const data = await res.json();

      if (res.ok) {
        initialStore.token = data.token;
        localStorage.setItem("token", data.token);

        setUser(data.user);
        toast.success("Login correcto");
        setLoginData({ email: "", password: "" });
        document.getElementById("loginModalClose").click();
      } else {
        toast.error(data.msg);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRegister = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(registerData)
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Usuario creado");
        setRegisterData({ name: "", lastname: "", email: "", password: "" });
        document.getElementById("registerModalClose").click();
      } else {
        alert(data.msg);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profile`, {
        headers: {
          Authorization: "Bearer " + token
        }
      })
        .then(res => res.json())
        .then(data => {
          if (!data.msg) {
            setUser(data);
          } else {
            localStorage.removeItem("token");
          }
        })
        .catch(() => localStorage.removeItem("token"));
    }
  }, []);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand text-white" to="/">
            TrackMyMoney
          </Link>

          <div className="ms-auto d-flex gap-2">

            {!user ? (
              <>
                <button
                  className="btn btn-primary btn-outline-light"
                  data-bs-toggle="modal"
                  data-bs-target="#loginModal"
                >
                  Login
                </button>

                <button
                  className="btn btn-success btn-outline-light"
                  data-bs-toggle="modal"
                  data-bs-target="#registerModal"
                >
                  Register
                </button>
              </>
            ) : (
              <>

                <Link to="/profile" className="btn btn-primary btn-outline-light txt-capitalize">
                  {user.name}
                </Link>

                <button className="btn btn-danger btn-outline-light" onClick={handleLogout}>
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
      {/*Modales*/}
      <div className="modal fade" id="loginModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Login</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control"
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-control"
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button id="loginModalClose" className="btn btn-secondary btn-outline-light" data-bs-dismiss="modal">
                Close
              </button>
              <button className="btn btn-primary btn-outline-light" onClick={handleLogin}>
                Login
              </button>
            </div>
          </div>
        </div>
      </div>


      <div className="modal fade" id="registerModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Register</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-control"
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Last Name</label>
                  <input type="text" className="form-control"
                    onChange={(e) => setRegisterData({ ...registerData, lastname: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control"
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-control"
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button id="registerModalClose" className="btn btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
              <button className="btn btn-primary" onClick={handleRegister}>
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
