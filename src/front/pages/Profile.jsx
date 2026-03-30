import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { initialStore } from "../store";

export const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = initialStore.token || localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profile`, {
      headers: {
        Authorization: "Bearer " + token
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.msg) {
          localStorage.removeItem("token");
          navigate("/");
        } else {
          setUser(data);
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/");
      });
  }, []);

  if (!user) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">

          <div className="card shadow border-0">

            <div className="card-header bg-primary text-white text-center">
              <h4 className="mb-0">Perfil</h4>
            </div>

            <div className="card-body">

              <div className="mb-3">
                <label className="form-label text-muted mb-1">Nombre</label>
                <div className="form-control bg-light txt-capitalize">
                  {user.name}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-muted mb-1">Apellido</label>
                <div className="form-control bg-light txt-capitalize">
                  {user.lastname}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-muted mb-1">Email</label>
                <div className="form-control bg-light">
                  {user.email}
                </div>
              </div>

              {/*<div className="d-grid mt-4">
                <button className="btn btn-primary">
                  Editar perfil
                </button>
              </div>*/}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};