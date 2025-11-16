# students/serializers.py
from rest_framework import serializers
from .models import Student, DegreeLevel

class DegreeLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = DegreeLevel
        fields = '__all__'



class StudentSerializer(serializers.ModelSerializer):
    degree_level = DegreeLevelSerializer(read_only=True)
    degree_level_id = serializers.PrimaryKeyRelatedField(
        queryset=DegreeLevel.objects.all(), source='degree_level', write_only=True
    )
    photo = serializers.ImageField(required=False)

    class Meta:
        model = Student
        fields = ['id', 'name', 'ssn', 'email', 'cell_phone', 'photo', 'degree_level', 'degree_level_id','emailsentflag']


        

    """ def validate_email(self, value):
        if not value.endswith('@example.com'):
            raise serializers.ValidationError("Email must be from example.com domain.")
        return value    """




""" class DegreeLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = DegreeLevel
        fields = '__all__'

class StudentSerializer(serializers.ModelSerializer):
    degree_level = DegreeLevelSerializer()

    class Meta:
        model = Student
        fields = '__all__'
 """