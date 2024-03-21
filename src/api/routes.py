from flask import Flask, request, jsonify, Blueprint, json
from api.models import db, User, BlockedTokenList, Role, seed, Consultation, AvailabilityDates, GlobalSchedulingEnabled, Reservation
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from flask_bcrypt import Bcrypt
from itsdangerous import URLSafeTimedSerializer
from werkzeug.security import check_password_hash, generate_password_hash
import os
import datetime, json, string, random 
from sqlalchemy.exc import IntegrityError
import requests
from datetime import date, time, timedelta

app = Flask(__name__)
bcrypt = Bcrypt(app)
api = Blueprint('api', __name__)

CORS(api)

# Comprobar si la psicologa esta disponible en una fecha y hora particular
def is_therapist_available(date, time):
        availability = AvailabilityDates.query.filter_by(
            date=date,
            time=time
        ).first()
        return availability is not None

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
    exp = payload['exp']

    expires_datetime = datetime.fromtimestamp(exp)
    blocked_token = BlockedTokenList(jti = jti, expires = expires_datetime)

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
    print("Data received:", data)

    updated_user_data = {**user.__dict__, **data}

    if 'password' in data:
        new_password_hash = bcrypt.generate_password_hash(data['password']).decode("utf-8")
        user.password = new_password_hash

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
    if bcrypt.check_password_hash(user.reset_token, token):
        new_password = bcrypt.generate_password_hash(new_password, 10).decode("utf-8")
        user.password = new_password 
        db.session.commit()
        return jsonify({"error": "Contraseña cambiada exitosamente"}), 200
    else:
        return jsonify({"error": "El token ingresado es inválido o ha expirado"}), 401

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
            return jsonify({"message": "Consultation marked as read"}), 200
        else:
            return jsonify({"error": "Consultation not found"}), 404
    except Exception as e:
        return jsonify({"error": "Error marking consultation as read"}), 500

#blocking de fechas y horarios globales
# 1) Definición de opciones para los días y horas
POSSIBLE_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
POSSIBLE_HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']

# Marcado de dias y franjas horarias disponibles (terapeuta) 
# 1) Definición de opciones para los días y horas
POSSIBLE_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
POSSIBLE_HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']
# 2) Ruta para el endpoint POST
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

# Eliminar un solo registro de disponibilidad global
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

# Desbloquear multiples horas
@api.route('/desbloquear/multiple', methods=['DELETE'])
def delete_multiple_blocked_times():
    try:
        data = request.get_json()
        ids = [item['id'] for item in data]  # Obtener una lista de IDs del cuerpo de la solicitud

        if not isinstance(ids, list):
            return jsonify({"error": "La lista de IDs debe ser un arreglo"}), 400

        deleted_count = 0
        for id in ids:
            blocked_time = AvailabilityDates.query.get(id)
            if blocked_time:
                db.session.delete(blocked_time)
                deleted_count += 1

        db.session.commit()

        return jsonify({"message": f"{deleted_count} horas desbloqueadas exitosamente"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Desbloquear Hora en particular
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
@api.route('/fetch_bloquear', methods=['GET'])
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
    
# Traer el proximo turno (paciente)
@api.route('/next_appointment', methods=['GET'])
@jwt_required()
def get_appointment():
    user_id = get_jwt_identity()

    try:
        # Filtrar las reservas que sean de una fecha anterior a la actual y traer la primera; es decir, la que se agrego primero.
        # (¿Asumimos que la terapeuta agrego la más proxima primero?)
        reservation = Reservation.query \
            .filter(Reservation.user_id == user_id) \
            .filter(Reservation.date >= datetime.today().date()) \
            .order_by(Reservation.date.asc(), Reservation.time.asc()) \
            .first()

        if reservation:
            reservation_dict = reservation.serialize()  
            reservation_dict['time'] = reservation.time.strftime('%H:%M')  
            return jsonify(reservation_dict)
        else:
            return jsonify({"message": "No hay turnos próximos"}), 200 

    except Exception as e:
       
        print(f"Error al traer reserva de usuario: {user_id}: {e}")
        return jsonify({"error": "Error del servidor"}), 500

# Cancelar el proximo turno (paciente)
@api.route('/remove_appointment', methods=['DELETE'])
@jwt_required()  
def remove_appointment():
    user_id = get_jwt_identity()  
    try:
        now = datetime.now()
        
        # Filtrar las reservas para traer la mas proxima
        reservation = Reservation.query.filter(
            Reservation.user_id == user_id
        ).order_by(Reservation.date).first()

        datestring = reservation.date.isoformat()
        hourstring = reservation.time.isoformat()

        formatted_date = datetime.fromisoformat(datestring + 'T' + hourstring)

        if not reservation:
            return jsonify({"message": "No hay turnos próximos para eliminar"}), 404

        # Comprobar si el turno es antes de las 24 hs
        removal_threshold = now + timedelta(hours=24)

        if formatted_date < removal_threshold:
            return jsonify({"message": "El turno ya no se puede cancelar. Debe hacerlo con al menos 24hs de anticipación."}), 409  

        Reservation.query.filter_by(id=reservation.id).delete()
        db.session.commit()
        
        return jsonify({"message": "Turno eliminado exitosamente"}), 200

    except Exception as e:
        # Cancelar cambios en la bbdd en caso de error
        db.session.rollback()  
        print(f"Error al eliminar turno de usuario {user_id}: {e}")
        return jsonify({"error": "Error del servidor"}), 500

# Modificar turno (paciente)
@api.route('/reschedule_appointment', methods=['POST'])
@jwt_required()
def reschedule_appointment():
    user_id = get_jwt_identity
    data = request.get_json()
    
    try:
        desired_date = datetime.date.fromisoformat(data.get("date"))
        desired_time = data.get("time")

        if not is_therapist_available(desired_date, desired_time):
            return jsonify({"message": "El horario elegido no esta disponible"}), 409

        reservation = Reservation.query.filter_by(user_id=user_id).first()

        if not reservation:
            return jsonify({"message" : "No hay turnos para reprogramar"}), 404

        reservation.date = desired_date
        reservation.time = desired_time

        db.session.commit()

        return jsonify({"message": "Turno reprogramado exitosamente"}), 200
    
    except Exception as e:
        print(f"Error al reprogramar turno: {e}")
        db.session.rollback()
        return jsonify({"error": "Error del servidor"}), 500

# Reservar turno
@api.route('/create_reservation', methods=['POST'])
def create_reservation():
    data = request.json

    date_time_obj = datetime.strptime(data['date'] + ' ' + data['time'], '%Y/%m/%d %H:%M')
    time_obj = date_time_obj.time()

    # Guardar en AvailabilityDates
    new_availability = AvailabilityDates(date=date_time_obj, time=time_obj)
    db.session.add(new_availability)
    db.session.commit()

    # Obtener el ID del nuevo registro de AvailabilityDates
    availability_id = new_availability.id

    # Guardar en Reservation with complete data
    new_reservation = Reservation(id=availability_id, user_id=data['user_id'], date=date_time_obj.date(), time=date_time_obj)
    db.session.add(new_reservation)
    db.session.commit()

    return jsonify(message="Reserva creada exitosamente")

if __name__ == '__main__':
    app.run(debug=True)
