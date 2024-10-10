from django.urls import path
from .views import index, a_star

urlpatterns = [
    path('', index, name='index'),
    path('a_star/', a_star, name='a_star'),
]