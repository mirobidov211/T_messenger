from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

from apps.accounts.views import UserSearchView

def health_check(request):
    return JsonResponse({
        "status": "ok",
        "message": "Messenger Backend API is running successfully!"
    })

urlpatterns = [
    path('', health_check, name='root-health-check'),
    path('api/', health_check, name='api-health-check'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/users/search/', UserSearchView.as_view(), name='users-search'),
    path('api/chats/', include('apps.chats.urls')),
    path('i18n/', include('django.conf.urls.i18n')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
