import time
import uuid
import logging
from flask import request, g
from functools import wraps

logger = logging.getLogger(__name__)


def setup_request_logging(app):
    
    @app.before_request
    def before_request():
        g.start_time = time.time()
        g.request_id = str(uuid.uuid4())[:8]
        
        logger.info(
            f"[{g.request_id}] {request.method} {request.path} - "
            f"IP: {request.remote_addr} - "
            f"User-Agent: {request.headers.get('User-Agent', 'Unknown')}"
        )
        
 
        if request.method in ['POST', 'PUT'] and request.is_json:
            safe_data = {k: v for k, v in request.get_json().items() 
                        if k not in ['password', 'token', 'secret']}
            logger.debug(f"[{g.request_id}] Request body: {safe_data}")
    
    @app.after_request
    def after_request(response):

        if hasattr(g, 'start_time') and hasattr(g, 'request_id'):
            duration = round((time.time() - g.start_time) * 1000, 2)
            
            log_level = logging.INFO
            if response.status_code >= 400:
                log_level = logging.WARNING
            if response.status_code >= 500:
                log_level = logging.ERROR
            if duration > 1000:
                log_level = logging.WARNING
            
            logger.log(
                log_level,
                f"[{g.request_id}] {request.method} {request.path} - "
                f"Status: {response.status_code} - "
                f"Duration: {duration}ms"
            )
            
            response.headers['X-Request-ID'] = g.request_id
        
        return response
    
    @app.errorhandler(Exception)
    def log_exception(error):

        if hasattr(g, 'request_id'):
            logger.error(
                f"[{g.request_id}] Unhandled exception in {request.method} {request.path}: {error}",
                exc_info=True
            )
        else:
            logger.error(f"Unhandled exception: {error}", exc_info=True)
        
        raise error


def log_service_calls(service_name: str):

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            request_id = getattr(g, 'request_id', 'no-request')
            
            logger.debug(
                f"[{request_id}] Calling {service_name}.{func.__name__} "
                f"with args: {args[1:]} kwargs: {kwargs}"
            )
            
            try:
                result = func(*args, **kwargs)
                duration = round((time.time() - start_time) * 1000, 2)
                
                logger.debug(
                    f"[{request_id}] {service_name}.{func.__name__} "
                    f"completed in {duration}ms"
                )
                
                return result
            except Exception as e:
                duration = round((time.time() - start_time) * 1000, 2)
                logger.error(
                    f"[{request_id}] {service_name}.{func.__name__} "
                    f"failed after {duration}ms: {e}"
                )
                raise
        
        return wrapper
    return decorator 