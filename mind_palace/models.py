from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Palace(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='palaces')
    name = models.CharField(max_length=255)
    image = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.name} by {self.user.username}"

class Room(models.Model):
    palace = models.ForeignKey(Palace, on_delete=models.CASCADE, related_name='rooms')
    name = models.CharField(max_length=255)
    image = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.name} by {self.palace.user.username}"

class Item(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=255)
    title = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return f"{self.name} in {self.room.name} of {self.room.palace.user.username}"
    
class Subtopic(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='subtopics')
    title = models.CharField(max_length=200)
    content = models.TextField(blank=True, null=True)

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content
        }

    def __str__(self):
        return f"{self.title}"