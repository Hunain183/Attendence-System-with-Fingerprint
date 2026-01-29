"""
Shift configuration and utilities.
Defines work hours for each shift type.
"""

# Shift hours (in hours)
SHIFT_HOURS = {
    'D': 12,  # Day shift - 12 hours
    'A': 8,   # Shift A - 8 hours
    'B': 8,   # Shift B - 8 hours
    'C': 8,   # Shift C - 8 hours
    'G': 8,   # General shift - 8 hours
}

# Default shift if not specified
DEFAULT_SHIFT = 'G'
DEFAULT_SHIFT_HOURS = 8


def get_shift_hours(shift: str | None) -> int:
    """
    Get the number of hours for a given shift.
    
    Args:
        shift: Shift code (D, A, B, C, G)
        
    Returns:
        Number of hours for the shift
    """
    if not shift or shift not in SHIFT_HOURS:
        return DEFAULT_SHIFT_HOURS
    return SHIFT_HOURS[shift.upper()]


def calculate_overtime(total_minutes: int, shift: str | None) -> tuple[bool, int]:
    """
    Calculate if overtime occurred and how many minutes.
    
    Args:
        total_minutes: Total minutes worked
        shift: Shift code (D, A, B, C, G)
        
    Returns:
        Tuple of (is_overtime, overtime_minutes)
    """
    shift_hours = get_shift_hours(shift)
    shift_minutes = shift_hours * 60
    
    if total_minutes > shift_minutes:
        return (True, total_minutes - shift_minutes)
    return (False, 0)
