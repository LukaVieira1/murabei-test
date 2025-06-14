from typing import Dict, Any, Optional
import logging
from threading import Lock

logger = logging.getLogger(__name__)


class ServiceContainer:
    _instance: Optional['ServiceContainer'] = None
    _lock = Lock()
    
    def __new__(cls) -> 'ServiceContainer':
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(ServiceContainer, cls).__new__(cls)
                    cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self._services: Dict[str, Any] = {}
            self._factories: Dict[str, callable] = {}
            self._singletons: Dict[str, Any] = {}
            self._initialized = True
            logger.info("Service container initialized")
    
    def register_singleton(self, service_name: str, factory: callable) -> None:
        self._factories[service_name] = factory
        logger.debug(f"Registered singleton: {service_name}")
    
    def register_transient(self, service_name: str, factory: callable) -> None:
        self._services[service_name] = factory
        logger.debug(f"Registered transient: {service_name}")
    
    def get(self, service_name: str) -> Any:
        if service_name in self._factories:
            if service_name not in self._singletons:
                self._singletons[service_name] = self._factories[service_name]()
                logger.debug(f"Created singleton instance: {service_name}")
            return self._singletons[service_name]
        
        if service_name in self._services:
            instance = self._services[service_name]()
            logger.debug(f"Created transient instance: {service_name}")
            return instance
        
        raise ValueError(f"Service '{service_name}' not registered")
    
    def clear(self) -> None:
        self._services.clear()
        self._factories.clear()
        self._singletons.clear()
        logger.debug("Service container cleared")


container = ServiceContainer() 