import React, { useEffect, useState } from "react";
import {useNavigate} from "react-router-dom";
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
      <div className="card p-4">
        <h2 className="mb-4">Profile</h2>

        <p><strong>Nombre:</strong> {user.name}</p>
        <p><strong>Apellido:</strong> {user.lastname}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>
    </div>
  );
};