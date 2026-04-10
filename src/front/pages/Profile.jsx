import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { initialStore } from "../store";
import { toast } from 'react-toastify';

export const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [editData, setEditData] = useState({
    email: "",
    password: ""
  });

  const handleEdit = async () => {
    try {
      const token = initialStore.token || localStorage.getItem("token");

      if(editData.password.length < 6) {
        toast.error("La contraseña debe tener al menos 6 caracteres");
        return;
      }

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify(editData)
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Perfil actualizado");
        setUser(data);
        setEditData({ email: "", password: "" });
        document.getElementById("editModalClose").click();
      } else {
        toast.error(data.msg);
      }
    } catch (error) {
      console.error(error);
    }
  };

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

              <div className="d-grid mt-4">
                <button className="btn btn-primary btn-outline-light" data-bs-toggle="modal" data-bs-target="#editModal">
                  Editar perfil
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>

    <div className="modal fade" id="editModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Editar Perfil</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label className="form-label text-muted mb-1">Email</label>
                  <input type="email" className="form-control"
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted mb-1">Password</label>
                  <input type="password" className="form-control"
                    onChange={(e) => setEditData({ ...editData, password: e.target.value })} />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button id="editModalClose" className="btn btn-secondary btn-outline-light" data-bs-dismiss="modal">
                Close
              </button>
              <button className="btn btn-primary btn-outline-light" onClick={handleEdit}>
                Editar
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};