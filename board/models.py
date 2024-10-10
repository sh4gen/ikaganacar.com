from board import db, login_manager
from flask import request
from datetime import datetime,date
from sqlalchemy import func
from flask_login import UserMixin

class History(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    
    page_name = db.Column(db.String(200),  nullable=False)
    visits = db.relationship("Visit", backref="page", lazy=True,order_by=lambda: Visit.date.desc())

    @property
    def visit_count(self):
        return len(self.visits)
    
    def __repr__(self) -> str:
        return f"History('{self.page_name}', '{self.visit_count}')"


class Visit(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    date = db.Column(db.DateTime,  nullable=False, default=datetime.now(),index=True)
    ip_address = db.Column(db.String(100),  nullable=False, default=lambda: request.environ["REMOTE_ADDR"])
    history_id = db.Column(db.Integer, db.ForeignKey('history.id'), nullable=False)

    def __repr__(self) -> str:
        return f"Visit('{self.date}', '{self.ip_address}')"


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)

    role = db.Column(db.String(30), unique=False, nullable=False)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(60) , unique=False, nullable=False)
    
    type = db.Column(db.String(20))  # this is the discriminator column

    __mapper_args__ = {
        'polymorphic_on':type,
    }

    def __repr__(self) -> str:
        return f"User('{self.role}','{self.username}')"


class ika(User):
    id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    
    __mapper_args__ = {
        'polymorphic_identity':'ika'
    }
     
    def __repr__(self) -> str:
        return f"User('{self.role}','{self.username}')"


class Apartment_admin(User):
    id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    apartment_id = db.Column(db.Integer, db.ForeignKey('apartment.id'), nullable=False, index=True)
    
    __mapper_args__ = {
        'polymorphic_identity':'apartment_admin'
    }
     
    def __repr__(self) -> str:
        return f"User('{self.role}','{self.username}')"


class Apartment_user(User):
    id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    apartment_id = db.Column(db.Integer, db.ForeignKey('apartment.id'), nullable=False, index=True)
    
    __mapper_args__ = {
        'polymorphic_identity':'apartment_user'
    }
     
    def __repr__(self) -> str:
        return f"User('{self.role}','{self.username}')"


# * apartment administration ---------------------------------------------
class Resident(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    apartment_id = db.Column(db.Integer, db.ForeignKey('apartment.id'), nullable=False, index=True)

    name = db.Column(db.String(30),  nullable=True, default="-")
    surname = db.Column(db.String(30),  nullable=True, default="-")
    door_number = db.Column(db.Integer, unique=True,  nullable=False)
    phone_number = db.Column(db.Integer,  nullable=True, unique=True)

    payments = db.relationship("Payment", backref="resident", lazy=True, order_by=lambda: Payment.date.desc())

    @property
    def last_payment_date(self):
        return db.session.query(func.max(Payment.date)).filter_by(resident_id=self.id).scalar()

    @property
    def last_payment_month(self):
        months = {
            '1': "Ocak",
            '2': "Şubat",
            '3': "Mart",
            '4': "Nisan",
            '5': "Mayıs",
            '6': "Haziran",
            '7': "Temmuz",
            '8': "Ağustos",
            '9': "Eylül",
            '10': "Ekim",
            '11': "Kasım",
            '12': "Aralık",
        }
        index = (self.last_payment_date).month
        return f"{months[f'{index}']} - {(self.last_payment_date).year}" 

    @property
    def debt(self) -> int: 
        try: 
            return int(((date.today()).month - (self.last_payment_date).month))
        except Exception as e:
            print(e)
            return None

    @property
    def total_payment(self):
        try:
            return len(self.payments)

        except Exception as e:
            print(e)
            return 0

    def __repr__(self) -> str:
        return f"Resident({self.door_number}, {self.name}, {self.surname}, {self.phone_number}, {self.last_payment_date}, {self.debt}, {self.total_payment})"


class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    resident_id = db.Column(db.Integer, db.ForeignKey('resident.id'), nullable=False, index=True)
    
    amount = db.Column(db.Integer,  nullable=False)
    date = db.Column(db.Date, nullable=False, default=date.today(), index=True)
    
    def __repr__(self) -> str:
        return f"Payment({self.resident_id}, {self.amount}, {self.date})"


class Apartment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    
    name = db.Column(db.String(30),  nullable=True, default="-")
    
    admins = db.relationship('Apartment_user', backref='apartment', lazy=True)
    residents = db.relationship('Resident', backref='apartment', lazy=True)
    
    @property
    def total_debt(self):
        tot = 0
        #for i in self.residents:
        #    tot += i.debt
        return tot
    
    @property
    def num_of_residents(self):
        return len(self.residents)
