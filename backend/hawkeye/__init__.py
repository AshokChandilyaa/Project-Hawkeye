import json

from flask import Flask
from flask_cors import CORS, cross_origin
from sqlite3 import OperationalError

from hawkeye.routes.image import images
from hawkeye.routes.project import projects
from hawkeye.routes.label import labels
from hawkeye.routes.region import regions
from hawkeye.routes.train import train
from hawkeye.routes.predict import predict
from hawkeye.repositories.databases import DataBase

def create_app():
    app = Flask(__name__)
    app.config['CORS_HEADERS'] = 'Content-Type'
    app.config['CORS_ORIGINS'] = '*'
    CORS(app)
    
    #@app.route('/foo',methods=['POST'])
    #@cross_origin(origin='localhost', headers=['Content-Type'])
    #def foo():
    #    return request.json['inputVar']

    CONFIG_PATH = "../config.json"
    CONFIG_TYPE = "default"
    db= DataBase()
    try:
        p=db.get_all_projects()
    except OperationalError:
        db.create_tables()
        
    app.config.from_file(CONFIG_PATH, load=lambda file: json.load(file)[CONFIG_TYPE])

    with app.app_context():
        app.register_blueprint(images)
        app.register_blueprint(projects)
        app.register_blueprint(labels)
        app.register_blueprint(regions)
        app.register_blueprint(train)
        app.register_blueprint(predict)

    return app