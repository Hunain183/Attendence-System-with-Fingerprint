"""
Shift configuration and utilities.
Defines work hours for each shift type.
"""

# Shift definitions with start/end times and hours
SHIFT_CONFIG = {
    'A(12)': {'start': '06:00', 'end': '18:00', 'hours': 12},  # 6:00 AM - 6:00 PM
    'B(12)': {'start': '18:00', 'end': '06:00', 'hours': 12},  # 6:00 PM - 6:00 AM
    'E': {'start': '14:00', 'end': '22:00', 'hours': 8},       # 2:00 PM - 10:00 PM
    'G(Off)': {'start': '09:00', 'end': '17:30', 'hours': 8.5}, # 9:00 AM - 5:30 PM
    'G': {'start': '08:00', 'end': '16:00', 'hours': 8},       # 8:00 AM - 4:00 PM
    'M': {'start': '06:00', 'end': '14:00', 'hours': 8},       # 6:00 AM - 2:00 PM
    'N': {'start': '22:00', 'end': '06:00', 'hours': 8},       # 10:00 PM - 6:00 AM
}

# Shift hours (in hours) - for backward compatibility
SHIFT_HOURS = {k: v['hours'] for k, v in SHIFT_CONFIG.items()}

# Default shift if not specified
DEFAULT_SHIFT = 'G'
DEFAULT_SHIFT_HOURS = 8


def get_shift_hours(shift: str | None) -> float:
    """
    Get the number of hours for a given shift.
    
    Args:
        shift: Shift code (A(12), B(12), E, G(Off), G, M, N)
        
    Returns:
        Number of hours for the shift
    """
    if not shift:
        return DEFAULT_SHIFT_HOURS
    # Check exact match first
    if shift in SHIFT_HOURS:
        return SHIFT_HOURS[shift]
    # Check uppercase
    if shift.upper() in SHIFT_HOURS:
        return SHIFT_HOURS[shift.upper()]
    return DEFAULT_SHIFT_HOURS


def get_shift_config(shift: str | None) -> dict | None:
    """
    Get the full configuration for a shift.
    
    Args:
        shift: Shift code
        
    Returns:
        Dict with start, end, hours or None
    """
    if not shift:
        return None
    if shift in SHIFT_CONFIG:
        return SHIFT_CONFIG[shift]
    if shift.upper() in SHIFT_CONFIG:
        return SHIFT_CONFIG[shift.upper()]
    return None


def calculate_overtime(total_minutes: int, shift: str | None) -> tuple[bool, int]:
    """
    Calculate if overtime occurred and how many minutes.
    
    Args:
        total_minutes: Total minutes worked
        shift: Shift code
        
    Returns:
        Tuple of (is_overtime, overtime_minutes)
    """
    shift_hours = get_shift_hours(shift)
    shift_minutes = int(shift_hours * 60)
    
    if total_minutes > shift_minutes:
        return (True, total_minutes - shift_minutes)
    return (False, 0)
