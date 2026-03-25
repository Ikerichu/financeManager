import React, { useEffect, useState } from "react";

export const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/"; // no logueado → fuera
      return;
    }

    fetch("/api/profile", {
      headers: {
        Authorization: "Bearer " + token
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.msg) {
          localStorage.removeItem("token");
          window.location.href = "/";
        } else {
          setUser(data);
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        window.location.href = "/";
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