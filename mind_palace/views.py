import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db import IntegrityError
from django.http import JsonResponse, HttpResponseRedirect
from django.shortcuts import redirect, render
from django.urls import reverse
from .image_maps import ROOM_IMAGE_MAPS
from .constants import palaces, rooms

from .models import User, Palace, Room, Item, Subtopic


def index(request):
    return render(request, "mind_palace/index.html")

@login_required
def palace_view(request):
    user_palaces = Palace.objects.filter(user=request.user)
    return render(request, "mind_palace/palaces.html", {
        "palaces": user_palaces
    })

@login_required
def room_view(request, palace_id):
    try:
        palace = Palace.objects.get(pk=palace_id)
    except Palace.DoesNotExist:
        return JsonResponse({"error": "Palace not found."}, status=404)

    if palace.user != request.user: 
        return render(request, "mind_palace/error.html")
    user_rooms = Room.objects.filter(palace=palace)
    return render(request, "mind_palace/rooms.html", {
        "rooms": user_rooms,
        "palace_id": palace_id
    })

@login_required
def single_room_view(request, palace_id, room_id):
    try:
        palace = Palace.objects.get(pk=palace_id)
        room = Room.objects.get(pk=room_id)
    except Palace.DoesNotExist:
        return JsonResponse({"error": "Palace not found."}, status=404)
    except Room.DoesNotExist:
        return JsonResponse({"error": "Room not found."}, status=404)

    if palace.user != request.user or room.palace.user != request.user: 
        return render(request, "mind_palace/error.html")
    
    try:
        areas = ROOM_IMAGE_MAPS[room.name]["map"]
    except KeyError as e:
        print(e)
        messages.warning(request, "Image not mapped.")
        return render(request, "mind_palace/single_room.html", {
            "room": room
        })
    return render(request, "mind_palace/single_room.html", {
        "room": room,
        "areas": areas
    })


@login_required
def item_view(request, room_id=None, item_name=None, item_id=None):

    # Creating topic
    if request.method == "POST":
        if room_id and item_name:
            try:
                data = json.loads(request.body)

                room = Room.objects.get(pk=room_id)
                name = data.get("name")
                title = data.get("title")

                item = Item.objects.create(room=room, name=name, title=title)
                return JsonResponse({"id": item.id, "title": item.title}, status=201)
            except Room.DoesNotExist:
                return JsonResponse({"error": "Room not found."}, status=404)
        else:
            return JsonResponse({"error": "Room id and Item name are required for creating a topic."}, status=400)
    
    # Renaming topic
    if request.method == "PUT":
        if item_id:
            try:
                data = json.loads(request.body)

                item = Item.objects.get(pk=item_id)
                item.title = data.get("title")
                item.save()

                return JsonResponse({"message": "Topic renamed successfully.", "Topic": item.title}, status=200)
            except Room.DoesNotExist:
                return JsonResponse({"error": "Item not found."}, status=404)
        else:
            return JsonResponse({"error": "Item id is required for updates."}, status=400)
    
    # Retrieving subtopics within an item
    else:
        try:
            room = Room.objects.get(pk=room_id)
            item = Item.objects.get(room=room, name=item_name)
            subtopics = Subtopic.objects.filter(item=item)

            if room.palace.user != request.user:
                return render(request, "mind_palace/error.html")
            
            subtopics_data = [subtopic.serialize() for subtopic in subtopics]
            return JsonResponse({"id": item.id, "title": item.title, "topics": subtopics_data}, safe=False)

        except Exception as e:
            return JsonResponse({"error": "No data found."}, status=404)

@login_required
def subtopic_view(request, id):

    # Adding subtopic
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            item = Item.objects.get(pk=id)
            title = data.get("title")
            content = data.get("content")
            subtopic = Subtopic.objects.create(item=item, title=title, content=content)
            return JsonResponse({"id": subtopic.id, "title": subtopic.title, "content": subtopic.content}, status=201)
        except Item.DoesNotExist:
            return JsonResponse({"error": "Item not found."}, status=404)
    
    # Editing subtopic
    elif request.method == "PUT":
        try:
            data = json.loads(request.body)
            subtopic = Subtopic.objects.get(pk=id)
            subtopic.title = data.get("title")
            subtopic.content = data.get("content")
            subtopic.save()
            return JsonResponse({"id": subtopic.id, "title": subtopic.title, "content": subtopic.content}, status=200)
        except Subtopic.DoesNotExist:
            return JsonResponse({"error": "Subtopic not found."}, status=404)
        
    # Deleting subtopic
    elif request.method == "DELETE":
        try:
            subtopic = Subtopic.objects.get(pk=id)
            deleted_id = subtopic.id
            subtopic.delete()
            return JsonResponse({"message": "Subtopic deleted successfully", "id": deleted_id}, status=200)
        
        except Subtopic.DoesNotExist:
            return JsonResponse({"error": "Subtopic not found."}, status=404)
        
    else:
        return JsonResponse({"error": "Invalid request method."}, status=405)

@login_required
def palace_selection_view(request):
    if request.method == "POST":
        user = request.user
        name = request.POST["name"]
        image = request.POST["image"]

        if Palace.objects.filter(user=user, name=name).exists():
            messages.info(request, "You have already added this palace to your list.") 
            return redirect(reverse("palace"))

        Palace.objects.create(user=user, name=name, image=image)
        return redirect(reverse("palace"))
    else:
        return render(request, "mind_palace/palace_selection.html", {
            "palaces": palaces
        })
    
@login_required
def room_selection_view(request, palace_id):
    try:
        palace = Palace.objects.get(pk=palace_id)
    except Palace.DoesNotExist:
        return JsonResponse({"error": "Palace not found."}, status=404)

    if request.method == "POST":
        name = request.POST["name"]
        image = request.POST["image"]

        if Room.objects.filter(palace=palace, name=name).exists():
            messages.info(request, "You have already added this room to your list.") 
            return redirect(reverse("room", args=[palace_id]))

        Room.objects.create(palace=palace, name=name, image=image)
        return redirect(reverse("room", args=[palace_id]))
    else:
        if palace.user != request.user: 
            return render(request, "mind_palace/error.html")
        return render(request, "mind_palace/room_selection.html", {
            "rooms": rooms[palace.name],
            "palace_id": palace_id
        })

def login_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        
        # Authenticate using username directly
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect(reverse("index"))
        else:
            return render(request, "mind_palace/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "mind_palace/login.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

def register(request):
    if request.method == "POST":
        username = request.POST["username"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "mind_palace/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username=username, password=password)
            user.save()
        except IntegrityError as e:
            print(e)
            return render(request, "mind_palace/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "mind_palace/register.html")
