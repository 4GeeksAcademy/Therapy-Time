from flask_sqlalchemy import SQLAlchemy
from sqlalchemyseeder import ResolvingSeeder

import arrow 

db = SQLAlchemy()

import datetime

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'), nullable=False)
    role = db.relationship("Role")
    username = db.Column(db.String(50), nullable=False)
    name = db.Column(db.String(25), nullable=False)
    lastname = db.Column(db.String(25), nullable=False)
    dni = db.Column(db.String(15), nullable=False, unique=True)
    email = db.Column(db.String(250), unique=True, nullable=False)
    phone = db.Column(db.String(10), nullable=False)
    password = db.Column(db.String(150), nullable=False) 
    virtual_link = db.Column(db.String(250), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    reset_token = db.Column(db.String(150))

    def __init__(self, *args, **kwargs):
        super(User, self).__init__(*args, **kwargs)
        if not self.password:
            self.password = self.dni
    def __repr__(self):
        return f'<User {self.name} {self.lastname}>'
    def serialize(self):
        return {
            "id": self.id,
            "role_id": self.role.id, 
            "username": self.username,
            "name": self.name,
            "lastname": self.lastname,
            "dni": self.dni,  
            "email": self.email,
            "phone": self.phone,
            "password": self.password,
            "virtual_link": self.virtual_link,
            "is_active": self.is_active
        }

class Role(db.Model):
    __tablename__='role'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), nullable=False)

    def __repr__(self):
        return f'<Role {self.name}>'
    def serialize(self):
        return {
            "id": self.id,
            "name": self.name
        }
    
def seed():
    seeder = ResolvingSeeder(db.session)
    seeder.register(Role)
    seeder.register(User)
    seeder.load_entities_from_json_file('seedData.json')
    db.session.commit()

class Reservation(db.Model):
    __tablename__='reservation'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    date = db.Column(db.Date, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship("User")


    def __repr__(self):
        return f'<Reservation {self.id}>'
    def serialize(self):
        return{
            "id": self.id,
            "date": self.date,
            "user_id": self.user_id,
            "time_id": self.time_id,
        }

class AvailabilityDates(db.Model):
    __tablename__='availability_dates'
    id= db.Column(db.Integer, primary_key=True, autoincrement=True)
    date = db.Column(db.DateTime, nullable=False)
    time = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return f'<Availability_dates {self.id}>'
    def serialize(self):
        return{
            "id": self.id,
            "date": self.date,
            "time": self.time,
        }

class BlockedTokenList(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    jti = db.Column(db.String(100), unique = True)
    date_time = db.Column(db.DateTime, nullable = True)
    expires = db.Column(db.DateTime, nullable = True)

class Consultation(db.Model):
    __tablename__='consultation'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(25), nullable=False)
    lastname = db.Column(db.String(25), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    phone = db.Column(db.String(10), nullable=False)
    consultation = db.Column(db.String(250), nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    is_deleted = db.Column(db.Boolean, default=False)
    arrival_date = db.Column(db.DateTime, nullable=False)

    def __repr__(self):
        return f'<Message{self.id}>'

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "lastname": self.lastname,
            "age": self.age,
            "phone": self.phone,
            "consultation": self.consultation,
            "is_read": self.is_read,
            "is_deleted": self.is_deleted,
            "arrival_date": self.arrival_date.strftime('%d-%B-%Y %H:%M:%S')
        }


class Appointment(db.Model):
    __tablename__ = 'appointments'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    date = db.Column(db.DateTime, nullable=False)
    time = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return f'<Appointment {self.id}>'

    def serialize(self):
        return {
            "id": self.id,
            "date": self.date,
            "time": self.time,
        }
        
def schedule_appointment(date, time):
    try:
        appointment = Appointment(date=date, time=time)
        db.session.add(appointment)
        db.session.commit()
        return appointment
    except Exception as e:
        db.session.rollback()
        raise e

def cancel_appointment(appointment_id):
    try:
        appointment = Appointment.query.get(appointment_id)
        if appointment:
            db.session.delete(appointment)
            db.session.commit()
            return True
        return False  # No se encontró la cita con el ID dado
    except Exception as e:
        db.session.rollback()
        raise e