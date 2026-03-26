"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Transaction
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, JWTManager
from flask_bcrypt import Bcrypt
from datetime import timedelta

bcrypt = Bcrypt()
jwt = JWTManager()

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

@api.route("/transactions", methods=["GET"])
@jwt_required()
def get_transactions():
    user_id = int(get_jwt_identity())  # esto viene del token JWT
    user_transactions = Transaction.query.filter_by(user_id=user_id).order_by(Transaction.date.desc()).all()
    return jsonify([t.serialize() for t in user_transactions]), 200


@api.route("/register", methods=["POST"])
def register():
    data = request.json

    name = data.get("name")
    lastname = data.get("lastname")
    email = data.get("email")
    password = data.get("password")

    if not all([name, lastname, email, password]):
        return jsonify({"msg": "Missing data"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "User already exists"}), 409

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    new_user = User(
        username=name.lower() + lastname.lower(),
        name=name,
        lastname=lastname,
        email=email,
        password=hashed_password
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "User created successfully"}), 201


@api.route("/login", methods=["POST"])
def login():
    data = request.json

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"msg": "Missing credentials"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"msg": "Invalid email or password"}), 401

    token = create_access_token(identity=str(user.id),expires_delta=timedelta(seconds=3600))

    return jsonify({
        "msg": "Login successful",
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }), 200

@api.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    user_id = get_jwt_identity()

    user = db.session.get(User, int(user_id))

    if not user:
        return jsonify({"msg": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "name": user.name,
        "lastname": user.lastname,
        "email": user.email
    }), 200

@api.route("/transactions", methods=["POST"])
@jwt_required()
def create_transaction():
    user_id = int(get_jwt_identity())
    data = request.json

    amount = data.get("amount")
    type_ = data.get("type")
    description = data.get("description")

    if not amount or not type_:
        return jsonify({"msg": "Missing data"}), 400

    new_transaction = Transaction(
        amount=amount,
        type=type_,
        description=description,
        user_id=user_id,
        category_id=data.get("category_id") or 1
    )

    db.session.add(new_transaction)
    db.session.commit()

    return jsonify({"msg": "Transaction created"}), 201