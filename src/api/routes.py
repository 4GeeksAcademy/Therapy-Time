from flask import Flask, request, jsonify, url_for, Blueprint, json
from api.models import db, User, BlockedTokenList, Role, seed, Consultation, AvailabilityDates
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from flask_bcrypt import Bcrypt
from itsdangerous import URLSafeTimedSerializer
from werkzeug.security import check_password_hash, generate_password_hash
import os
import datetime, json, string, random
import requests
import datetime

app = Flask(__name__)
bcrypt = Bcrypt(app)
api = Blueprint('api', __name__)

CORS(api)

#Variables para el envio de correo electronico
EMAILJS_SERVICE_ID = 'service_yrznk4m'
EMAILJS_TEMPLATE_ID = 'template_ebpnklz'
EMAILJS_USER_ID = 'sm1cI8ucvO4Tvl_jb'
ACCES_TOKEN = '8TAMf4kzLuvMU3avQkTcm'
    
# Alta a nuevo usuario
@api.route('/signup', methods=['POST'])
@jwt_required()
def create_user():
    payload = get_jwt()
    if payload["role"] != 2:
        return "Usuario no autorizado", 403
        
    data = request.get_json()
    role_id = data.get("role_id", 1)
    username = data.get("username")
    name = data.get("name")
    lastname = data.get("lastname")
    dni = data.get("dni")
    phone = data.get("phone")
    email = data.get("email")
    virtual_link = data.get("virtual_link")

    existing_email_user = User.query.filter_by(email=email).first()
    if existing_email_user:
        return jsonify({"error": "Este correo ya está registrado."}), 400

    existing_dni_user = User.query.filter_by(dni=dni).first()
    if existing_dni_user:
        return jsonify({"error": "Este DNI ya está registrado."}), 400

    default_password = bcrypt.generate_password_hash(dni, 10).decode("utf-8")

    new_user = User(
        role_id=role_id,
        username=username,
        name=name,
        lastname=lastname,
        dni=dni,
        email=email,
        phone=phone,
        password=default_password,
        virtual_link=virtual_link
    )

    db.session.add(new_user)
    db.session.commit()

    token = create_access_token(new_user.id, new_user.role_id) 

    return jsonify({"message": "Usuario creado exitosamente", "token": token}), 201

# Seeder
@api.route('/seed', methods=['POST', 'GET'])
def handle_hello():
    seed()
    response_body ={
        "message": "Data cargada"
    }
    return jsonify(response_body, 200)

# Eliminar un usuario
@api.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    current_user_id = get_jwt_identity()

    current_user = User.query.get(current_user_id)

    payload = get_jwt()
    if payload["role"] != 2:
        return "Usuario no autorizado", 403

    user_to_delete = User.query.get(user_id)

    if not user_to_delete:
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user_to_delete)
    db.session.commit()

    return jsonify({"message": "User deleted successfully"}), 200

#Listar todos los usuarios (terapeuta)
@api.route('/users', methods=['GET'])
@jwt_required()
def list_users():
    try:
        payload = get_jwt()
        if payload["role"] != 2:
            return "Usuario no autorizado", 403
        users = User.query.filter(User.role_id != 2).all()
        serialized_users = [user.serialize() for user in users]
        return jsonify(serialized_users), 200
    except Exception as e:
        return jsonify({"error": "Error al obtener usuarios"}), 500

#Buscar un solo usuario (terapeuta)
@api.route('/get_user/<int:id>', methods=['GET'])
@jwt_required()
def get_user(id):
    payload = get_jwt()
    if payload["role"]!=2:
        return "Usuario no autorizado", 403
    user = User.query.get(id) 
    if user:
        return jsonify(user.serialize()), 200
    else:
        return jsonify({"message": "Usuario no encontrado"}), 404

#Editar usuario (terapeuta)
@api.route('/edit_user/<int:id>', methods=['PUT'])
@jwt_required()
def edit_user(id):
    payload = get_jwt()
    if payload["role"]!= 2:
        return "Usuario no autorizado", 403
    user = User.query.get(id)
    if not user:
        return jsonify({"message": "Usuario no encontrado"}), 404

    data = request.get_json()
    user.username = data['username']
    user.name = data['name']
    user.lastname = data['lastname']
    user.dni = data['dni']
    user.phone = data['phone']
    user.virtual_link = data['virtual_link']
    user.email = data['email']
    user.is_active = data['is_active']

    db.session.commit()

    return jsonify({"message": "Usuario actualizado exitosamente"}), 200

# Login de usuario
@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()
    if user is None:
        return jsonify({"error": "Usuario incorrecto"}), 404
    
    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Contraseña incorrecta"}), 401  

    if bcrypt.check_password_hash(user.password, password):
        payload = {"role": user.role_id}
        token = create_access_token(identity=user.id, additional_claims=payload)
        return jsonify({
            "message": "Inicio de sesión exitoso",
            "user": user.username,
            "token": token,
            "isAuthenticated": True,
            "role": user.role_id
        }), 200
    else:
        return jsonify({
            "error": "Error en la autenticacion",
            "isAuthenticated": False
        }), 500

# Cierre de sesión
@api.route('/logout', methods=['POST'])
@jwt_required()
def logout_user():
    payload = get_jwt()
    jti = payload['jti']
    exp = datetime.datetime.fromtimestamp(payload['exp'])
    blocked_token = BlockedTokenList(jti = jti, expires = exp)

    db.session.add(blocked_token)
    db.session.commit()

    return jsonify({"msg": "Sesión cerrada exitosamente."}), 200

# Conseguir el perfil de usuario (paciente)
@api.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if user is None:
        return jsonify({"error": "Usuario no encontrado"}), 404

    return jsonify(user.serialize()), 200

# Editar el perfil (paciente)
@api.route('/profile_edit', methods=['PUT'])
@jwt_required()
def edit_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if user is None:
        return jsonify({"error": "Usuario no encontrado"}), 404

    if user_id != user.id:
        return "Usuario no autorizado", 403
        
    data = request.get_json()

    updated_user_data = {**user.__dict__, **data}


    if 'password' in data:
        updated_user_data["password"] = bcrypt.generate_password_hash(data['password']).decode("utf-8")

    for key, value in updated_user_data.items():
        if key != "password":
            setattr(user, key, value)
            
    db.session.commit()

    return jsonify({"message": "Perfil actualizado"}), 200

# Funcion para el envio de correo electronico
def enviar_correo_recuperacion(email, token):
    datos_correo = {
        'service_id': EMAILJS_SERVICE_ID, 
        'template_id': EMAILJS_TEMPLATE_ID,  
        'user_id': EMAILJS_USER_ID ,  
        'accessToken': ACCES_TOKEN,
        'template_params': {
            'email': email,
            'token': token
        }
    }

    print("Datos del correo a enviar:")
    print(json.dumps(datos_correo, indent=4))  

    headers = {'Content-Type': 'application/json'}

    response = requests.post('https://api.emailjs.com/api/v1.0/email/send', json=datos_correo, headers=headers)

    if response.status_code == 200:
        print("Correo electrónico de recuperación enviado con éxito!")
    else:
        print("Error al enviar el correo electrónico de recuperación:", response.text)

# Solicitud de restablecimiento de contraseña
@api.route('/reset_password', methods=['POST'])
def reset_password():
    data = request.get_json()
    email = data.get('email')

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "No se encontró ningún usuario con ese correo electrónico"}), 404

    token = ''.join(random.choices(string.digits, k=8))

    hashed_temp_code = bcrypt.generate_password_hash(token).decode("utf-8")

    token_expiry = datetime.datetime.now() + datetime.timedelta(minutes=30)
    user.token_expiry = token_expiry

    user.reset_token = hashed_temp_code
    db.session.commit()

    enviar_correo_recuperacion(email, token)

    return jsonify({"message": "Correo electrónico de recuperación enviado"}), 200

# Configuracion de nueva contraseña
@api.route('/change_password', methods=['POST'])
def change_password():
    data = request.get_json()
    username = data.get('username')
    token = data.get('token')
    new_password = data.get('new_password')

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"mensaje": "El usuario ingresado es inválido"}), 404 
    if bcrypt.check_password_hash(user.reset_token, token):
        new_password = bcrypt.generate_password_hash(new_password, 10).decode("utf-8")
        user.password = new_password 
        db.session.commit()
        return jsonify({"mensaje": "Contraseña cambiada exitosamente"}), 200
    else:
        return jsonify({"mensaje": "El token ingresado es inválido o ha expirado"}), 401

# Enviar mensaje de primera consulta
@api.route('/message', methods=['POST'])
def create_message():
    data = request.get_json()
    dataName = data['name']
    dataLastname = data['lastname']
    dataAge = data['age']    
    dataPhone = data['phone']
    dataConsultation = data['consultation']
    dataArrival_date = data['arrival_date']  

    if not all([dataName, dataLastname, dataAge, dataPhone, dataConsultation]):
        return jsonify({"error": "Todos los campos son obligatorios."}), 400
    try:
        new_message = Consultation(
            name=dataName,
            lastname=dataLastname,
            age=dataAge,
            phone=dataPhone,
            consultation=dataConsultation,
            arrival_date=dataArrival_date 
        )
        db.session.add(new_message)
        db.session.commit()

        return jsonify({"message": "Mensaje creado exitosamente"}), 201
    except Exception as e:
        return jsonify({"error": "Error al procesar la solicitud.", "details": str(e)}), 500
   
#Listar todas las consultas
@api.route('/consultations', methods=['GET'])
@jwt_required()
def get_consultations():
    payload = get_jwt()
    if payload["role"]!= 2:
        return "Usuario no autorizado", 403
    try:
        consultations = Consultation.query.all()
        serialized_consultations = [consultation.serialize() for consultation in consultations]
        return jsonify(serialized_consultations), 200
    except Exception as e:
        return jsonify({"error": "Error al obtener usuarios"}), 500

# Traer una sola consulta por su ID
@api.route('/consultation/<int:id>', methods=['GET'])
@jwt_required()
def get_one_consultation(id):
    payload = get_jwt()
    if payload['role'] != 2:
        return "Usuario no autorizado", 403
    try:
        consultation = Consultation.query.get(id)
        if consultation:
            return jsonify(consultation.serialize()), 200
        else:
            return jsonify({"message": "Consulta no encontrada"}), 404
    except Exception as e:
        return jsonify({"error": "Error al obtener la consulta"}), 500

#Marcar las consultas como no leidas
@api.route('/consultations/<int:id>/mark_as_unread', methods=['PUT'])
@jwt_required()
def mark_consultation_as_unread(id):
    payload = get_jwt()
    if payload["role"]!= 2:
        return "Usuario no autorizado", 403
    try:
        consultation = Consultation.query.get(id)
        if consultation:
            consultation.is_read = False
            db.session.commit()
            return jsonify({"message": "Consultation marked as unread"}), 200
        else:
            return jsonify({"error": "Consultation not found"}), 404
    except Exception as e:
        return jsonify({"error": "Error marking consultation as unread"}), 500

#Borrado logico de las consultas
@api.route('/deleted_consultations/<int:id>', methods=['PUT'])
@jwt_required()
def logical_deletion(id):
    payload = get_jwt()
    if payload["role"]!=2:
        return "Usuario no autorizado", 403
    try:
        consultation = Consultation.query.get(id)
        if consultation:
            consultation.is_deleted = True
            db.session.commit()
            return jsonify({"message": "El mensaje ha sido eliminado"}),200
        else:
            return jsonify({"message" : "Error al eliminar el mensaje"}),404
    except Exception as e:
        return jsonify({"error": "Error al intentar eliminar el mensaje"}),500
    
#Borrado fisico de las consultas
@api.route('/deleted_consultations/<int:id>', methods=['DELETE'])
@jwt_required()
def physical_deletion(id):
    payload = get_jwt()
    if payload["role"] != 2:
        return "Usuario no autorizado", 403
    try:
        consultation = Consultation.query.get(id)
        if consultation:
            db.session.delete(consultation)  
            db.session.commit()
            return jsonify({"message": "El mensaje ha sido eliminado de forma permanente"}), 200
        else:
            return jsonify({"message": "La consulta no existe"}), 404
    except Exception as e:
        return jsonify({"error": "Error al intentar eliminar la consulta"}), 500

# Bloqueo de fechas
@api.route('/bloquear', methods=['POST'])
def bloquear():
    try:
        data = request.get_json()

        if isinstance(data, list):
            # Si es una lista, iterar sobre los objetos
            for item in data:
                required_fields = ['date', 'time', 'id']
                for field in required_fields:
                    if field not in item:
                        return jsonify({'error': f'{field} es un campo obligatorio'}), 400

                nueva_disponibilidad = AvailabilityDates(
                    date=item['date'],
                    time=item['time'],
                    id=item['id'],
                )

                db.session.add(nueva_disponibilidad)

        elif isinstance(data, dict):
            # Si es un objeto individual
            required_fields = ['date', 'time', 'id']
            for field in required_fields:
                if field not in data:
                    return jsonify({'error': f'{field} es un campo obligatorio'}), 400

            nueva_disponibilidad = AvailabilityDates(
                date=data['date'],
                time=data['time'],
                id=data['id'],
            )

            db.session.add(nueva_disponibilidad)

        else:
            return jsonify({'error': 'El formato de datos no es válido'}), 400

        db.session.commit()

        return jsonify({'mensaje': 'Horas bloqueadas exitosamente'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500        



@api.route('/bloquear/<string:id>', methods=['DELETE'])
def delete_blocked_time(id):
    try:
        # Supongamos que tienes un modelo llamado BlockedTime
        blocked_time = AvailabilityDates.query.get(id)

        if blocked_time:
            # Eliminar el registro de la base de datos
            db.session.delete(blocked_time)
            db.session.commit()

            return jsonify({"message": "Hora desbloqueada exitosamente"})
        else:
            return jsonify({"message": "La hora no existe"}), 404
    except Exception as e:
        return jsonify({"message": str(e)}), 500

# Obtener fechas dispponibles
@api.route('/bloquear', methods=['GET'])
def unaviable_dates():
    if request.method == 'GET':
        try:
            fechas_no_disponibles = AvailabilityDates.query.all()

            return jsonify([fecha.serialize() for fecha in fechas_no_disponibles]), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500


    try:
        # Consulta la base de datos para obtener las fechas no disponibles
        fechas_no_disponibles = AvailabilityDates.query.all()

        # Serializa los resultados en un formato JSON y los devuelve
        return jsonify([fecha.serialize() for fecha in fechas_no_disponibles]), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

