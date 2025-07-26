from sqlalchemy import create_engine,event
from sqlalchemy.orm import sessionmaker
from db_model import Base,Pizza
from pizzas import pizzas
'''Развёртывание базы данных с помощью
библиотеки SQLite проходит в три этапа:
1. Определение строки подключения – специальной строки, в которой
указывается название СУБД, данные пользователя, название базы данных и
другая информация;
2. Создание движка базы данных;
3. Создание таблиц базы данных'''

DB_URL = "sqlite:///./app_db.db"
engine = create_engine(DB_URL,connect_args = {"check_same_thread": False})

    
def _fk_pragma_on_connect(dbapi_con, con_record):#Включение поддержки внешних ключей в 
    dbapi_con.execute('pragma foreign_keys=ON')
event.listen(engine, 'connect', _fk_pragma_on_connect)

def add_pizzas(target, connection, **kw):
    connection.execute(target.insert(), pizzas)
event.listen(Pizza.__table__, "after_create", add_pizzas)

Base.metadata.create_all(bind = engine)
SessionLocal = sessionmaker(autoFlush=False,bind = engine)

def get_db(): # Создание объекта подключения к базе данных
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()