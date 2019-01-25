# Generated by Django 2.1.4 on 2019-01-24 11:20

from django.db import migrations, models
import django.db.models.deletion
import myapp.models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0002_colorscheme'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='active_color_scheme',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='myapp.ColorScheme'),
        ),
        migrations.AlterField(
            model_name='colorscheme',
            name='color_accent',
            field=models.CharField(default='#666666', help_text='Valid hexcode, ex: #666666', max_length=7, validators=[myapp.models.validate_color]),
        ),
        migrations.AlterField(
            model_name='colorscheme',
            name='color_base',
            field=models.CharField(default='#666666', help_text='Valid hexcode, ex: #666666', max_length=7, validators=[myapp.models.validate_color]),
        ),
        migrations.AlterField(
            model_name='colorscheme',
            name='color_bg',
            field=models.CharField(default='#666666', help_text='Valid hexcode, ex: #666666', max_length=7, validators=[myapp.models.validate_color]),
        ),
        migrations.AlterField(
            model_name='colorscheme',
            name='color_border',
            field=models.CharField(default='#666666', help_text='Valid hexcode, ex: #666666', max_length=7, validators=[myapp.models.validate_color]),
        ),
        migrations.AlterField(
            model_name='colorscheme',
            name='color_border_accent',
            field=models.CharField(default='#666666', help_text='ease submit valid hexcode, ex: #666666', max_length=7, validators=[myapp.models.validate_color]),
        ),
        migrations.AlterField(
            model_name='colorscheme',
            name='color_tertiary',
            field=models.CharField(default='#666666', help_text='Valid hexcode, ex: #666666', max_length=7, validators=[myapp.models.validate_color]),
        ),
        migrations.AlterField(
            model_name='colorscheme',
            name='color_text',
            field=models.CharField(default='#666666', help_text='Valid hexcode, ex: #666666', max_length=7, validators=[myapp.models.validate_color]),
        ),
        migrations.AlterField(
            model_name='colorscheme',
            name='color_text_highlight',
            field=models.CharField(default='#666666', help_text='Valid hexcode, ex: #666666', max_length=7, validators=[myapp.models.validate_color]),
        ),
        migrations.AlterField(
            model_name='colorscheme',
            name='color_text_invert',
            field=models.CharField(default='#666666', help_text='Valid hexcode, ex: #666666', max_length=7, validators=[myapp.models.validate_color]),
        ),
    ]