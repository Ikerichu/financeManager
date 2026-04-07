import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { initialStore } from "../store";
import { toast } from 'react-toastify';

export const Home = () => {
  const [transactions, setTransactions] = useState([]);
  const [transaction, setTransaction] = useState({
    amount: "",
    type: "expense",
    description: ""
  });
  const token = localStorage.getItem("token");
  const fetchTransactions = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/transactions`, {
        headers: { Authorization: "Bearer " + token }
      });

      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchTransactions();
  }, [token]);

  const income = transactions
    .filter(t => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = income - expense;

  const handleAddTransaction = async () => {

    if (!token) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/transactions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
          },
          body: JSON.stringify(transaction)
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("Transacción añadida");

        document.getElementById("closeTransactionModal").click();
        setTransaction({ amount: "", type: "expense", description: "" });
        await fetchTransactions();
      } else {
        toast.error(data.msg);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!token) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/transactions/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + token
          }
        }
      );

      if (res.ok) {
        toast.success("Transacción eliminada");
        await fetchTransactions();
      } else {
        toast.error("Error al eliminar la transacción");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Dashboard</h1>

      <div className="row text-center">
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Balance</h5>
              <p className="card-text fs-4">€ {balance.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card shadow-sm border-success">
            <div className="card-body">
              <h5 className="card-title">Ingresos</h5>
              <p className="card-text fs-4 text-success">
                € {income.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card shadow-sm border-danger">
            <div className="card-body">
              <h5 className="card-title">Gastos</h5>
              <p className="card-text fs-4 text-danger">
                € {expense.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div>
        <button
          className="btn btn-primary mt-3"
          data-bs-toggle="modal"
          data-bs-target="#transactionModal"
        >
          Añadir Transacción
        </button>

        <div className="modal fade" id="transactionModal" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">Nueva Transacción</h5>
                <button className="btn-close" data-bs-dismiss="modal"></button>
              </div>

              <div className="modal-body">
                <input
                  type="number"
                  className="form-control mb-2"
                  placeholder="Cantidad"
                  onChange={(e) =>
                    setTransaction({ ...transaction, amount: e.target.value })
                  }
                />

                <select
                  className="form-control mb-2"
                  onChange={(e) =>
                    setTransaction({ ...transaction, type: e.target.value })
                  }
                >
                  <option value="expense">Gasto</option>
                  <option value="income">Ingreso</option>
                </select>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Descripción"
                  onChange={(e) =>
                    setTransaction({
                      ...transaction,
                      description: e.target.value
                    })
                  }
                />
              </div>

              <div className="modal-footer">
                <button
                  id="closeTransactionModal"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>

                <button className="btn btn-primary" onClick={handleAddTransaction}>
                  Guardar
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>
      <div className="mt-5">
        <h2 className="mb-3">Últimas transacciones</h2>

        <div className="list-group">
          {transactions.toReversed().map(t => (
            <div
              key={t.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <strong>{t.description}</strong>
                <br />
                <small className="text-muted">{t.category}</small>
              </div>
              <div>
                <small className="text-muted">{new Date(t.date).toLocaleDateString()}</small>
              </div>
              <span
                className={
                  t.type === "income" ? "text-success fw-bold" : "text-danger fw-bold"
                }
              >
                {t.type === "income" ? "+" : "-"}€{t.amount}
              </span>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};