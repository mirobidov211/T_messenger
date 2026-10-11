from django.urls import path
from .views import RegisterView, LoginView, MeView, UserSearchView, ProfileUpdateView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', MeView.as_view(), name='me'),
    path('profile/', ProfileUpdateView.as_view(), name='profile'),
    path('search/', UserSearchView.as_view(), name='user-search'),
    path('users/search/', UserSearchView.as_view(), name='user-search-nested'),
]
