"""URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include

# Page Error Handlers
handler400 = 'myapp.views.handler400' # pylint: disable=invalid-name
handler403 = 'myapp.views.handler403' # pylint: disable=invalid-name
handler404 = 'myapp.views.handler404' # pylint: disable=invalid-name
handler500 = 'myapp.views.handler500' # pylint: disable=invalid-name

# Admin site access is through gifnoc. This is changed from the default.
urlpatterns = [
    path('gifnoc/', admin.site.urls),
    path('', include('myapp.urls')),
]
