from abc import ABC, abstractmethod
from typing import Dict, Any, List, Tuple


class BaseFilter(ABC):
    def __init__(self, field_name: str, operator: str = "LIKE"):    
        self.field_name = field_name
        self.operator = operator
    
    @abstractmethod
    def apply(self, value: Any) -> Tuple[str, List[Any]]:
        pass
    
    @abstractmethod
    def is_valid(self, value: Any) -> bool:
        pass


class FilterCombiner:
  
    
    def __init__(self, filters: List[BaseFilter], combiner: str = "AND"):
        
        self.filters = filters
        self.combiner = combiner.upper()
        
        if self.combiner not in ["AND", "OR"]:
            raise ValueError("Combiner must be 'AND' or 'OR'")
    
    def build_query(self, filter_values: Dict[str, Any]) -> Tuple[str, List[Any]]:
        
        conditions = []
        parameters = []
        
        for filter_obj in self.filters:
            field_value = filter_values.get(filter_obj.field_name)
          
            if field_value is None or not filter_obj.is_valid(field_value):
                continue
            
            condition, params = filter_obj.apply(field_value)
            conditions.append(condition)
            parameters.extend(params)
        
        if not conditions:
            return "", []
        
        where_clause = f" WHERE {f' {self.combiner} '.join(conditions)}"
        return where_clause, parameters 