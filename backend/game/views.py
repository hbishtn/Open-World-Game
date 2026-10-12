import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import Player


def _key(request):
    if not request.session.session_key:
        request.session.create()
    return request.session.session_key


# NOTE: csrf_exempt sirf dev demo ke liye hai. Login system lagane ke baad
# ise hata ke proper CSRF / token auth use karna.
@csrf_exempt
def player(request):
    key = _key(request)

    if request.method == "POST":
        try:
            data = json.loads(request.body or "{}")
            fields = {k: float(data[k]) for k in ("x", "z", "angle") if k in data}
        except (ValueError, TypeError):
            return JsonResponse({"ok": False}, status=400)
        Player.objects.update_or_create(session_key=key, defaults=fields)
        return JsonResponse({"ok": True})

    p = Player.objects.filter(session_key=key).first()
    data = None if p is None else {"x": p.x, "z": p.z, "angle": p.angle}
    return JsonResponse({"player": data})
