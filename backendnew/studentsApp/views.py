# students/views.py
from rest_framework import viewsets, filters, status
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.core.files.storage import default_storage
from django.core.mail import EmailMessage
from django.core.mail import EmailMultiAlternatives
from email.mime.image import MIMEImage
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.shortcuts import get_object_or_404

from .models import Student, DegreeLevel
from .serializers import StudentSerializer, DegreeLevelSerializer
from rest_framework.permissions import IsAuthenticated

# ✅ Standalone image upload view for TinyMCE
@csrf_exempt
@api_view(['POST'])
@parser_classes([MultiPartParser])
def upload_image(request):
    image = request.FILES.get('image')
    if not image:
        return Response({'error': 'No image uploaded'}, status=400)

    path = default_storage.save(f'email_images/{image.name}', image)
    image_url = request.build_absolute_uri(default_storage.url(path))
    return Response({'location': image_url})


# ✅ Send email to a single student
@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_student_email(request, pk):
    try:
        student = get_object_or_404(Student, pk=pk)
        subject = request.data.get('subject')
        body = request.data.get('body')
        attachments = request.FILES.getlist('attachments')

        if not subject or not body:
            return Response({'error': 'Subject and body are required.'}, status=400)

        email = EmailMessage(
            subject=subject,
            body=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[student.email],
        )
        email.content_subtype = "html"

        for file in attachments:
            if file.content_type.startswith('image/'):
                mime_image = MIMEImage(file.read(), _subtype=file.content_type.split('/')[1])
                mime_image.add_header('Content-ID', '<student_photo>')
                mime_image.add_header('Content-Disposition', 'inline', filename=file.name)
                email.attach(mime_image)
            else:
                email.attach(file.name, file.read(), file.content_type)

        email.send()
        student.emailsentflag = True
        student.save()

        return Response({'status': f'Email sent to {student.email}'}, status=status.HTTP_200_OK)

    except Student.DoesNotExist:
        return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ✅ Reset all email flags
@csrf_exempt
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def reset_email_flags(request):
    if request.method == 'GET':
        return Response({'message': 'GET works'})
    Student.objects.update(emailsentflag=False)
    return Response({'status': 'All email flags reset'})


# ✅ Student ViewSet for listing and filtering
class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['degree_level']
    search_fields = ['name', 'ssn', 'email']

    def get_queryset(self):
        queryset = Student.objects.all()
        name = self.request.query_params.get('name', '').strip()
        ssn = self.request.query_params.get('ssn', '').strip()
        degree_level = self.request.query_params.get('degree_level')

        if name:
            queryset = queryset.filter(name__istartswith=name)
        if ssn:
            queryset = queryset.filter(ssn__istartswith=ssn)
        if degree_level:
            queryset = queryset.filter(degree_level=degree_level)
        return queryset


# ✅ DegreeLevel ViewSet
class DegreeLevelViewSet(viewsets.ModelViewSet):
    queryset = DegreeLevel.objects.all()
    serializer_class = DegreeLevelSerializer




