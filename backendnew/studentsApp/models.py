# students/models.py
from django.db import models

class DegreeLevel(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name
    



    

class Student(models.Model):
    name = models.CharField(max_length=255)
    ssn = models.CharField(max_length=11, unique=True)
    cell_phone = models.CharField(max_length=15)
    email = models.EmailField(unique=True)
    photo = models.ImageField(upload_to='student_photos/')
    degree_level = models.ForeignKey(DegreeLevel, on_delete=models.CASCADE)
    emailsentflag = models.BooleanField(default=False)  # ✅ New field

    def __str__(self):
        return self.name
    
class Meta:
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['ssn']),
            models.Index(fields=['email']),
        ]
