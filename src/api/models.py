from flask_sqlalchemy import SQLAlchemy
from sqlalchemyseeder import ResolvingSeeder
import datetime

db = SQLAlchemy()

class AvailabilityDates(db.Model):
    __tablename__ = 'availability_dates'
    id = db.Column(db.BigInteger, primary_key=True, unique=True) 
    date = db.Column(db.DateTime, nullable=False)
    time = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return f'<Availability_dates {self.id}>'

    def serialize(self):
        return {
            "id": self.id,
            "date": self.date,
            "time": self.time,
        }

class BlockedTokenList(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(100), unique=True)
    date_time = db.Column(db.DateTime, nullable=True)
    expires = db.Column(db.DateTime, nullable=True)

class Consultation(db.Model):
    __tablename__ = 'consultation'
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

class GlobalSchedulingEnabled(db.Model):
    __tablename__ = 'global_scheduling_enabled'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    day = db.Column(db.String, nullable=False)
    start_hour = db.Column(db.Time, nullable=False)
    end_hour = db.Column(db.Time, nullable=False)

    def __repr__(self):
        return f'<GlobalSchedulingEnabled {self.id}>'

    def serialize(self):
        return {
            "id": self.id,
            "day": self.day,
            "start_hour": self.start_hour.strftime('%H:%M'),
            "end_hour": self.end_hour.strftime('%H:%M') 
        }

class Payment(db.Model):
    __tablename__ = 'payment'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    date = db.Column(db.DateTime, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(250), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship("User")

    def __repr__(self):
        return f'<Payment {self.id}>'

    def serialize(self):
        return {
            "id": self.id,
            "date": self.date.strftime('%Y-%m-%d %H:%M:%S'),
            "amount": self.amount,
            "description": self.description,
            "user_id": self.user_id
        }

class Reservation(db.Model):
    __tablename__='reservation'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    date = db.Column(db.DateTime, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    user = db.relationship("User")
    guest_name = db.Column(db.String(50), nullable=True) 
    guest_phone = db.Column(db.String(10), nullable=True)

    def __repr__(self):     
        return f'<Reservation {self.id}>'
    def serialize(self):
        return{
            "id": self.id,
            "date": self.date,
            "user_id": self.user_id,
            "guest_name": self.guest_name,
            "guest_phone": self.guest_phone
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

class Schedules(db.Model):
    __tablename__='schedules'
    id =db.Column(db.Integer, primary_key=True, autoincrement=True)
    time = db.Column(db.Date, nullable=False)

    def __repr__(self):
        return f'<Schedules {self.time}>'
    def serialize(self):
        return{
            "id": self.id,
            "time": self.time
        }

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
            "role": self.role.id, 
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
   
def seed():
    seeder = ResolvingSeeder(db.session)
    seeder.register(Role)
    seeder.register(User)
    seeder.load_entities_from_json_file('seedData.json')
    db.session.commit()
