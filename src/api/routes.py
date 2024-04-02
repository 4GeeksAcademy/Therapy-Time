import datetime
import json
import os
import random
import requests
import string
from api.models import (
    AvailabilityDates,
    BlockedTokenList,
    Consultation,
    GlobalSchedulingEnabled,
    Payment,
    Reservation,
    Role,
    User,
    db,
    seed,
)
from api.utils import APIException, generate_sitemap
from datetime import datetime, time
from datetime import datetime, timedelta
from flask import Blueprint, Flask, jsonify, json, request
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import create_access_token, get_jwt, get_jwt_identity, jwt_required
import mercadopago
from werkzeug.security import check_password_hash, generate_password_hash


app = Flask(__name__)
bcrypt = Bcrypt(app)
api = Blueprint('api', __name__)
sdk = mercadopago.SDK(os.environ.get("MERCADOPAGO_ACCESSTOKEN")) 

CORS(api)

#>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

# Seeder
@api.route('/seed', methods=['POST', 'GET'])
def handle_hello():
    seed()
    response_body ={
        "message": "Data cargada"
    }
    return jsonify(response_body, 200)

#>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

# ENDPOINTS PARA LOGIN Y LOGOUT:

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

# Logout de usuario
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

#>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

#ENDPOINTS PARA LA GESTION DE USUARIOS (TERAPEUTA)

#Alta a nuevo usuario
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
        return jsonify({"error": "Usuario no encontrado"}), 404

    db.session.delete(user_to_delete)
    db.session.commit()

    return jsonify({"message": "Usuario eliminado exitosamente"}), 200

#Listar todos los usuarios
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

#Buscar un solo usuario
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

#Editar usuario
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

#>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

#ENDPOINS PARA LA EDICION DE PERFIL DE USUARIO

#Conseguir el perfil de usuario 
@api.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity()
    
    user = User.query.get(current_user_id)

    if user is None:
        return jsonify({"error": "Usuario no encontrado"}), 404

    return jsonify(user.serialize()), 200

#Editar el perfil (paciente)
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
    print("Data recibida:", data)

    updated_user_data = {**user.__dict__, **data}

    if 'password' in data:
        new_password_hash = bcrypt.generate_password_hash(data['password']).decode("utf-8")
        user.password = new_password_hash

    for key, value in updated_user_data.items():
        if key != "password":
            setattr(user, key, value)
            
    db.session.commit()

    return jsonify({"message": "Perfil actualizado"}), 200

#>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

#ENDPOINTS PARA EL ENVIO DE CORREO ELECTRONICO Y RECUPERACION DE CONTRASEÑA

#Variables para el envio de correo electronico
EMAILJS_SERVICE_ID = 'service_yrznk4m'
EMAILJS_TEMPLATE_ID = 'template_ebpnklz'
EMAILJS_USER_ID = 'sm1cI8ucvO4Tvl_jb'
ACCES_TOKEN = '8TAMf4kzLuvMU3avQkTcm'

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
    
    token_expiry = datetime.now() + timedelta(minutes=60)
    user.token_expiry = token_expiry

    user.reset_token = hashed_temp_code
    db.session.commit()

    enviar_correo_recuperacion(email, token)

    return jsonify({"message": "El correo electrónico de recuperación ha sido enviado con exito."}), 200

# Configuracion de nueva contraseña
@api.route('/change_password', methods=['POST'])
def change_password():
    data = request.get_json()
    username = data.get('username')
    token = data.get('token')
    new_password = data.get('new_password')

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "El usuario ingresado es inválido"}), 404 
    
    if user.reset_token is None:
        return jsonify({"error": "El usuario no tiene un token de reinicio de contraseña"}), 401
    
    if bcrypt.check_password_hash(user.reset_token, token):
        new_password = bcrypt.generate_password_hash(new_password, 10).decode("utf-8")
        user.password = new_password 
        db.session.commit()
        return jsonify({"error": "Contraseña cambiada exitosamente"}), 200
    else:
        return jsonify({"error": "El token ingresado es inválido o ha expirado"}), 401

#>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

#ENDPOINTS PARA EL ENVIO DE CONSULTAS EXTERNAS Y FUNCIONAMIENTO DE LA BANDEJA DE ENTRADA

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

#Traer una sola consulta por su ID
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
            return jsonify({"message": "Consulta marcada como no leída"}), 200
        else:
            return jsonify({"error": "Consulta no encontrada"}), 404
    except Exception as e:
        return jsonify({"error": "Error al marcar la consulta como no leída"}), 500

#Marcar las consultas como leidas
@api.route('/consultations/<int:id>/mark_as_read', methods=['PUT'])
@jwt_required()
def mark_consultation_as_read(id):
    payload = get_jwt()
    if payload["role"]!= 2:
        return "Usuario no autorizado", 403
    try:
        consultation = Consultation.query.get(id)
        if consultation:
            consultation.is_read = True  # Cambiar a True para marcar como leída
            db.session.commit()
            return jsonify({"message": "Consulta marcada como leída"}), 200
        else:
            return jsonify({"error": "Consulta no encontrada"}), 404
    except Exception as e:
        return jsonify({"error": "Error al marcar la consulta como leída"}), 500

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

#>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

#ENDPOINS PARA LA GESTION DE AGENDA

#1)Agenda global:
    
# Definición de opciones para los días y horas
POSSIBLE_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
POSSIBLE_HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']

#Almacenar horas disponibles
@api.route('/global_enabled', methods=['POST'])
def add_global_enabled():
    data = request.get_json()

    if not isinstance(data, list):
        return jsonify({'error': 'Se esperaba una lista de objetos'}), 400

    for blocking in data:
        day = blocking['day']
        GlobalSchedulingEnabled.query.filter_by(day=day).delete()

    for blocking in data:
        if not all(key in blocking for key in ['day', 'start_hour', 'end_hour']):
            return jsonify({'error': 'Falta algún campo en uno de los objetos'}), 400
        
        if blocking['day'] not in POSSIBLE_DAYS:
            return jsonify({'error': 'Valor no válido para day'}), 400

        if blocking['start_hour'] not in POSSIBLE_HOURS or blocking['end_hour'] not in POSSIBLE_HOURS:
            return jsonify({'error': 'Valor no válido para start_hour o end_hour'}), 400

        start_time = time.fromisoformat(blocking['start_hour'])
        end_time = time.fromisoformat(blocking['end_hour'])

        if start_time >= end_time:
            return jsonify({'error': 'La hora de inicio debe ser menor que la hora fin'}), 400

        existing_blockades = GlobalSchedulingEnabled.query.filter_by(day=blocking['day']).all()

        for existing_blockade in existing_blockades:
            existing_start_time = existing_blockade.start_hour
            existing_end_time = existing_blockade.end_hour

            if (start_time >= existing_start_time and start_time < existing_end_time) or \
               (end_time > existing_start_time and end_time <= existing_end_time) or \
               (start_time <= existing_start_time and end_time >= existing_end_time):
                return jsonify({'error': 'La franja horaria se solapa con un bloqueo existente'}), 400

        new_blocking = GlobalSchedulingEnabled(day=blocking['day'], start_hour=start_time, end_hour=end_time)
        db.session.add(new_blocking)

    db.session.commit()
    return jsonify({'message': 'Bloqueos sobrescritos correctamente'}), 201

#Traer todos los dias y sus horarios habilitados de forma global
@api.route('/get_global_enabled', methods=['GET'])
def get_global_enabled():
        try:
            global_enabled = GlobalSchedulingEnabled.query.all()
            return jsonify([blocking.serialize() for blocking in global_enabled]), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

#Traer todos los horarios habilitados para un mismo dia
@api.route('/get_global_enabled_by_day/<string:day>', methods=['GET'])
def get_global_enabled_by_day(day):
    try:
        global_enabled = GlobalSchedulingEnabled.query.filter_by(day=day).all()
        return jsonify([blocking.serialize() for blocking in global_enabled]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

#Eliminar un solo registro de disponibilidad global
@api.route('/delete_global_enabled/<int:id>', methods=['DELETE'])
def delete_global_enabled(id):
    try:
        blocking = GlobalSchedulingEnabled.query.get(id)
        if not blocking:
            return jsonify({'error': 'No se encontró el registro'}), 404
        db.session.delete(blocking)
        db.session.commit()
        return jsonify({'message': 'Registro eliminado correctamente'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

#2)Agenda por fechas:
    
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

#Desbloquear multiples horas
@api.route('/desbloquear/multiple', methods=['DELETE'])
def delete_multiple_blocked_times():
    try:
        data = request.get_json()
        ids = [item['id'] for item in data]  

        if not isinstance(ids, list):
            return jsonify({"error": "La lista de IDs debe ser un arreglo"}), 400

        deleted_count = 0
        for id in ids:
            blocked_time = AvailabilityDates.query.get(id)
            if blocked_time:
                db.session.delete(blocked_time)
                deleted_count += 1
            else:
                global_blocked_times = AvailabilityDates.query.filter_by(id=id, global_block=True).all()
                for global_blocked_time in global_blocked_times:
                    db.session.delete(global_blocked_time)
                    deleted_count += 1

        db.session.commit()

        return jsonify({"message": f"{deleted_count} horas desbloqueadas exitosamente"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#Desbloquear Hora en particular
@api.route('/desbloquear/<string:id>', methods=['DELETE'])
def delete_blocked_time(id):
    try:
        blocked_time = AvailabilityDates.query.get(id)
        if blocked_time:
            db.session.delete(blocked_time)
            db.session.commit()
            return jsonify({"message": "Hora desbloqueada exitosamente"})
        else:
            # Verificar si el ID corresponde a un bloqueo global y eliminar todos los bloqueos globales
            global_blocked_times = AvailabilityDates.query.filter_by(id=id, global_block=True).all()
            if global_blocked_times:
                for global_blocked_time in global_blocked_times:
                    db.session.delete(global_blocked_time)
                db.session.commit()
                return jsonify({"message": f"Horas desbloqueadas exitosamente"})
            else:
                return jsonify({"message": "La hora no existe"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#Treae todos los registros bloqueados del calendario final
@api.route('/final_calendar', methods=['GET'])
def final_calendar():
    try:
        availability_dates = AvailabilityDates.query.all()
        serialized_dates = [availability_date.serialize() for availability_date in availability_dates]
        return jsonify(serialized_dates), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

#Eliminar todos los bloqueos del calendario final
@api.route('/borrar_todo_availability_dates', methods=['DELETE'])
def borrar_todo_availability_dates():
    try:
        db.session.query(AvailabilityDates).delete()
        db.session.commit()
        return jsonify({'message': 'Todos los registros de AvailabilityDates han sido borrados'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
#>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

#ENDPOINTS PARA MERCADOPAGO

@api.route('/create_preference', methods=['POST'])
@jwt_required()
def create_preference():
    try:
        req_data = request.get_json()

        preference_data = {
            "items": [
                {
                    "title": req_data["description"],
                    "unit_price": float(req_data["price"]),
                    "quantity": int(req_data["quantity"]),
                    "currency_id": "ARS"
                }
            ],
            "back_urls": {
                "success": "http://localhost:3000/",
                "failure": "http://localhost:3000/",
                "pending": "",
            }, 
            "auto_return": "approved",
        }

        preference_response = sdk.preference().create(preference_data)
        preference_id = preference_response["response"] 
         
        current_user_id = get_jwt_identity() 
        new_payment = Payment(
            date=datetime.now(),
            amount=float(req_data["price"]),  
            description=req_data["description"],
            user_id=current_user_id
        )

        db.session.add(new_payment)
        db.session.commit()

        return jsonify({"id": preference_id})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Traer lista de pagos (solo trae los ultimos 10)
@api.route('/get_payments', methods=['GET'])
@jwt_required()
def get_payments():
    try:
        current_user = get_jwt_identity()
        user = User.query.get(current_user)
        payments = Payment.query.filter_by(user=user).order_by(Payment.id.desc()).limit(10).all()
        payment_data = [payment.serialize() for payment in payments]

        return jsonify({"payments": payment_data}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

#ENDPOINTS PARA LA GESTION DE TURNOS (HOME DEL PACIENTE)

#Obetener link sala virtual
@api.route('/profile_virtual_link', methods=['GET'])
@jwt_required()
def get_virtual_link():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if user is None:
        return jsonify({"error": "Usuario no encontrado"}), 404

    virtual_link = user.virtual_link

    return jsonify({"virtual_link": virtual_link}), 200

#Eliminar un turno
@api.route('/delete_reservation/<int:reservation_id>', methods=['DELETE'])
def delete_reservation(reservation_id):
    try:
        reservation = Reservation.query.get(reservation_id)
        if reservation:
            db.session.delete(reservation)
            db.session.commit()
            return jsonify({"message": "Reservación eliminada exitosamente"}), 200
        else:
            return jsonify({"error": "Reservación no encontrada"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500 

#Consultar el proximo turno
@api.route('/next_reservation', methods=['GET'])
@jwt_required()
def get_next_reservation():
    try:
        current_user_id = get_jwt_identity()
        next_reservation = Reservation.query.filter(Reservation.user_id == current_user_id, Reservation.date >= datetime.now()).order_by(Reservation.date).first()
        if next_reservation:
            return jsonify(next_reservation.serialize()), 200
        else:
            return jsonify({"message": "No se encontró próxima reservación para este usuario."}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#Reservar nuevo turno 
@api.route('/reservation', methods=['POST'])
@jwt_required()
def make_reservation():
    try:
        current_user_id = get_jwt_identity()
        data = request.json

        if not data or 'date' not in data or 'time' not in data:
            return jsonify({'error': 'Faltan campos obligatorios'}), 400

        datetime_str = f"{data['date']} {data['time']}"
        
        new_reservation = Reservation(
            date=datetime.strptime(datetime_str, '%Y-%m-%d %H:%M:%S'),
            user_id=current_user_id 
        )

        db.session.add(new_reservation)
        db.session.commit()

        return jsonify({'message': 'Reserva creada con éxito', 'reserva': new_reservation.serialize()}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500   

#Editar un turno paciente
@api.route('/edit_reservation/<int:id>', methods=['PUT'])
def update_reservation(id):
    try:
        data = request.json
        reservation = Reservation.query.filter_by(id=id).first()  
        if not reservation:
            return jsonify({'error': 'Reserva no encontrada '}), 404

        if not data or ('date' not in data and 'time' not in data):
            return jsonify({'error': 'Faltan campos para actualizar'}), 400

        if 'date' in data and 'time' in data:
            datetime_str = f"{data['date']} {data['time']}"
            reservation.date = datetime.strptime(datetime_str, '%Y-%m-%d %H:%M:%S')
        elif 'date' in data:
            reservation.date = datetime.strptime(data['date'], '%Y-%m-%d')
        elif 'time' in data:
            reservation.time = data['time']

        db.session.commit()

        return jsonify({'message': 'Reserva actualizada con éxito', 'reserva': reservation.serialize()}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

#ENDPOINTS PARA EL TURNERO (TERAPEUTA)

#Consultar todas las citas agendadas
@api.route('/get_all_reservations', methods=['GET'])
def get_all_reservations():
    try:
        reservas = Reservation.query.all()
        citas = []

        for reserva in reservas:
            if reserva.user_id:  
                usuario = User.query.get(reserva.user_id)
                nombre_paciente = f"{usuario.name} {usuario.lastname}"
                telefono = usuario.phone
                link_sala_virtual = usuario.virtual_link
            else:  
                nombre_paciente = reserva.guest_name
                telefono = reserva.guest_phone
                link_sala_virtual = None

            cita = {
                "id": reserva.id,
                "fecha": reserva.date.strftime('%Y-%m-%d %H:%M'),
                "nombre_paciente": nombre_paciente,
                "telefono": telefono,
                "link_sala_virtual": link_sala_virtual
            }
            citas.append(cita)

        return jsonify({"success": True, "data": citas})
    except Exception as e:
        return jsonify({"success": False, "error": "Error inesperado"}), 500

#Consulta una reserva por id
@api.route('/get_reservation_by_id/<int:id>', methods=['GET'])
def get_reservation_by_id(id):
    try:
        reserva = Reservation.query.get(id)
        if reserva:
            usuario = User.query.get(reserva.user_id)
            cita = {
                "id": reserva.id,
                "fecha": reserva.date.strftime('%Y-%m-%d %H:%M'),
                "nombre_paciente": f"{usuario.name} {usuario.lastname}",
                "telefono": usuario.phone,
                "link_sala_virtual": usuario.virtual_link
            }
            return jsonify({"success": True, "data": cita})
        else:
            return jsonify({"success": False, "error": "Reserva no encontrada"}), 404
    except Exception as e:
        return jsonify({"success": False, "error": "Error inesperado"}), 500

#Buscar paciente por DNI para nuevo turno
@api.route('/search_user/<dni>', methods=['GET'])
def get_user_by_dni(dni):
    try:
        user = User.query.filter_by(dni=dni).first()
        if user:
            serialized_user = {
                "id": user.id,
                "name": user.name,
                "lastname": user.lastname,
                "phone": user.phone,
                "dni": user.dni
            }
            return jsonify(serialized_user), 200
        else:
            return "Usuario no encontrado", 404
    except Exception as e:
        return jsonify({"error": "Error al obtener el usuario"}), 500

#Crea una nueva reserva de turno realizada por el terapeuta
@api.route('/reservation/<int:user_id>', methods=['POST'])
def create_reservation_for_user(user_id):
    try:
        data = request.json

        if not data or 'date' not in data or 'time' not in data:
            return jsonify({'error': 'Faltan campos obligatorios'}), 400

        datetime_str = f"{data['date']} {data['time']}"
        
        new_reservation = Reservation(
            date=datetime.strptime(datetime_str, '%Y-%m-%d %H:%M'),
            user_id=user_id
        )

        db.session.add(new_reservation)
        db.session.commit()

        return jsonify({'message': 'Reserva creada con éxito', 'reserva': new_reservation.serialize()}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#Crea reserva para usuario no registrado
@api.route('/reservation/non_registered', methods=['POST'])
def create_reservation_for_non_registered_user():
    try:
        data = request.json

        if not data or 'date' not in data or 'guest_name' not in data or 'guest_phone' not in data:
            return jsonify({'error': 'Missing required fields'}), 400

        datetime_str = data['date']
        
        new_reservation = Reservation(
            date=datetime.strptime(datetime_str, '%Y-%m-%dT%H:%M:%S'),
            guest_name=data['guest_name'],
            guest_phone=data['guest_phone']
        )

        db.session.add(new_reservation)
        db.session.commit()

        return jsonify({'message': 'Reserva creada con éxito', 'reserva': new_reservation.serialize()}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)