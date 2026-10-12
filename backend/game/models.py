from django.db import models


class Player(models.Model):
    # Abhi login nahi hai, isliye browser session se player pehchante hain.
    # Baad mein ise User (ForeignKey) se badal dena.
    session_key = models.CharField(max_length=40, unique=True)
    x = models.FloatField(default=0)
    z = models.FloatField(default=0)
    angle = models.FloatField(default=3.14159)
    updated_at = models.DateTimeField(auto_now=True)
