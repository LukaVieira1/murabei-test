import os
from typing import Dict, Any


class Config:
    
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    DEBUG = False
    TESTING = False
    
    DATABASE_PATH = os.environ.get('DATABASE_PATH') or 'db.sqlite'
    
    DEFAULT_PAGE_SIZE = 10
    MAX_PAGE_SIZE = 100
    
    CORS_ORIGINS = ["http://localhost:3000", "http://frontend:3000"]
    
    LOG_LEVEL = os.environ.get('LOG_LEVEL') or 'INFO'


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


class TestingConfig(Config):
    TESTING = True
    DATABASE_PATH = ':memory:'


config_by_name: Dict[str, Any] = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}


def get_config() -> Config:
    env = os.environ.get('FLASK_ENV', 'default')
    return config_by_name.get(env, DevelopmentConfig) 