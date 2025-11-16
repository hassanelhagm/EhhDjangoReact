# students/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, DegreeLevelViewSet
from .views import send_student_email
from .views import reset_email_flags,upload_image





router = DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'degree-levels', DegreeLevelViewSet)

urlpatterns = [
    path('students/reset_email_flags/', reset_email_flags),
     path('students/upload_image/', upload_image),  # ✅ Matches your frontend call
    path('', include(router.urls)),
   
    path('students/send_student_email/<int:pk>/', send_student_email),
    
           

]
