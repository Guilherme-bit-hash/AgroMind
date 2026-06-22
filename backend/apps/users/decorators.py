# apps/users/decorators.py
# Python 3.12+ | Django 5.x

from functools import wraps
from django.shortcuts import redirect


def admin_required(view_func):
    """
    Decorator que protege views exclusivas de administradores.

    Fluxo:
    1. Se não estiver autenticado → redireciona para login.
    2. Se estiver autenticado mas não for admin → redireciona para dashboard
       com status 403 implícito (não revela a existência da página).
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect("users:login")
        if not request.user.is_admin:
            return redirect("users:dashboard")
        return view_func(request, *args, **kwargs)
    return wrapper