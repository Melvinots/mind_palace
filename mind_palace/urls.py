
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("palaces", views.palace_view, name="palace"),
    path("palaces/select", views.palace_selection_view, name="palace_selection"),
    path("palaces/<int:palace_id>/rooms", views.room_view, name="room"),
    path("palaces/<int:palace_id>/rooms/select", views.room_selection_view, name="room_selection"),
    path("palaces/<int:palace_id>/rooms/<int:room_id>", views.single_room_view, name="single_room"),
    path("items/<int:room_id>/<str:item_name>", views.item_view, name="item"),
    path("items/<int:item_id>", views.item_view, name="item"),
    path("subtopics/<int:id>", views.subtopic_view, name="subtopic"),
]
